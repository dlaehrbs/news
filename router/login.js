const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 로그인 페이지 라우트
router.get('/', (req, res) => {
    res.render('login');
});

// 로그인 처리 라우트
router.post('/', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
            if (err) throw err;
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/');
            } else {
                res.send('로그인 불가능 합니다.');
            }
        });
    } else {
        res.send('비밀번호 또는 이름이 틀렸습니다.');
    }
});

module.exports = router;