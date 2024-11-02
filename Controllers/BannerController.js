const Banner = require("../models/bannnerModel")
const User = require("../models/UserModel")
const FormData = require('form-data');
const crypto = require('crypto');
const fs = require("fs") 
const path = require('path'); 

const postBanner = async (req,res) => {
    try {
        const bannerImage = req.files.bannerImage;

        // สร้างชื่อไฟล์ใหม่
        const generateFilename = (file) => {
            let splittedFilename = file.name.split('.');
            return crypto.randomUUID() + '.' + splittedFilename[splittedFilename.length - 1];
        };

        const newFileName = generateFilename(bannerImage);
        const uploadDir = path.join(__dirname, '../public/uploads/banners/events');

        // ตรวจสอบและสร้างโฟลเดอร์หากยังไม่มีอยู่
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const uploadPath = path.join(uploadDir, newFileName);
        await bannerImage.mv(uploadPath);

        // สร้างข้อมูลแบนเนอร์ใหม่
        const newBanner = new Banner({
            title: req.body.title,
            description: req.body.description,
            link: req.body.link,
            imageUrl: `/uploads/banners/events/${newFileName}`,
            expiryDate: req.body.expiryDate
        });

        // บันทึกลงใน MongoDB
        await newBanner.save();
        // console.log(newBanner)
        res.status(200).json({ status: "ok", newBanner, msg: "สร้างแบนนเอร์แล้ว"})
    } catch (error) {
        const errorMessage = error.message || 'Internal Server Error';
        console.log(error)
        res.status(500).json({ message: "Server Error", error})
    }
}

const DeteleBanner = async (req,res) => {
    try {
        const bannerId = req.params.id;
        await Banner.findByIdAndDelete(bannerId);
        res.json({ status: 'ok', message: 'แบนเนอร์ถูกลบเรียบร้อยแล้ว' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'ไม่สามารถลบแบนเนอร์ได้' });
    }
}

module.exports = {
    postBanner,
    DeteleBanner
}