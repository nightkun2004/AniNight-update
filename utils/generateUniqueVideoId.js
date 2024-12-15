const generateUniqueVideoId = async (model) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let length = 6; // ความยาวเริ่มต้นของรหัส
    let videoid;
    let isUnique = false;

    while (!isUnique) {
        // สุ่มรหัสตามความยาวปัจจุบัน
        videoid = Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
        const existing = await model.findOne({ videoid });

        if (!existing) {
            isUnique = true;
        } else {
            // ตรวจสอบว่าความเป็นไปได้ครบหรือยัง
            const maxPossibleCombinations = Math.pow(characters.length, length); // จำนวนชุดรหัสที่เป็นไปได้
            const usedCount = await model.countDocuments(); // จำนวนรหัสที่ถูกใช้แล้ว

            if (usedCount >= maxPossibleCombinations) {
                length += 1; // เพิ่มความยาวหากครบทุกชุดที่เป็นไปได้
            }
        }
    }
    return videoid;
};

module.exports = generateUniqueVideoId;
