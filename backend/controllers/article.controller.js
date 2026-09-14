import Article from "../models/article.model.js";
import {
  anyOfRegex,
  buildDateRange,
  escapeRegex,
  isTrue,
  parseList,
  parsePagination,
  parseSort,
  totalPages,
} from "../utils/queryFilters.js";

// Reading-time buckets offered by the filter drawer, in minutes.
const READING_TIME_BUCKETS = [
  { id: "under-3", label: "Under 3 min", min: 0, max: 3 },
  { id: "3-6", label: "3 - 6 min", min: 3, max: 6 },
  { id: "over-6", label: "Over 6 min", min: 6, max: null },
];

function calculateReadingTime(content) {
  const plainText = content.replace(/<[^>]*>/g, "");
  const words = plainText.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const createArticle = async (req, res) => {
  try {
    const article = await Article.create({
      title: req.body.title,
      slug: req.body.slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      published: req.body.published ?? true,
      image: req.file?.path || "",
      estimatedReadingTime: calculateReadingTime(req.body.content),
    });

    res.status(201).json({
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// export const createBlog = async (req, res) => {
//   try {
//     const blog = await Blog.create(req.body);

//     res.status(201).json({
//       message: "Blog created successfully",
//       blog,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// Query params: search, tag, readingTime, createdFrom, createdTo, published,
// page, limit, sort, countOnly. Lists accept "a,b" or repeated keys.
const buildArticleFilter = (query) => {
  const filter = {};
  const search = (query.search || "").trim();

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");

    filter.$or = [{ title: regex }, { excerpt: regex }, { tags: regex }];
  }

  const tags = parseList(query.tag);
  if (tags.length) filter.tags = { $in: anyOfRegex(tags) };

  const buckets = parseList(query.readingTime)
    .map((id) => READING_TIME_BUCKETS.find((bucket) => bucket.id === id))
    .filter(Boolean);

  // Wrapped in $and so it cannot clash with the search $or above.
  if (buckets.length) {
    filter.$and = [
      {
        $or: buckets.map((bucket) => ({
          estimatedReadingTime: {
            $gte: bucket.min,
            ...(bucket.max === null ? {} : { $lt: bucket.max }),
          },
        })),
      },
    ];
  }

  const createdAt = buildDateRange(query.createdFrom, query.createdTo);
  if (createdAt) filter.createdAt = createdAt;

  if (query.published !== undefined) filter.published = isTrue(query.published);

  return filter;
};

const tagFacet = async () => {
  const trimmed = { $trim: { input: "$tags" } };

  const rows = await Article.aggregate([
    { $unwind: "$tags" },
    { $match: { tags: { $nin: [null, ""] } } },
    {
      $group: {
        _id: { $toLower: trimmed },
        label: { $first: trimmed },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return rows.map((row) => ({ value: row._id, label: row.label, count: row.count }));
};

const readingTimeFacet = async () => {
  const rows = await Article.aggregate([
    {
      $group: {
        _id: {
          $switch: {
            branches: READING_TIME_BUCKETS.filter((bucket) => bucket.max !== null).map(
              (bucket) => ({
                case: { $lt: ["$estimatedReadingTime", bucket.max] },
                then: bucket.id,
              }),
            ),
            default: "over-6",
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  return READING_TIME_BUCKETS.map((bucket) => ({
    value: bucket.id,
    label: bucket.label,
    count: rows.find((row) => row._id === bucket.id)?.count ?? 0,
  }));
};

export const getArticles = async (req, res) => {
  try {
    const filter = buildArticleFilter(req.query);
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, "createdAt", "desc");

    // countOnly powers the "Total Results" preview while filters are being picked.
    if (isTrue(req.query.countOnly)) {
      const total = await Article.countDocuments(filter);

      return res.status(200).json({
        items: [],
        total,
        page,
        limit,
        totalPages: totalPages(total, limit),
        filters: { tags: [], readingTimes: [] },
      });
    }

    const articleQuery = Article.find(filter).sort(sort);
    if (limit) articleQuery.skip(skip).limit(limit);

    const [items, total, tags, readingTimes] = await Promise.all([
      articleQuery.exec(),
      Article.countDocuments(filter),
      tagFacet(),
      readingTimeFacet(),
    ]);

    res.status(200).json({
      items,
      total,
      page,
      limit,
      totalPages: totalPages(total, limit),
      filters: { tags, readingTimes },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// export const getBlogById = async (req, res) => {
//   try {
//     const blog = await Blog.findById(req.params.id);

//     if (!blog) {
//       return res.status(404).json({
//         message: "Blog not found",
//       });
//     }

//     res.status(200).json(blog);
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

export const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({
      slug: req.params.slug,
    });

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      slug: req.body.slug,
      excerpt: req.body.excerpt,
      content: req.body.content,
      published: req.body.published,
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      estimatedReadingTime: calculateReadingTime(req.body.content),
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const article = await Article.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
    });

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    res.status(200).json({
      message: "Article updated successfully",
      article,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// export const updateBlog = async (req, res) => {
//   try {
//     const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });

//     if (!blog) {
//       return res.status(404).json({
//         message: "Blog not found",
//       });
//     }

//     res.status(200).json({
//       message: "Blog updated successfully",
//       blog,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        message: "Article not found",
      });
    }

    res.status(200).json({
      message: "Article deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
