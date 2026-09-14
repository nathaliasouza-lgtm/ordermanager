require('dotenv').config({path:'../../.env'});

console.log('HOST: ', process.env.HOST)

module.exports = {
  development: {
    username: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: 'mysql',
    logging: false
  }
};

