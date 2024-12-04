const mongoose = require("../config/db");

const ScheduleSchema = new mongoose.Schema({
  day: { type: String, required: true },
  date: { type: Date, required: true },
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
