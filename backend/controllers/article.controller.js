import Article from "../models/article.model.js";
import { adminFromRequest } from "../middleware/auth.middleware.js";
import { notify } from "./notification.controller.js";
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

  return filter;
};

/**
 * Which articles the caller may read. Drafts are admin-only, and `?published=true` wins even
 * for the admin (the public pages send it, so SSR — which has no token — and the browser agree).
 * Checked first so those public calls skip the token lookup.
 */
const visibleScope = async (req) => {
  const { published } = req.query;

  if (isTrue(published) || !(await adminFromRequest(req))) return { published: true };

  return published === undefined ? {} : { published: false };
};

// `scope` (from visibleScope) keeps drafts out of a visitor's facet counts.
const tagFacet = async (scope) => {
  const trimmed = { $trim: { input: "$tags" } };

  const rows = await Article.aggregate([
    { $match: scope },
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

const readingTimeFacet = async (scope) => {
  const rows = await Article.aggregate([
    { $match: scope },
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
    const scope = await visibleScope(req);
    const filter = { ...buildArticleFilter(req.query), ...scope };
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
      tagFacet(scope),
      readingTimeFacet(scope),
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

/** One place for the three counter endpoints: update by slug, 404 or answer. */
const updateStats = async (req, res, update, reply) => {
  try {
    // Views / likes only count on published articles; the admin-only reset may touch drafts.
    const match = { slug: req.params.slug, ...(!req.admin && { published: true }) };
    const article = await Article.findOneAndUpdate(match, update, {
      returnDocument: "after",
      // Mongoose 9 refuses an aggregation-pipeline update without this opt-in.
      ...(Array.isArray(update) && { updatePipeline: true }),
    }).select("views likes title slug");

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(reply(article));
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/** Called once per reader when the article page opens. */
export const registerArticleView = (req, res) =>
  updateStats(req, res, { $inc: { views: 1 } }, (article) => ({ views: article.views }));

/** `{ liked: true }` adds a like, `{ liked: false }` takes it back. */
export const toggleArticleLike = (req, res) => {
  const liked = req.body?.liked !== false;

  // Pipeline update so a stale "unlike" is floored at 0 in the same atomic write.
  return updateStats(
    req,
    res,
    [{ $set: { likes: { $max: [0, { $add: [{ $ifNull: ["$likes", 0] }, liked ? 1 : -1] }] } } }],
    (article) => {
      // Only a new like is news; an unlike stays silent.
      if (liked) {
        notify({
          type: "like",
          title: "New like on your article",
          message: article.title,
          link: `/admin/articles/${article.slug}`,
        });
      }

      return { likes: article.likes, liked };
    },
  );
};

/**
 * Admin-only: wipe the engagement counters. `{ views: false }` / `{ likes: false }`
 * keeps one of them; the default clears both.
 */
export const resetArticleStats = (req, res) => {
  const reset = {};

  if (req.body?.views !== false) reset.views = 0;
  if (req.body?.likes !== false) reset.likes = 0;

  return updateStats(req, res, reset, (article) => ({
    message: "Article stats cleared successfully",
    views: article.views,
    likes: article.likes,
  }));
};

export const getArticleBySlug = async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, ...(await visibleScope(req)) });

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
