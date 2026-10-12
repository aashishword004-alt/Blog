import con  from "../database/connection.js";

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Returns "my-post", or "my-post-2" if it already exists
async function uniqueSlug(title, ignoreId = 0) {
  const base = slugify(title).slice(0, 140) || "post";
  let slug = base;
  let n = 1;

  while (true) {
    const sql =  "SELECT id FROM posts WHERE slug = ? AND id != ?";
    const [rows] = await con.query(sql,[slug, ignoreId]);

    if (rows.length === 0) return slug;
    n++;
    slug = `${base}-${n}`;
  }
}

export default uniqueSlug;