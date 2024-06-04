const express = require('express');
const multer = require('multer');
const app = express()
const port = 3005
const path = require('path');
const db = require('./config/database');
const bodyParser = require('body-parser');
const session = require('express-session');
const he = require('he');





// 라우터 모음
const loginRouter = require('./router/login'); // login.js 파일을 가져옴
const logoutRouter = require('./router/logout'); // logout.js 파일을 가져옴
const createRouter = require('./router/create'); // create.js 파일을 가져옴
const deleteRouter = require('./router/delete'); // delete.js 파일을 가져옴
const updateRouter = require('./router/update');
const full_news_routes = require('./router/full_news'); // full_news.js



app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));
app.use(bodyParser.json());

//미들웨어 사용
app.use('/login', loginRouter); 
app.use('/logout', logoutRouter); 
app.use('/news_create', createRouter);
app.use('/news_delete', deleteRouter); 
app.use('/news_update', updateRouter);
app.use('/full_news', full_news_routes);



app.get('/', (req, res) => {
    const sql = 'SELECT * FROM news';
    const username = req.session.username;
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send("뉴스 목록을 불러오는 중 오류가 발생했습니다.")
        }
        const newsHTML = results.map(news => ({
            ...news,
            decodedContent: news.content ? he.decode(news.content) : '',
            createdAt: new Date(news.created_at).toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Seoul'
            })
        }));
        
        res.render('index', {
            loggedin: req.session.loggedin,
            news: newsHTML,
            username: username
        });
        
        
    });
})





app.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).send("검색어를 입력하세요.");
    }
    
    const sql = 'SELECT * FROM news WHERE title LIKE ?';
    db.query(sql, [`%${query}%`], (err, results) => {
        if (err) {
            return res.status(500).send("검색 중 오류가 발생했습니다.");
        }
        
        const decodedNews = results.map(news => ({
            ...news,
            decodedContent: news.content ? he.decode(news.content) : ''
        }));
        
        res.render('search_results', { 
            loggedin: req.session.loggedin,
            news: decodedNews,
            query: query
        });
    });
});






app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})