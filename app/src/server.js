require('dotenv').config({path:'./.env'});
const path = require('path');
const express = require('express');
const { connect } = require('./config/db');
const customer = require('./routes/customer');
const product = require('./routes/product');
const order = require('./routes/order');
const indexRoutes = require('./routes/index');

//server information
const port = process.env.PORT
const host = process.env.HOST

const app = express();


// Configura o EJS como motor de renderização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: true }));
app.use('/customer', customer);
app.use('/product', product);
app.use('/order', order);
app.use('/', indexRoutes);
app.use('/orders/:id/details', indexRoutes);
app.use('/orders/:id/status', indexRoutes);

app.listen(port, async ()=>{
    await connect();
    console.log(`Server running at http://${host}:${port}`);
});