const express = require('express');
const router = express.Router();
const db = require('../config/database');
const markdownIt = require('markdown-it');
const md = new markdownIt();
const multer = require('multer');
const path = require('path');

// Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 파일 크기 제한 (예: 5MB)
        fieldSize: 10 * 1024 * 1024, // 필드 값 크기 제한 (예: 10MB)
    }
});

router.get('/', (req, res) => {
    if (req.session.loggedin) {
        res.render('create', {
            loggedin: req.session.loggedin
        });
    } else {
        res.redirect('/login');
    }
});

router.post('/process', upload.single('image'), (req, res) => {
    if (req.session.loggedin) {
        const { title, content } = req.body;
        const author = req.session.username;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;
        const htmlContent = md.render(content);

        const sql = 'INSERT INTO news (title, content, author, image_url) VALUES (?, ?, ?, ?)';
        db.query(sql, [title, htmlContent, author, image_url], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('게시글 생성 중 오류가 발생했습니다.');
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.status(403).send('로그인이 필요합니다.');
    }
});





module.exports = router;