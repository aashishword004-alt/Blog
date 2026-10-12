import express from 'express';
const app = express();
import bodyparser from 'body-parser';
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import err from '../module/errinput.js'
import uniqueSlug from './slug.js';
import postupload from '../module/multer.js';
import con from '../database/connection.js'
import cors from 'cors'

app.use(cors())

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


const rout = '/post';
// 	id 	title 	slug 	excerpt 	cover_image 	content 	status 	published_at 	author_id 	created_at 	updated_a
app.post(rout + '/create', postupload.single('cover_image'), async (req, res) => {
    try {
        let { title, excerpt, content, status, author_id, } = req.body;
        if (!title || !excerpt || !content || !author_id) {
            return res.status(400).json(err);
        }
        const slug = await uniqueSlug(title);
        const finalStatus = status === "published" ? "published" : "draft";
        const publishedAt = finalStatus === "published" ? new Date() : null;
        const cover_image = req.file ? req.file.filename : null;
        const sql = `INSERT INTO posts (title, slug, excerpt, cover_image, content, status, published_at, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [title, slug, excerpt, cover_image, content, status, publishedAt, author_id];
        const [Status] = await con.query(sql, values);
        
        return res.status(201).json({
            "message": "Post created.",
            id: status.insertId,
            slug,
            cover_image: cover_image,
            status: finalStatus,
        });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: "Server error." });
    }
});

app.use((err, req, res, next) => {
  console.log("Multer error:", err.code, "| field received:", err.field);
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    console.log(err)
    return res.status(400).json({
      message: `Unexpected file field "${err.field}". Expected "coverImage".`,
    });
  }
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Image must be 5 MB or smaller." });
  }
  res.status(400).json({ message: err.message || "Upload failed." });
});

const port = 3000
app.listen(port, () => {
    console.log('server running on ' + port)
});