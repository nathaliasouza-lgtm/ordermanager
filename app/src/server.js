require('dotenv').config({path:'./.env'});

const express = require('express');
const app = express();

//server information
const port = process.env.PORT
const host = process.env.HOST

app.get('/', (req, res)=>{
    res.send('Hello, World!')
});

app.listen(port, ()=>{
    console.log(`Server running at http://${host}:${port}`);
});