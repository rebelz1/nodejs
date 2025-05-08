const express = require('express');
const router = express.Router();
const conn = require('../../dbconn');
const mysql = require('mysql');

router.get('/',(req,res)=>{
    res.send('Welcome to cart-item!!!!');
})

router.post('/view',(req,res)=>{
    const data = req.body;
    /*AI Help*/let sql = `
         SELECT 
            ci.cart_id,
            ci.product_id,
            p.product_name,
            p.price AS price_per_unit,
            ci.quantity,
            (p.price * ci.quantity) AS total_price
        FROM cart_item ci
        JOIN product p ON ci.product_id = p.product_id
        JOIN cart c ON ci.cart_id = c.cart_id
        WHERE c.customer_id = ?
    `;
    sql =mysql.format(sql, [data.customer_id]);
    conn.query(sql, (error, results, fields)=>{
        if(error) throw error;
        res.status(200).json(results); 
    })
})

module.exports = router;