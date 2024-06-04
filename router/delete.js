const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 게시글 삭제 기능
router.get('/:id', (req, res) => {
    if (req.session.loggedin) {
        const newsId = req.params.id;
        const sql = 'DELETE FROM news WHERE id = ?';
        db.query(sql, [newsId], (err, result) => {
            if (err) {
                res.status(500).send('게시글 삭제 중 오류가 발생했습니다.');
            } else {
                res.redirect('/');
            }
        });
    } else {
        res.status(403).send('로그인이 필요합니다.');
    }
});

module.exports = router;
