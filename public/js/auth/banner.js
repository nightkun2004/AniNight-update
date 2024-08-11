var uploadDemo = document.getElementById('upload-demo');
var message = document.getElementById('message');
var errormessage = document.getElementById('errormessage');
var croppieInstance;

document.getElementById('file-upload-modal').addEventListener('change', function () {
    var file = this.files[0];
    var maxSize = 50 * 1024 * 1024; // 50 MB
    if (file.size > maxSize) {
        alert('ไฟล์มีขนาดใหญ่เกินไป. ขนาดไฟล์สูงสุดคือ 50 MB.');
        this.value = ''; // ล้างการเลือกไฟล์
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        uploadDemo.style.display = 'block';
        if (croppieInstance) {
            croppieInstance.destroy();
        }
        croppieInstance = new Croppie(uploadDemo, {
            viewport: { width: 640, height: 360 }, // ขนาดที่ต้องการสำหรับการครอป
            boundary: { width: 800, height: 450 }, // ขนาดขอบเขตการแสดง
            enableResize: true,
            enableOrientation: true
        });

        croppieInstance.bind({
            url: e.target.result
        });
    };
    reader.readAsDataURL(file);
});

document.getElementById('upload-form').addEventListener('submit', function (event) {
    event.preventDefault(); // ป้องกันการ submit ปกติ

    croppieInstance.result({
        type: 'base64', // ใช้ base64 แทน canvas
        size: { width: 2560, height: 1440 } // ขนาดที่ต้องการสำหรับการอัพโหลด
    }).then(function (croppedImage) {
        fetch('/api/v2/editprofile/editbanner/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // ส่งข้อมูลเป็น JSON
            },
            body: JSON.stringify({ image: croppedImage }) // ส่ง base64 ภาพเป็น JSON
        })
            .then(response => response.json()) // อ่าน body ของ response เป็น JSON
            .then(data => {
                if (data.error) {
                    errormessage.textContent = data.error;
                    errormessage.style.display = 'block';
                } else {
                    message.textContent = data.message;
                    message.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errormessage.textContent = 'เกิดข้อผิดพลาดในการอัพโหลด';
                errormessage.style.display = 'block';
            });
    });
});