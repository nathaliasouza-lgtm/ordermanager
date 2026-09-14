require('dotenv').config({path:'./.env'});
const express = require('express');
const { connect } = require('./config/db');
const customer = require('./routes/customer');

//server information
const port = process.env.PORT
const host = process.env.HOST

const app = express();

app.use('/api/customer', customer);

app.get('/', (req, res)=>{
    res.send('Hello, World!')
});

app.listen(port, async ()=>{
    await connect();
    console.log(`Server running at http://${host}:${port}`);
});