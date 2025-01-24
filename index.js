const express = require("express")
const scheduleJobs = require("./jobs")

const http = require('http');
const WebSocket = require('ws');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const geoip = require('geoip-lite');
const formatNumber = require("./formats/formatNumber")


const { addComment } = require("./Controllers/CommentController")
// const { handleWebSocketMessage } = require("./Controllers/AiController")
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require("path")
const cors = require('cors');
const terser = require('terser');
const compression = require('compression');
const fs = require('fs')
const Article = require("./models/ArticleModel")
const Anime = require("./models/AnimeModel")
const session = require('express-session');
// const { verifyApiKey } = require("./Middlewares/ApiKeyMiddleware")
const moment = require('moment');
const cookieParser = require('cookie-parser');
require("dotenv").config();


app.post("/add-comment", (req, res) => {
  addComment(req, res, io); // ส่ง io เข้าใน Controller
});


const allowedOrigins = [
  'https://live-aninight.ani-night.online',
  'https://ani-night.online',
  'https://studio.ani-night.online',
  'https://anime.ani-night.online',
  'http://localhost:5050',
  'http://localhost:7000',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


app.use((req, res, next) => {
  // รับค่า `Accept-Language` จาก header
  const browserLang = req.headers['accept-language']?.split(',')[0].split('-')[0] || 'th';

  // รับค่า `header-lang` หรือ path (/th, /en, /jp)
  let lang = req.headers['header-lang'] || req.path.split('/')[1];

  // ดึงข้อมูลจาก IP
  const ip = req.ip || req.connection.remoteAddress;
  const geo = geoip.lookup(ip);

  // ถ้ารู้จักประเทศจาก IP
  if (geo && geo.country) {
    switch (geo.country) {
      case 'TH':
        lang = 'th';
        break;
      case 'US':
        lang = 'en';
        break;
      case 'JP':
        lang = 'jp';
        break;
      case 'Laos':
        lang = 'Laos';
        break;
      default:
        lang = browserLang;
        break;
    }
  }

  // ตรวจสอบว่า lang มีค่าถูกต้องหรือไม่ (th, en, jp, Laos)
  const supportedLanguages = ['th', 'en', 'jp', 'Laos'];
  if (!supportedLanguages.includes(lang)) {
    lang = supportedLanguages.includes(browserLang) ? browserLang : 'th'; // เลือกค่าภาษาของเบราว์เซอร์หากรองรับ
  }

  // กำหนดค่า res.locals.lang
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

app.set('views', [
  path.join(__dirname, '/client/web/views/th'),
  path.join(__dirname, '/client/web/views/en'),
  path.join(__dirname, '/client/web/views/Laos'),
  path.join(__dirname, '/views'),
  path.join(__dirname, '/admin/views'),
  path.join(__dirname, '/media/views'),
  path.join(__dirname, '/animeschedule/views'),
  path.join(__dirname, '/shots/views')
]);
app.set('view engine', 'ejs');
app.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 * 1024 },
}));

scheduleJobs();

const formatDate = (date) => {
  return moment(date).fromNow();
};

app.locals.moment = moment;

app.locals.number1 = 100;
app.locals.number2 = 500;
app.locals.number3 = 1500;
app.locals.number4 = 1200000;
app.locals.formatNumber = formatNumber;
app.use(bodyParser.json({ limit: '1000mb' }));
app.use(bodyParser.urlencoded({ limit: '1000mb', extended: true }));
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ limit: '1000mb', extended: true }));
app.use(cookieParser());
app.use(express.static('public', { etag: false })); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: process.env.ACCESS_TOKEN_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(session({
  secret: process.env.ACCESS_TOKEN_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, domain: '.ani-night.online' }
}));




const IndexRouter = require("./routers/indexRouter")
const SearchRouter = require("./routers/SearchRouter")
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
const RewardRoute = require("./routers/RewardRouter")
const AiRoute = require("./routers/AiRouter")
const MemeRouter = require("./routers/MemeRouter")
const CommentRouter = require("./routers/Commentrouter")
// const TrendingRouter = require("./")

const setLanguage = require("./lib/language")
// เส้นทาง router สำหรับ lib
const Router = require("./lib/routers/router")
const ApiService = require("./lib/routers/serverApis")
const { checkAuth } = require("./lib/auth")
app.set("wss", wss);

const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 นาที
  max: 5, // 5 Requests/IP
  message: "คุณโพสต์บ่อยเกินไป กรุณารอ 1 นาทีแล้วลองใหม่อีกครั้ง!",
});

app.use('/:lang', setLanguage);
app.use(Router)
app.use(IndexRouter)
app.use(SearchRouter)
app.use(PlayRouter)
app.use(ReadRouter)
app.use(recommenRouter)
app.use(AdminRouter)
app.use(AnimeRouter)
app.use(TopCoinRouter)

app.use("/auth", checkAuth)
app.use("/api/v2", authRouter)
app.use("/api/v2", MemeRouter)
app.use("/api/v2", UploadsRouter)
app.use("/api/v2", postLimiter, PostsRouter)
app.use("/api/v2", DashboardRouter)
app.use("/api/v2", ApiService)
app.use("/api/v2", channalRouter)
app.use("/api/v2", SurveyRouter)
app.use("/api/v2", SurveyRouterCrerate)
app.use("/api/v2", PlaymentRoute)
app.use("/api/v2", RewardRoute)
app.use("/api/v2", AiRoute)
app.use("/api/v2", CommentRouter)


// wss.on('connection', (ws) => {
//   console.log('New client connected');
//   ws.on('message', (message) => AiRoute.handleWebSocketMessage(ws, message));
//   ws.on('close', () => console.log('Client disconnected'));
// });


app.use(compression());
app.use(helmet());
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100, // จำกัดคำขอ 100 ครั้งต่อ IP
  message: 'Too many requests from this IP, please try again later.',
});


app.use('/api/v2/schedule/anime', apiLimiter);


// เพิ่ม rate limiting เพื่อลดการโจมตีแบบ brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 100 // จำกัด 100 requests ต่อ IP ทุก 15 นาที
});
app.use(limiter);

app.use((req, res, next) => {
  const userID = req.session.userlogin;
  res.status(404).render('./errors/404', { userID });
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

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});