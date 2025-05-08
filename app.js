const express = require('express');
const app = express();
const authen = require('./api/routes/authen');
const bodyparser = require('body-parser');
const dbconn = require('./dbconn');
const product = require('./api/routes/product');
const cart = require('./api/routes/cart');
const cart_item = require('./api/routes/cart_item');

app.use(bodyparser.json());
app.use('/authen',authen);
app.use('/product',product);
app.use('/cart',cart);
app.use('/cart_item',cart_item);

module.exports = app;