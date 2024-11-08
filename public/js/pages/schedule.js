// Toggle menu function for Year, Season, Format
function toggleMenu(menuClass) {
    document.querySelector(menuClass).classList.toggle("hidden");
}

const searchInput = document.querySelector('input[type="search"]');
searchInput.addEventListener('input', function () {
    const query = this.value.trim();
    // เรียกใช้งานฟังก์ชันกรองที่นี่
    updateResults(query);  // ตัวอย่างฟังก์ชันในการกรอง
});

function updateResults(query) {
    // ทำการกรองหรือเรียก API ที่นี่
    console.log(`Searching for: ${query}`);
}

// Function to update the selected filter result
function updateResult(query) {
    const year = document.querySelector(".select_year-btn .option").textContent.trim();
    const season = document.querySelector(".select_Season .option").textContent.trim();
    const format = document.querySelector(".select_Format .option").textContent.trim();
    document.querySelector(".result").textContent = `กรองผลลัพธ์: ${year}, ${season}, ${format}`;

    const url = `/filter/anime?year=${year}&season=${season}&format=${format}`;
    console.log(url);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            const resultContainer = document.querySelector('.result-content');
            resultContainer.innerHTML = '';

            if (data.results.length > 0) {
                // ใช้ data.results เพื่อเข้าถึงอนิเมะ
                data.results.forEach(anime => {  // แก้ไขจาก data เป็น data.results
                    const animeItem = document.createElement('div');
                    animeItem.classList.add('anime-card', 'overflow-hidden');
                    animeItem.innerHTML = `
                    <a href="/anime/${anime.urlslug}" data-popover-target="popover-${anime._id}" class="cover w-[150px] h-[225px] sm:h-[115px] rounded-lg overflow-hidden">
                        <img src="${anime.poster.startsWith('http') ? anime.poster : '/uploads/posters/' + anime.poster}" alt="${anime.title}" class="w-full rounded-lg">
                    </a>
                    <div data-popover id="popover-${anime._id}" role="tooltip" class="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
                        <div class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
                            <h3 class="font-semibold text-gray-900 dark:text-white">Popover title</h3>
                        </div>
                        <div class="px-3 py-2">
                            <p>And here's some amazing content. It's very engaging. Right?</p>
                        </div>
                        <div data-popper-arrow></div>
                    </div>
                    <div class="anime-info">
                        <h2 class="text-sm font-bold">${anime.title}</h2>
                    </div>
                `;
                    resultContainer.appendChild(animeItem);
                });
            } else {
                resultContainer.innerHTML = '<p>ไม่พบอนิเมะที่ตรงกับการกรอง</p>';
            }
        })
        .catch(error => console.error('Error:', error));
}

// Event listeners for Year, Season, and Format selection
document.querySelectorAll(".card_year .option").forEach((option) => {
    option.addEventListener("click", (e) => {
        document.querySelector(".select_year-btn .option").textContent = e.target.textContent;
        updateResult();
        toggleMenu('.card_year');
    });
});

document.querySelectorAll(".card_Season .option").forEach((option) => {
    option.addEventListener("click", (e) => {
        document.querySelector(".select_Season .option").textContent = e.target.textContent;
        updateResult();
        toggleMenu('.card_Season');
    });
});

document.querySelectorAll(".card_format .option").forEach((option) => {
    option.addEventListener("click", (e) => {
        document.querySelector(".select_Format .option").textContent = e.target.textContent;
        updateResult();
        toggleMenu('.card_format');
    });
});