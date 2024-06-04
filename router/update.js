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
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 파일 크기 제한 (예: 5MB)
        fieldSize: 10 * 1024 * 1024, // 필드 값 크기 제한 (예: 10MB)
    }
});

// 게시글 수정 폼 렌더링
router.get('/:id', (req, res) => {
    if (req.session.loggedin) {
        const newsId = req.params.id;
        const sql = 'SELECT * FROM news WHERE id = ?';
        db.query(sql, [newsId], (err, results) => {
            if (err) {
                res.status(500).send('게시글을 가져오는 중 오류가 발생했습니다.');
            } else {
                if (results.length > 0) {
                    const news = results[0];
                    res.render('update', {
                        news: news,
                    });
                } else {
                    res.status(404).send('해당하는 게시글을 찾을 수 없습니다.');
                }
            }
        });
    } else {
        res.status(403).send('로그인이 필요합니다.');
    }
});

// 게시글 수정 처리
router.post('/process/:id', upload.single('image'), (req, res) => {
    if (req.session.loggedin) {
        const newsId = req.params.id;
        const { title, content } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        let sql, params;
        if (imageUrl) {
            sql = 'UPDATE news SET title = ?, content = ?, image_url = ? WHERE id = ?';
            params = [title, content, imageUrl, newsId];
        } else {
            sql = 'UPDATE news SET title = ?, content = ? WHERE id = ?';
            params = [title, content, newsId];
        }

        db.query(sql, params, (err, result) => {
            if (err) {
                res.status(500).send('게시글 수정 중 오류가 발생했습니다.');
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.status(403).send('로그인이 필요합니다.');
    }
});

module.exports = router;
