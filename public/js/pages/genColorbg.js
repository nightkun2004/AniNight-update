window.onload = function() {
    var img = document.getElementById('image-bg');
    var container = document.querySelector('.container-info-header');

    // ดึงข้อมูลสีจากรูปภาพ
    getAverageRGB(img);

    // ฟังก์ชันสำหรับดึงข้อมูลสีจากรูปภาพ
    function getAverageRGB(imgEl) {
        var blockSize = 5, // จำนวน pixel ที่ใช้ในการคำนวณเฉลี่ยสี
            defaultRGB = {r:0,g:0,b:0}, // สีพื้นฐานหากไม่สามารถดึงข้อมูลได้
            canvas = document.createElement('canvas'),
            context = canvas.getContext && canvas.getContext('2d'),
            data, width, height,
            i = -4,
            length,
            rgb = {r:0,g:0,b:0},
            count = 0;

        if (!context) {
            return defaultRGB;
        }

        height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
        width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

        context.drawImage(imgEl, 0, 0);

        try {
            data = context.getImageData(0, 0, width, height);
            console.log(data)
        } catch(e) {
            return defaultRGB;
        }

        length = data.data.length;

        while ((i += blockSize * 4) < length) {
            ++count;
            rgb.r += data.data[i];
            rgb.g += data.data[i+1];
            rgb.b += data.data[i+2];
        }

        // คำนวณค่าเฉลี่ยของสี
        rgb.r = Math.floor(rgb.r/count);
        rgb.g = Math.floor(rgb.g/count);
        rgb.b = Math.floor(rgb.b/count);

        // กำหนดสีพื้นหลังของ container จากค่าเฉลี่ยของสี
        container.style.backgroundColor = 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
        
        // ถ้าค่าสีเฉลี่ยมืด ให้เปลี่ยนสีข้อความเป็นสีขาว
        if (rgb.r + rgb.g + rgb.b < 382) {
            container.style.color = '#ffffff';
        }
    }
};