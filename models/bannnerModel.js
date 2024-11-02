const mongoose = require("../config/db");

const bannerSchema = new mongoose.Schema({
    title: { type: String, required: true }, 
    description: { type: String }, 
    link: { type: String }, 
    imageUrl: { type: String, required: true },
    expiryDate: { type: Date },
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
