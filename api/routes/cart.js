const express = require('express');
const router = express.Router();
const conn = require('../../dbconn');
const mysql = require('mysql');

router.get('/',(req,res)=>{
    res.send('Welcome to Cart!!!');
})

router.post('/add', (req, res) => {
    const { customer_id, cart_name } = req.body;

    const checkSql = "SELECT * FROM cart WHERE customer_id = ? AND cart_name = ?";
    conn.query(checkSql, [customer_id, cart_name], (error, results, fields) => {
        if (error) throw error;

        if (results.length > 0) {
            return res.status(409).json({
                 message: 'This name has been used' });
        }

        const insertSql = "INSERT INTO cart (customer_id, cart_name) VALUES (?, ?)";
        conn.query(insertSql, [customer_id, cart_name], (error, results, fields) => {
           if (error) throw error;
            res.status(201).json({
                 message: 'create success!!'});
        });
    });
});

module.exports = router;