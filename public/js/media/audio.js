document.addEventListener('DOMContentLoaded', function () {
    // ฟังก์ชันเล่น/หยุดเสียง
    const playButtons = document.querySelectorAll('.audio-icon');
    const audios = document.querySelectorAll('audio');

    // ตรวจสอบหากจำนวน playButtons ไม่ตรงกับจำนวน audios
    if (playButtons.length !== audios.length) {
        console.error('จำนวนปุ่มเล่นและไฟล์เสียงไม่ตรงกัน');
        return;
    }

    let currentAudio = null;  // ตัวแปรเก็บเสียงที่กำลังเล่นอยู่

    playButtons.forEach((playButton, index) => {
        const audio = audios[index];
        const waveBarGroup = document.getElementById(`wave-bars-${index + 1}`);  // เลือก element สำหรับแต่ละคลื่นเสียง
        let isPlaying = false;

        // ตั้งค่าเสียงเริ่มต้นที่ 30%
        audio.volume = 0.2;

        // รอจนกว่าไฟล์เสียงจะโหลดข้อมูล metadata ก่อน
        audio.addEventListener('loadedmetadata', function () {
            generateRandomBars(audio); // เรียกฟังก์ชันหลังจากโหลดข้อมูล metadata เสร็จ
        });

        // ฟังก์ชันการสุ่มค่าคลื่น (แท่ง)
        function generateRandomBars(audio) {
            waveBarGroup.innerHTML = '';  // ล้างแท่งคลื่นเก่า

            const numBars = 30; // จำนวนแท่งเป็น 1 แท่งทุกๆ 10 วินาที
            const barWidth = 5; // ความกว้างของแต่ละแท่ง
            const gap = 10; // ความห่างระหว่างแท่ง

            const svgHeight = 100; // ความสูงของ SVG
            const middleY = svgHeight / 2; // คำนวณตำแหน่งกลาง

            for (let i = 0; i < numBars; i++) {
                const barHeight = Math.floor(Math.random() * 30) + 20; // สุ่มความสูงของแท่ง
                const xPosition = i * (barWidth + gap); // ตำแหน่งแนวนอนของแท่ง
                const yPosition = middleY - barHeight / 2; // ตั้งค่า y เพื่อให้แท่งอยู่กลาง SVG

                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");  // สร้าง rect
                rect.setAttribute("x", xPosition);
                rect.setAttribute("y", yPosition); // ใช้ค่า y ที่คำนวณไว้
                rect.setAttribute("width", barWidth);
                rect.setAttribute("height", barHeight);
                rect.setAttribute("fill", "gray");
                waveBarGroup.appendChild(rect);  // เพิ่มแท่งเข้าใน SVG
            }
        }

        // ฟังก์ชันเล่นเสียงและแสดงคลื่น
        playButton.addEventListener('click', function () {
            if (isPlaying) {
                // หยุดเสียง
                audio.pause();
                playButton.innerHTML = '<i class="fa-solid fa-play text-gray-600"></i>';
                resetWaveform();
                isPlaying = false;
                currentAudio = null; // ลบเสียงที่กำลังเล่น
            } else {
                // หยุดเสียงที่กำลังเล่นอยู่ก่อนหน้า (ถ้ามี)
                if (currentAudio && currentAudio !== audio) {
                    currentAudio.pause();
                    // ใช้ index จาก playButtons แทนการหาตำแหน่งใน NodeList
                    const currentButton = playButtons[index]; 
                    currentButton.innerHTML = '<i class="fa-solid fa-play text-gray-600"></i>';
                    resetWaveform();
                }

                // เริ่มเล่นเสียง
                audio.play();
                playButton.innerHTML = '<i class="fa-solid fa-pause text-gray-600"></i>';
                animateWaveform(audio, waveBarGroup);
                isPlaying = true;
                currentAudio = audio; // ตั้งค่าเสียงที่กำลังเล่นเป็นเสียงนี้
            }
        });

        // ฟังก์ชันเพื่อแสดงคลื่นที่เคลื่อนที่
        function animateWaveform(audio, waveBarGroup) {
            const bars = waveBarGroup.querySelectorAll('rect');
            audio.addEventListener('timeupdate', function () {
                if (isNaN(audio.duration) || !isFinite(audio.duration)) {
                    return;  // ถ้าค่า duration ไม่เป็นตัวเลขที่ถูกต้อง ให้หยุดการอัปเดต
                }

                const currentTime = audio.currentTime;
                const progress = (currentTime / audio.duration) * 100;

                // เปลี่ยนสีของคลื่นเมื่อเล่น
                bars.forEach((bar, index) => {
                    // เปลี่ยนสีแท่งที่มีการเล่น
                    bar.setAttribute('fill', index < progress / 3 ? 'black' : 'gray');
                });

                // เลื่อนคลื่นไปตามเวลาของเสียง
                waveBarGroup.style.transform = `translateX(-${(progress / 100) * waveBarGroup.scrollWidth}px)`;
            });
        }

        // ฟังก์ชันรีเซ็ตคลื่นเสียง
        function resetWaveform() {
            generateRandomBars(); // รีเซ็ตคลื่น
            const bars = waveBarGroup.querySelectorAll('rect');
            bars.forEach(bar => bar.setAttribute('fill', 'gray')); // ตั้งสีคลื่นเป็นสีเทา
            waveBarGroup.style.transform = 'translateX(0)'; // รีเซ็ตตำแหน่งของคลื่น
        }

        // ฟังก์ชันเพื่อคลิกที่คลื่นและข้ามไปยังเวลาที่ต้องการ
        waveBarGroup.addEventListener('click', function (event) {
            const clickX = event.offsetX;  // ตำแหน่งที่คลิกในแนวนอน
            const totalWidth = waveBarGroup.clientWidth; // ความกว้างของคลื่น
            const newTime = (clickX / totalWidth) * audio.duration; // คำนวณเวลาใหม่จากตำแหน่งคลิก

            audio.currentTime = newTime;  // ตั้งเวลาใหม่ให้กับเสียง
        });
    });
});
