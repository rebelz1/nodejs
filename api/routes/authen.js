const express = require('express');
const router = express.Router();
const conn = require('../../dbconn');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    let data = req.body;

    const saltRounds = 10;
    const pass_hash = await bcrypt.hash(data.password, saltRounds);
    let sql = "INSERT INTO customer (first_name, last_name, email, phone_number, address, password)" + "VALUE (?,?,?,?,?,?)";
    sql = mysql.format(sql, [data.first_name, data.last_name, data.email, data.phone_number, data.address, pass_hash]);
    conn.query(sql, (error, results, fields) => {
        if (error) throw error;
        if (results.affectedRows == 1) {
            res.status(201).json({
                message: "Insert Success"
            });
        }
        else {
            res.status(400).json({
                message: "Insert Failed"
            });
        }
    });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    let sql = "SELECT * FROM customer WHERE email = ?";
    sql = mysql.format(sql, [email]);

    conn.query(sql, async (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database error', error });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = results[0];

        try {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                res.status(200).json({
                    message: 'Login successful',
                    user: {
                        customer_id: user.customer_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        phone_number: user.phone_number,
                        address: user.address,
                        created_at: user.created_at,
                        updated_at: user.updated_at
                    }
                });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } catch (err) {
            res.status(500).json({ message: 'Error comparing passwords', error: err });
        }
    });
});

router.post('/changePassword', async (req, res) => {
    const { email, oldpass, newpass } = req.body;
    //ส่วนนี้ใช้ AI ช่วยบอกวิธีการเช็ครหัสผ่านเก่าและใหม่
    let sql = "SELECT * FROM customer WHERE email = ?";
    sql = mysql.format(sql, [email]);

    conn.query(sql, async (error, results) => {
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];
        
        try {
            const isMatch = await bcrypt.compare(oldpass, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Old password is incorrect' });
            }
            
            const saltRounds = 10;
            const hash_newPassword = await bcrypt.hash(newpass, saltRounds);
            //update password ใหม่พร้อม hash password
            let sql = "UPDATE customer SET password = ? WHERE email = ?";
            sql = mysql.format(sql, [hash_newPassword, email]);

            conn.query(sql, (error, results, fields)=>{
                if(error) throw error;
                if(results.effectedRows = 1){
                    res.status(200).json({
                        message : 'Update Success'
                    });
                }else{
                        res.status(400).json({
                            message : 'Update Failed'
                        })
                    }
                    console.log("affectedRows:", results.affectedRows);
            })

        } catch (err) {
            return res.status(500).json({ message: 'Error processing password', error: err });
        }
    });
});

module.exports = router;