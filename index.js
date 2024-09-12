const express = require("express")
const app = express();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require("path")
const cors = require('cors');
const fs = require('fs')
const Article = require("./models/ArticleModel")
const Anime = require("./models/AnimeModel")
const session = require('express-session');
const moment = require('moment');
const cookieParser = require('cookie-parser');
require("dotenv").config();

const IndexRouter = require("./routers/indexRouter")
const authRouter = require("./routers/authRouter")
const TopCoinRouter = require("./routers/topCoinRouter")
const ReadRouter = require("./routers/ReadRouter")
const PlayRouter = require("./routers/PlayRouter")
const UploadsRouter = require("./routers/uploadRouter")
const PostsRouter = require("./routers/ArticleRouter")
const recommenRouter = require("./routers/RecommenRouter")
const DashboardRouter = require("./routers/DashboardRouter")
const AdminRouter = require("./routers/AdminRouter")
const AnimeRouter = require("./routers/AnimeRouer")
const channalRouter = require("./routers/ChannelRouter")
const SurveyRouter = require("./routers/SurveyRouter")
const SurveyRouterCrerate = require("./routers/Survey/SurveyRouter")
const PlaymentRoute = require("./routers/PlaymentRouter")


app.get('/ads.txt', (req, res) => {
  res.sendFile(path.join(__dirname, './google/ads.txt'));
});
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, './google/robots.txt'));
});

app.get('/sitemap.xml', async (req, res) => {
  try {
      const articles = await Article.find().sort({ createdAt: 'desc' });
      const animes = await Anime.find().sort({ createdAt: 'desc' });

      res.setHeader('Content-Type', 'application/xml');
      res.render('./th/sitemap', { 
        articles,
        animes
       });
  } catch (err) {
      res.status(500).send('Error generating sitemap.');
  }
});

// เส้นทาง router สำหรับ lib
const Router = require("./lib/routers/router")
const ApiService = require("./lib/routers/serverApis")
const {checkAuth} = require("./lib/auth")

const allowedOrigins = [
  'https://live-aninight.ani-night.online',
  'https://ani-night.online',
  'https://studio.ani-night.online',
  'https://anime.ani-night.online',
  'http://localhost:7000',
  'http://localhost:5173',
  'https://play.ani-night.online',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


app.use((req, res, next) => {
  // รับค่า `header-lang` จาก header ของ request
  let lang = req.headers['header-lang'] ||  req.path.split('/')[1];

  // ตรวจสอบว่า lang มีค่าถูกต้องหรือไม่ (th, en, jp)
  const supportedLanguages = ['th', 'en', 'jp'];
  if (!supportedLanguages.includes(lang)) {
    lang = 'th'; // ค่าเริ่มต้นคือภาษาไทย
  }

  // กำหนดค่า res.locals.lang เพื่อให้ EJS ใช้
  res.locals.lang = lang;
  next();
});



app.use((req, res, next) => {
  const originalUri = req.headers['x-original-uri'];
  if (originalUri && originalUri.startsWith('/admin')) {
    // จัดการ routing สำหรับ admin
  } else if (originalUri && originalUri.startsWith('/dashboard')) {
    // จัดการ routing สำหรับ dashboard
  } else {
    // จัดการ routing สำหรับหน้าหลัก
  }
  next();
});

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(fileUpload());
app.locals.moment = moment;
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ limit: '1000mb', extended: true }));
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ limit: '1000mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: process.env.ACCESS_TOKEN_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false}
}));
app.use(session({
  secret: process.env.ACCESS_TOKEN_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, domain: '.ani-night.online' }
}));


app.use(Router)
app.use(IndexRouter)
app.use(PlayRouter)
app.use(ReadRouter)
app.use(recommenRouter)
app.use(AdminRouter)
app.use(AnimeRouter)
app.use(TopCoinRouter)

app.use("/auth", checkAuth)
app.use("/api/v2", authRouter)
app.use("/api/v2", UploadsRouter)
app.use("/api/v2", PostsRouter)
app.use("/api/v2", DashboardRouter)
app.use("/api/v2", ApiService)
app.use("/api/v2", channalRouter)
app.use("/api/v2", SurveyRouter)
app.use("/api/v2", SurveyRouterCrerate)
app.use("/api/v2", PlaymentRoute)

app.use(helmet());

// เพิ่ม rate limiting เพื่อลดการโจมตีแบบ brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100 // จำกัด 100 requests ต่อ IP ทุก 15 นาที
});
app.use(limiter);

app.use((req, res, next) => {
  const userID = req.session.userlogin;
  res.status(404).render('./errors/404', {userID});
}); 


app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('./errors/ejs/error', 
    {
      error: {
        message: err.message,
        stack: err.stack
      }
    });
});

app.listen(process.env.PORT, () => {
  console.log(`server Client in runng to port ${process.env.PORT}`)
})