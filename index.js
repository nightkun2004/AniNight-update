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
const UploadsRouter = require("./routers/uploadRouter")
const PostsRouter = require("./routers/ArticleRouter")
const recommenRouter = require("./routers/RecommenRouter")
const DashboardRouter = require("./routers/DashboardRouter")
const AdminRouter = require("./routers/AdminRouter")
const AnimeRouter = require("./routers/AnimeRouer")
const channalRouter = require("./routers/ChannelRouter")
const SurveyRouter = require("./routers/SurveyRouter")


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
      res.render('sitemap', { 
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

// กำหนดค่า CORS
app.use(cors({
  origin: 'http://localhost:8000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));


function setLanguage(req, res, next) {
  let lang = req.query.lang;

  // ถ้าไม่ได้ระบุภาษาใน query parameter ให้ใช้ภาษาจาก Header Accept-Language หรือถ้าไม่มีให้ใช้เป็นอังกฤษ
  if (!lang) {
      const acceptLang = req.headers['accept-language'];
      if (acceptLang) {
          // เลือกภาษาที่มีความสำคัญสูงสุดจาก header
          if (acceptLang.includes('th')) {
              lang = 'th';
          } else if (acceptLang.includes('jp')) {
              lang = 'jp';
          } else {
              lang = 'en';
          }
      } else {
          lang = 'th';
      }
  }

  // ตรวจสอบ path และตั้งค่าภาษาตามเส้นทาง
  if (req.path.startsWith('/en/')) {
      lang = 'en';
  } else if (req.path.startsWith('/jp/')) {
      lang = 'jp';
  } else if (req.path.startsWith('/th/')) {
      lang = 'th';
  }

  req.lang = lang; // เก็บภาษาที่เลือกไว้ใน req.lang

  try {
      req.translations = require(`./translations/${lang}.json`); // โหลดไฟล์การแปล
  } catch (error) {
      console.error(`Translation file for ${lang} not found.`);
      req.translations = require('./translations/th.json'); // โหลดไฟล์การแปลค่าเริ่มต้น
  }

  next();
}

// ใช้ middleware
app.use(setLanguage);



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