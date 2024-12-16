const mongoose = require("../config/db");

const ScheduleSchema = new mongoose.Schema({
  day: { type: String, required: true },
  date: { type: Date, required: true },
  episodes: {
    current: { type: Number, required: false, default: 0 }, // จำนวนตอนที่ฉายไปแล้ว
    total: { type: Number, required: false, default: 0 }   // จำนวนตอนทั้งหมด (ถ้าทราบ)
  },
  animes: [{
    anime: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Anime', // เชื่อมโยงกับโมเดล Anime
    },
    time: { type: String, required: true },
  }],
  created_at: { type: Date, default: Date.now },
});

const Schedule = mongoose.model('Schedule', ScheduleSchema);

module.exports = Schedule;
