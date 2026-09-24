/** URL slug from a title — mirrors `generateSlug` in backend/utils/slug.js. */
export const generateSlug = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
