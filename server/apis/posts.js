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
import { postupload } from '../module/multer.js';
import { removeFile } from '../module/multer.js';
import con from '../database/connection.js'
import cors from 'cors'

app.use(cors())

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


const route = '/post';
const comment_route = '/comment'
// for post api
// 	id 	title 	slug 	excerpt 	cover_image 	content 	status 	published_at 	author_id 	created_at 	updated_a
app.post(route + '/create', postupload.single('cover_image'), async (req, res) => {
  try {
    let { title, excerpt, content, status, author_id, } = req.body;
    if (!title || !excerpt || !content || !author_id) {
      return res.status(400).json(err());
    }
    const slug = await uniqueSlug(title);
    const finalStatus = status === "published" ? "published" : "draft";
    const publishedAt = finalStatus === "published" ? new Date() : null;
    const cover_image = req.file ? req.file.filename : null;
    const sql = `INSERT INTO posts (title, slug, excerpt, cover_image, content, status, published_at, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [title, slug, excerpt, cover_image, content, status, publishedAt, author_id];
    const [Status] = await con.query(sql, values);

    return res.status(200).json([{ 'error': false }, { 'success': true }, { 'message': 'post created successfully' }]);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ 'message': 'server error' });
  }
});

app.put(route + "/update", postupload.single("cover_image"), async (req, res) => {

  try {
    let { id, title, excerpt, content, status } = req.body;
    let value = [id]
    if (!id) {
      return res.json(err());
    }
    const sql = `select * from posts where id = ?`
    const [result] = await con.query(sql, value);
    if (result.length === 0) {
      if (req.file) removeFile(req.file.filename)
      return res.status(404).json([{ 'error': true }, { 'success': false }, { 'message': 'user not found' }]);
    }
    let data = result[0];
    const newtitle = title || data.title;
    const newslug = title !== data.title ? await uniqueSlug(title, id) : data.title;
    const newexcerpt = excerpt !== undefined ? excerpt : data.excerpt;
    const newimg = req.file ? req.file.filename : data.cover_image;
    const newcontent = content || data.content;
    const newstatus = status === "published" || status === "draft" ? status : data.status;
    const publishat = data.published_at;
    const usql = `UPDATE posts SET title = ?, slug = ?, excerpt = ?, cover_image = ?, content = ?, status = ?, published_at = ? WHERE id = ?`;
    let values = [newtitle, newslug, newexcerpt, newimg, newcontent, newstatus, publishat, id];
    const [update] = await con.query(usql, values);
    if (req.file) removeFile(data.cover_image);
    return res.status(200).json([{ 'error': false }, { 'success': true }, { 'message': 'post update successfully' }, { 'row': update.affectedRows }]);

  } catch (err) {
    console.log("Original error:", err.message);
    console.log("Uploaded file:", req.file);

    if (req.file) {
      console.log("Calling removeFile...");
      removeFile(req.file.filename);
    } // update failed, so don't keep the new image
    return res.status(500).json({ message: "Server error." });
  }
});

app.delete(route + "/delete", async (req, res) => {
  try {
    let { author_id, post_id } = req.body
    if (!author_id || !post_id) {
      return res.status(400).json(err());
    }
    const sql = 'SELECT id , cover_image, author_id FROM posts WHERE id = ? and author_id = ?'
    const [result] = await con.query(sql, [post_id, author_id]);
    if (result.length === 0) {
      return res.status(404).json([{ 'error': true }, { 'success': false }, { 'message': 'post not found' }]);
    }
    let post = result[0];
    const dsql = 'delete from posts where id = ? and author_id = ?'
    const [output] = await con.query(dsql, [post_id, author_id]);
    removeFile(post.cover_image);
    return res.status(200).json([{ 'error': false }, { 'success': true }, { 'message': 'post delete successfully' }]);



  }
  catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Server error." });
  }
});

// for post comment 
app.post(comment_route + '/add', async (req, res) => { 
  try {
    const { post_id, author_id, body } = req.body;   // TEMP: author_id will come from req.user.id

    if (!post_id || !author_id || !body) {
      return res.status(400).json(err());
    }

    // the post must exist and be published
    const sql = `SELECT id FROM posts WHERE id = ? AND status = 'published'`
    const [posts] = await con.query(sql ,[post_id]);
    if (posts.length === 0) {
      return res.status(404).json([{'error' : false},{'success' : false},{'message' : 'post not found'}]);
    }
    const a_sql = `select id from users where id = ?`
    const [user] = await con.query(a_sql,[author_id]);
    if(user.length === 0)
    {
      return res.status(404).json([{'error' : false},{'success' : false},{'message' : 'user not found'}]);

    }
    const c_sql = `INSERT INTO comments (post_id, author_id, body) VALUES (?, ?, ?)`
    const values =  [post_id, author_id, body]
    await con.query(c_sql,values);
    return res.status(201).json([{'error' : false},{'success' : true},{'message' : 'comment sent successfully'}]);
  
  } catch (e) {
    console.log(e.message);
    return res.status(500).json([{'error' : true},{'success' : false},{'message' :'server error'}]);
  }
});

// for post delete
app.delete(comment_route + '/delete' , async(req,res)=>{
});

const port = 3000
app.listen(port, () => {
  console.log('server running on ' + port)
});