let debounceTimeout;

document.getElementById('searchIcon').addEventListener('click', function (event) {
    event.stopPropagation(); // หยุดการแพร่กระจายของคลิกไปที่เอกสาร
    const searchFormContainer = document.getElementById('searchFormContainer');
    searchFormContainer.classList.toggle('hidden'); // แสดงหรือซ่อน input search
    if (!searchFormContainer.classList.contains('hidden')) {
        searchFormContainer.querySelector('input[name="q"]').focus(); // โฟกัสไปที่ input
    }
});

// ปิด input search เมื่อคลิกนอก search form
document.addEventListener('click', function (event) {
    const searchFormContainer = document.getElementById('searchFormContainer');
    const searchIcon = document.getElementById('searchIcon');
    if (!searchFormContainer.contains(event.target) && event.target !== searchIcon) {
        searchFormContainer.classList.add('hidden');
    }
});

// การค้นหาแบบอัตโนมัติ
document.getElementById("searchInput").addEventListener("input", function () {
    clearTimeout(debounceTimeout);
    const query = this.value;
    const resultsContainer = document.getElementById("searchResults");

    if (query.length > 0) {
        fetch(`/search/result?q=${query}`)
            .then(response => response.json())
            .then(data => {
                resultsContainer.innerHTML = '';
                if (data.results.length > 0) {
                    resultsContainer.classList.remove("hidden");
                    data.results.forEach(result => {
                        resultsContainer.innerHTML += `
                            <div class="card p-3 border-b border-gray-200 hover:bg-gray-100">
                                <div class="flex items-center">
                                    <div class="ml-3">
                                        <h2 class="text-sm font-semibold text-gray-800">
                                            <a href="/read/${result.urlslug}" class="hover:underline text-blue-500">${result.title}</a>
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    resultsContainer.innerHTML = "<p class='text-gray-500 p-2'>ไม่พบผลลัพธ์</p>";
                }
            })
            .catch(error => {
                console.error("Error fetching search results:", error);
            });
    } else {
        resultsContainer.classList.add("hidden");
    }

    // ไม่มีการเรียกฟังก์ชัน fetchResults ที่นี่อีกแล้ว
    debounceTimeout = setTimeout(() => {}, 300);
});


// ฟังก์ชันสร้างหิมะ
// const canvas = document.getElementById('snowCanvas');
// const ctx = canvas.getContext('2d');

// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

// const snowflakes = [];


// function createSnowflake() {
//   return {
//     x: Math.random() * canvas.width,
//     y: Math.random() * canvas.height,
//     radius: Math.random() * 4 + 1,
//     speed: Math.random() * 1 + 0.5,
//     opacity: Math.random()
//   };
// }

// // สร้างหิมะเริ่มต้น
// for (let i = 0; i < 100; i++) {
//   snowflakes.push(createSnowflake());
// }

// // ฟังก์ชันวาดหิมะ
// function drawSnowflakes() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);
//   ctx.fillStyle = 'white';

//   snowflakes.forEach((flake) => {
//     ctx.globalAlpha = flake.opacity;
//     ctx.beginPath();
//     ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
//     ctx.fill();
//   });
// }

// // ฟังก์ชันอัปเดตหิมะ
// function updateSnowflakes() {
//   snowflakes.forEach((flake) => {
//     flake.y += flake.speed;
//     if (flake.y > canvas.height) {
//       flake.y = 0;
//       flake.x = Math.random() * canvas.width;
//     }
//   });
// }

// // อัปเดต Canvas
// function animate() {
//   drawSnowflakes();
//   updateSnowflakes();
//   requestAnimationFrame(animate);
// }

// // อัปเดตขนาดหน้าจอ
// window.addEventListener('resize', () => {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// });

// animate();
