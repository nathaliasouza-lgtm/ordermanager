require('dotenv').config({path:'./.env'});
const path = require('path');
const express = require('express');
const { connect } = require('./config/db');
const customer = require('./routes/customer');

//server information
const port = process.env.PORT
const host = process.env.HOST

const app = express();


// Configura o EJS como motor de renderização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: true }));
app.use('/customer', customer);

app.get('/', (req, res)=>{
    res.send('Hello, World!')
});

app.listen(port, async ()=>{
    await connect();
    console.log(`Server running at http://${host}:${port}`);
});