import Project from "../models/project.model.js";
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

const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const createUniqueSlug = async (title, projectId = null) => {
  let slug = generateSlug(title);
  let uniqueSlug = slug;
  let count = 1;

  while (
    await Project.findOne({
      slug: uniqueSlug,
      ...(projectId && { _id: { $ne: projectId } }),
    })
  ) {
    uniqueSlug = `${slug}-${count}`;
    count++;
  }

  return uniqueSlug;
};

export const createProject = async (req, res) => {
  try {
    const {
      title,
      overview,
      description,
      category,
      projectDate,
      technologies,
      liveUrl,
      githubUrl,
    } = req.body;

    if (!title || !overview || !description || !category) {
      return res.status(400).json({
        message: "Title, overview, description and category are required",
      });
    }

    // if (!title || !description || !category) {
    //   return res
    //     .status(400)
    //     .json({ message: "All required fields are missing" });
    //   // return res.status(400).json({
    //   //   message: "Title, description and category are required",
    //   // });
    // }

    // Get both uploaded images
    const projectCardImage = req.files?.projectCardImage?.[0];
    const projectDetailImage = req.files?.image?.[0];

    if (!projectCardImage) {
      return res.status(400).json({
        message: "Project card image is required",
      });
    }

    if (!projectDetailImage) {
      return res.status(400).json({
        message: "Project detail image is required",
      });
    }

    let parsedTechnologies = [];

    if (technologies) {
      try {
        parsedTechnologies = JSON.parse(technologies);
      } catch {
        return res.status(400).json({
          message: "Invalid technologies format",
        });
      }
    }

    const slug = await createUniqueSlug(title);

    const project = await Project.create({
      title,
      slug,
      projectDate: projectDate || new Date(),
      overview,
      description,
      category,
      projectCardImage: projectCardImage.path,
      image: projectDetailImage.path,
      technologies: parsedTechnologies,
      liveUrl,
      githubUrl,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// export const createProject = async (req, res) => {
//   try {
//     const { title, description, category, technologies, liveUrl, githubUrl } =
//       req.body;

//     if (!req.file) {
//       return res.status(400).json({ message: "Project image is required" });
//     }

//     const project = await Project.create({
//       title,
//       description,
//       category,
//       image: req.file.path,
//       technologies: technologies ? JSON.parse(technologies) : [],
//       liveUrl,
//       githubUrl,
//     });

//     res.status(201).json({
//       message: "Project created successfully",
//       project,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// Query params: search, category, technology, dateFrom, dateTo, createdFrom,
// createdTo, page, limit, sort, countOnly. Lists accept "a,b" or repeated keys.
const buildProjectFilter = (query) => {
  const filter = {};
  const search = (query.search || "").trim();

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { title: regex },
      { category: regex },
      { overview: regex },
      { technologies: regex },
    ];
  }

  const categories = parseList(query.category);
  if (categories.length) filter.category = { $in: anyOfRegex(categories) };

  const technologies = parseList(query.technology);
  if (technologies.length) filter.technologies = { $in: anyOfRegex(technologies) };

  const projectDate = buildDateRange(query.dateFrom, query.dateTo);
  if (projectDate) filter.projectDate = projectDate;

  const createdAt = buildDateRange(query.createdFrom, query.createdTo);
  if (createdAt) filter.createdAt = createdAt;

  return filter;
};

// Distinct values with counts, so the client can render the filter drawer
// without holding the whole collection in memory.
const distinctFacet = async (field, unwind = false) => {
  const trimmed = { $trim: { input: `$${field}` } };

  const rows = await Project.aggregate([
    ...(unwind ? [{ $unwind: `$${field}` }] : []),
    { $match: { [field]: { $nin: [null, ""] } } },
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

export const getProjects = async (req, res) => {
  try {
    const filter = buildProjectFilter(req.query);
    const { page, limit, skip } = parsePagination(req.query);
    const sort = parseSort(req.query, "createdAt", "desc");

    // countOnly powers the "Total Results" preview while filters are being picked.
    if (isTrue(req.query.countOnly)) {
      const total = await Project.countDocuments(filter);

      return res.json({
        items: [],
        total,
        page,
        limit,
        totalPages: totalPages(total, limit),
        filters: { categories: [], technologies: [] },
      });
    }

    const projectQuery = Project.find(filter).sort(sort);
    if (limit) projectQuery.skip(skip).limit(limit);

    const [items, total, categories, technologies] = await Promise.all([
      projectQuery.exec(),
      Project.countDocuments(filter),
      distinctFacet("category"),
      distinctFacet("technologies", true),
    ]);

    res.json({
      items,
      total,
      page,
      limit,
      totalPages: totalPages(total, limit),
      filters: { categories, technologies },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const getProjectById = async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id);

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     res.json(project);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

export const updateProject = async (req, res) => {
  try {
    const {
      title,
      overview,
      description,
      category,
      projectDate,
      technologies,
      liveUrl,
      githubUrl,
    } = req.body;

    const updateData = {
      title,
      overview,
      description,
      category,
      projectDate,
      liveUrl,
      githubUrl,
    };

    if (title) {
      updateData.slug = await createUniqueSlug(title, req.params.id);
    }

    if (technologies) {
      try {
        updateData.technologies = JSON.parse(technologies);
      } catch {
        return res.status(400).json({ message: "Invalid technologies format" });
      }
    }

    // if (technologies) {
    //   updateData.technologies = JSON.parse(technologies);
    // }

    // Update project card image if new image uploaded
    if (req.files?.projectCardImage?.[0]) {
      updateData.projectCardImage =
        req.files.projectCardImage[0].path;
    }

    // Update project detail image if new image uploaded
    if (req.files?.image?.[0]) {
      updateData.image = req.files.image[0].path;
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
    //   // new: true,
    //   returnDocument: "after",
    // });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
