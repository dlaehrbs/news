const express = require('express');
const router = express.Router();
const db = require('../config/database');
const markdownIt = require('markdown-it');
const md = new markdownIt();
const multer = require('multer');
const path = require('path');
const he = require('he');


router.get('/:id', (req, res) => {
    const newsId = req.params.id;
    const sql = 'SELECT * FROM news WHERE id = ?';

    db.query(sql, [newsId], (err, results) => {
        if (err) {
            res.status(500).send('게시글을 가져오는 중 오류가 발생했습니다.');
        } else {
            if (results.length > 0) {
                const news = results[0];
                const createdAt = new Date(news.created_at).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Seoul'
                })

                res.render('full_news', {
                    news: news,
                    createdAt: createdAt,
                    loggedin: req.session.loggedin,
                });
            } else {
                res.status(404).send('해당하는 게시글을 찾을 수 없습니다.');
            }
        }
    });

});

module.exports = router;