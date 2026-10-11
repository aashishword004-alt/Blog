import express from 'express';
const app = express();
import bodyparser from 'body-parser';
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

const rout = '/post';

app.post(rout + '/create', async (req, res) => {
        try {
            const { title, excerpt, content, status } = req.body;

            // title and content are required
            if (!title || !content) {
                if (req.file) removeFile(req.file.filename); // multer already saved the image, so delete it
                return res.status(400).json({ message: "Title and content are required." });
            }

            const finalStatus = status === "published" ? "published" : "draft";
            const publishedAt = finalStatus === "published" ? new Date() : null;
            const slug = await uniqueSlug(title);
            const coverImage = req.file ? req.file.filename : null; // store only the file name
            const sql = `INSERT INTO posts (title, slug, excerpt, cover_image, content, status, published_at, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const vaules = [title, slug, excerpt || null, coverImage, content, finalStatus, publishedAt, TEMP_AUTHOR_ID]
            const [result] = await con.query( sql,vaules);

            res.status(201).json({
                id: result.insertId,
                slug,
                cover_image: coverImage,
                status: finalStatus,
            });
        } catch (err) {
            if (req.file) removeFile(req.file.filename); // don't leave an unused image if the insert failed
            console.log(err.message);
            res.status(500).json({ message: "Server error." });
        }
});



const port = 3000
app.listen(port, () => {
    console.log('server running on ' + port)
});