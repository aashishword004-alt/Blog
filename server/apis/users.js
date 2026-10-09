import express from 'express';
const app = express();

import bodyparser from 'body-parser';
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
import con from '../database/connection.js'
import err from '../module/errinput.js'
import security from '../module/security.js'




const route = '/users'

app.post(route + '/register', async (req, res) => {
    try {
        let { name, email, password } = req.body
        if (!name || !email || !password) {
            res.json(err)
        }
        const hash = await security.converthash(password)
        const sql = `INSERT INTO users(name,email,password) VALUES (?,?,?)`
        const values = [name,email,hash]
        const [result] = await con.query(sql,values)
        res.status(200).json([{'error' : false},{'success' : true},{'message' : 'User Register Successfully'},{'id' : result.insertId}])
   }
    catch (error) {
        if(error.errno === 1062)
        {
            res.json([{'error' : false},{'success' : false},{'message' : 'Invalid Email Please Try Another Email'}])
        }
        console.log(error);
        return res.status(500).json([{
            'error': "Internal server error"
        }]);
    }


});

app.post(route + '/login' , async (req,res) =>{
    let {email , password} = req.body;
    if(!email || !password)
    {
        res.json(err());
    }
    try{
        let sql = `select email,password from users where email = ?`
        const [result] = await con.query(sql,[email,password]);
        if(result.length === 0)
        {
               res.status(401).json([{'error' : true},{'success' : false},{'message' : 'Invalid Email Or Password'}]);
        }

        let hash = result[0]['password'];
        let valid = await security.compare(hash,password);
        if(!valid)
        {
            res.status(401).json([{'error' : true},{'success':false},{'message' : 'Login Attempt Faild'}]);
        }
       
        return res.status(200).json([{'error' : false},{'success' : true},{'message' : 'Login Successfully'}])
        
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json('error in server');
    }
})


const port = 3000
app.listen(port, () => {
    console.log('Server is Runnig On ' + port)
})