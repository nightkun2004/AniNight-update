const mongoose = require("../config/db");

const apiKeySchema = new mongoose.Schema({
    key: String,
    owner: String, 
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey;
