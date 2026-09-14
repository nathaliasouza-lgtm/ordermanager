require('dotenv').config({path:'../../.env'});
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

// Get Database Variables
const port = process.env.PORT;
const host = process.env.HOST;
const password = process.env.PASSWORD;
const user = process.env.USER;
const database = process.env.DATABASE;


// Sequelize Object
const sequelize = new Sequelize(database, user, password, {
    host : host,
    dialect: 'mysql',
    timezone: '-03:00'
});

async function connect(){
    try{
        console.log('[LOG] Initiating database connection...');
        const connection = await mysql.createConnection({
            host:host,
            user:user,
            password:password
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`)
        await connection.end();

        await sequelize.authenticate();
        await sequelize.sync({alter:true});
        console.log('[LOG] Connection has been established successfully!');
    }catch(err){
        console.error('Unable to connect to the database: ', err);
    }
}

module.exports = {sequelize, connect};