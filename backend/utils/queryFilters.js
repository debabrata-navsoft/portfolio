// Helpers shared by the list endpoints that support search / filter / pagination.

export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Accepts ?tag=a,b or repeated ?tag=a&tag=b
export const parseList = (value) => {
  if (!value) return [];

  const raw = Array.isArray(value) ? value : String(value).split(",");

  return raw.map((item) => String(item).trim()).filter(Boolean);
};

// Case-insensitive exact match for any of the given values.
export const anyOfRegex = (values) =>
  values.map((value) => new RegExp(`^${escapeRegex(value)}$`, "i"));

// Builds a { $gte, $lte } range from YYYY-MM-DD bounds; returns null when both
// are empty. A date-only string parses as UTC midnight, so the upper bound is
// stretched to the end of that same UTC day (not the server's local day).
export const buildDateRange = (from, to) => {
  const range = {};

  if (from) {
    const start = new Date(from);
    if (!Number.isNaN(start.getTime())) range.$gte = start;
  }

  if (to) {
    const end = new Date(to);

    if (!Number.isNaN(end.getTime())) {
      end.setUTCHours(23, 59, 59, 999);
      range.$lte = end;
    }
  }

  return Object.keys(range).length ? range : null;
};

// limit 0 means "no pagination" so the old un-paged callers keep working.
export const parsePagination = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 0;

  return { page, limit, skip: limit ? (page - 1) * limit : 0 };
};

export const totalPages = (total, limit) => {
  if (limit) return Math.ceil(total / limit);

  return total ? 1 : 0;
};

export const isTrue = (value) => value === true || value === "true" || value === "1";

// Distinct values of `field` with counts, so the client can render the filter drawer
// without holding the whole collection in memory. `scope` keeps hidden docs (drafts,
// inactive projects) out of a visitor's counts; `unwind` is for array fields.
export const distinctFacet = async (Model, field, scope, unwind = false) => {
  const trimmed = { $trim: { input: `$${field}` } };

  const rows = await Model.aggregate([
    { $match: scope },
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

// Parses sort parameters supporting ?sortBy=createdAt&sortOrder=asc/desc or ?sort=oldest/newest/asc/desc
export const parseSort = (query, defaultField = "createdAt", defaultOrder = "desc") => {
  if (!query) return { [defaultField]: defaultOrder === "asc" ? 1 : -1 };

  if (query.sort === "oldest") return { createdAt: 1 };
  if (query.sort === "newest") return { createdAt: -1 };

  const sortBy = query.sortBy || (query.sort && query.sort !== "asc" && query.sort !== "desc" ? query.sort : null) || defaultField;
  const rawOrder = query.sortOrder || query.order || (query.sort === "asc" || query.sort === "desc" ? query.sort : defaultOrder);
  const direction = String(rawOrder).toLowerCase() === "asc" || String(rawOrder) === "1" ? 1 : -1;

  const sortObj = { [sortBy]: direction };
  if (sortBy !== "_id" && sortBy !== "createdAt") {
    sortObj.createdAt = -1;
  }
  return sortObj;
};
