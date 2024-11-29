const mongoose = require("../config/db")

const chatSchema = new mongoose.Schema({
          user_message: String,
          ai_response: String,
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
