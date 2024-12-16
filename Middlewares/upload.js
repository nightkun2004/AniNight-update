const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// ฟังก์ชันการอัปโหลดไฟล์ไปยัง Cloudinary
const uploadFile = async (file) => {
    try {
        const subID = uuidv4();

        // ใช้ cloudinary.upload_stream เพื่ออัปโหลดไฟล์ไปยัง Cloudinary
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image', 
                    public_id: `images/${subID}`,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.secure_url); // ส่งกลับ URL ของไฟล์ที่อัปโหลด
                    }
                }
            ).end(file.data);  // ส่งข้อมูลไฟล์ไปยัง Cloudinary
        });
        // console.log(uploadResponse)
        return uploadResponse;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

module.exports = uploadFile;
