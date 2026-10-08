import express from 'express';
const app = express();

import bodyparser from 'body-parser';
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
import connect from './database/connection.js'
import err from './module/errinput.js'
import security from './module/security.js'

app.use(express.json());


const route = '/users'

app.get(route + '/getall', (req, res) => {
    if (req) {
        res.json('its work ')
    }
})

app.post(route + '/register', async (req, res) => {
    try {
        let { name, email, password } = req.body
        if (!name || !email || !password) {
            res.json(err)
        }
        const hash = await security.converthash(password)
        const sql = `INSERT INTO users (name,email,password) VALUES (?,?,?)`
        const values = [name,email,hash]
        const result = await  connect.query(sql,values)
   }
    catch (error) {
        console.log(error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }


})


const port = 3000
app.listen(port, () => {
    console.log('Server is Runnig On ' + port)
})