const express = require("express")
const app = express();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require("path")
const cors = require('cors');
const fs = require('fs')
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


app.get('/ads.txt', (req, res) => {
  res.sendFile(path.join(__dirname, './google/ads.txt'));
});
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, './google/robots.txt'));
});

// เส้นทาง router สำหรับ lib
const Router = require("./lib/routers/router")
const {checkAuth} = require("./lib/auth")

// กำหนดค่า CORS
app.use(cors({
  origin: 'http://localhost:8000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

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