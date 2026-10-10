import express from 'express';
const app = express();

import bodyparser from 'body-parser';
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
import con from '../database/connection.js'
import err from '../module/errinput.js'
import security from '../module/security.js'
import mail from '../module/mail.js'



const route = '/users'

app.post(route + '/register', async (req, res) => {
    try {
        let { name, email, password } = req.body
        if (!name || !email || !password) {
           return res.json(err)
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
           return res.json([{'error' : false},{'success' : false},{'message' : 'Invalid Email Please Try Another Email'}])
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
       return res.json(err);
    }
    try{
        let sql = `select email,password from users where email = ?`
        const [result] = await con.query(sql,[email,password]);
        if(result.length === 0)
        {
             return res.status(401).json([{'error' : true},{'success' : false},{'message' : 'Invalid Email Or Password'}]);
        }

        let hash = result[0]['password'];
        let valid = await security.compare(hash,password);
        if(!valid)
        {
           return res.status(401).json([{'error' : true},{'success':false},{'message' : 'Login Attempt Faild'}]);
        }
       
        return res.status(200).json([{'error' : false},{'success' : true},{'message' : 'Login Successfully'}]);
        
    }
    catch(error)
    {
        console.log(error)
        return res.status(500).json('error in server');
    }
});

app.put(route + '/change_password' ,async(req,res) =>{
    let { id , password , newpassword}  = req.body;
    try{
       if(!id || !password || !newpassword){
        return res.status(400).json(err)
       }
        let sql = 'select password from users where id = ?';
        const [result] = await con.query(sql,[id]);
        if(result.length === 0) 
        {
            return res.status(404).json([{'error' : true},{'success' : 'false'},{'message' : 'user not found'}]);
        }
        let hash =  await result[0]['password'];
        let  valid = await security.compare(hash,password);
        if(!valid)
        {
           return res.status(400).json([{'error' : true},{'success' : false},{'message' : 'password not change'}]);
        }
        let newsql = 'update users set password = ? where id = ?';
        let convert = await security.converthash(newpassword);
        const output = await con.query(newsql,[convert,id]); 
        return res.status(200).json([{'error' : false},{'success': true},{'message' : 'password change successfully'}]);
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json('error in internal server')
    }
});

app.put(route + '/forgot_password' , async (req,res) =>{
    let  {email} = req.body;
    try{
        if(!email)
        {
            return res.status(400).json(err);
        }
        let sql = `select id from users where email = ?`;
        let [result] = await con.query(sql,[email]);
        if(result.length === 0)
        {
            return res.status(400).json([{'error' : true},{'success' : 'false'},{'message' : 'invalid email'}]);
        }
        let otp = await security.Genotp(6);
        let hash = await security.converthash(otp);
        let nsql = 'update users set password = ? where email = ?';
        let output = await con.query(nsql,[hash,email]);
        let sub = 'Password Recovery Mail';
        let text = `Your New Password is ${otp}`; 
        let sendmail = await mail(email,sub,text);

        return res.status(200).json([{'error' : false},{'success' : true},{'message' : 'Passwors Successfuly Sent '}])
       
        
    }
    catch(error)
    {
        console.log(error);
        return res.status(404).json('error in  internal server');
    }
})


const port = 3000
app.listen(port, () => {
    console.log('Server is Runnig On ' + port)
});