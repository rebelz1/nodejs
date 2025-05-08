const express = require('express');
const router = express.Router();
const conn = require('../../dbconn');
const mysql = require('mysql');

router.get('/',(req,res)=>{
    res.send('Welcome to Product');
});

//ai ในส่วนแสดงข้อมูลรายการสินค้าที่ search เจอ
router.post('/search',(req,res)=>{
    const {descript, minprice, maxprice} = req.body;
    let sql = "SELECT * FROM product where description like ? and price between ? and ?";
    sql = mysql.format(sql, [/*ติดตรง descript ตัวนี้ใช้ ai ช่วยแก้ปัญหาครับ */`%${descript}%`, minprice, maxprice]);
    conn.query(sql, (error, results, fields)=>{
        if (error) throw error;
        if (results && results.length > 0) {
            let output = results.map(row => ({
                Product_ID: row.product_id,
                Product_Name: row.product_name,
                Description: row.description,
                Price: row.price,
                Stock_Quantity: row.stock_quantity
            }));

            res.status(200).json(output);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    })
})

router.post('/addtocart',(req,res)=>{
    const { cart_id, product_id, quantity } = req.body;

    const checkSql = "SELECT * FROM cart_item WHERE cart_id = ? AND product_id = ?";
    conn.query(checkSql, [cart_id, product_id], (error, results, fields) => {
        if (error) throw error;

        if (results.length > 0) {
            // ถ้ามีอยู่แล้ว: ทำการอัปเดตจำนวน
            const newQty = results[0].quantity + quantity;//ai help
            const updateSql = "UPDATE cart_item SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE cart_id = ? AND product_id = ?";
            conn.query(updateSql, [newQty, cart_id, product_id], (updateErr, updateResult, fields) => {
                if (updateErr) throw error;

                res.status(200).json({
                     message: "Quantity updated"
                });
            });
        } else {
            // ถ้ายังไม่มี: แทรกรายการใหม่
            const insertSql = "INSERT INTO cart_item (cart_id, product_id, quantity) VALUES (?, ?, ?)";
            conn.query(insertSql, [cart_id, product_id, quantity], (insertErr, insertResult, fields) => {
                if (insertErr) throw error;

                res.status(201).json({
                     message: "Item added to cart"
                });
            });
        }
    });
});

module.exports = router;