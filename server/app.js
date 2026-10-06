import express from 'express'
const app = express()

app.get('/hello' , (req,res) =>{
    if(req)
    {
        
        res.json('its work')
    }
});


const port = 5000
app.listen(port,() =>{
    console.log('Port Are running on ' + port)
})