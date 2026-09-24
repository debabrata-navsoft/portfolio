// URL slug from a title — mirrors frontend/src/app/utils/slug.utils.ts.
export const generateSlug = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// Appends -1, -2, … until no other document of `Model` has the slug.
// `excludeId` skips the document being updated so it can keep its own slug.
export const createUniqueSlug = async (Model, title, excludeId = null) => {
  const slug = generateSlug(title);
  let uniqueSlug = slug;
  let count = 1;

  while (
    await Model.exists({
      slug: uniqueSlug,
      ...(excludeId && { _id: { $ne: excludeId } }),
    })
  ) {
    uniqueSlug = `${slug}-${count}`;
    count++;
  }

  return uniqueSlug;
};
