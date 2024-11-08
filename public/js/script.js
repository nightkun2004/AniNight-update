// เมื่อคลิกที่ไอคอน Search ให้แสดงหรือซ่อนฟอร์มค้นหา
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
});
