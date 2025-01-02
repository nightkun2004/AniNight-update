// ฟังก์ชั่นการเลื่อน sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('-left-64');  // ซ่อน sidebar
  sidebar.classList.toggle('left-0');   // แสดง sidebar
}

// ปิด sidebar เมื่อคลิกที่ส่วนอื่น ๆ ของหน้า
function closeSidebarOnClickOutside(event) {
  const sidebar = document.getElementById('sidebar');
  const toggleButtons = document.querySelectorAll('.btn_menus');
  const isSidebar = sidebar.contains(event.target);
  const isButton = Array.from(toggleButtons).some(button => button.contains(event.target));

  if (!isSidebar && !isButton) {
    sidebar.classList.add('-left-64');  // ซ่อน sidebar
    sidebar.classList.remove('left-0'); // ซ่อน sidebar
  }
}

// เพิ่ม event listener ให้กับปุ่มที่มี id "toggle-sidebar-1" และ "toggle-sidebar-2"
document.getElementById('toggle-sidebar-1').addEventListener('click', toggleSidebar);
document.getElementById('toggle-sidebar-2').addEventListener('click', toggleSidebar);

// เพิ่ม event listener ให้กับคลิกที่หน้าพื้นที่ทั้งหมด
document.body.addEventListener('click', closeSidebarOnClickOutside);


// เปิด Popup เมื่อคลิกที่ปุ่ม
document.getElementById('open-popup-login').addEventListener('click', function() {
  document.getElementById('popup-login').classList.remove('hidden');
});

// ปิด Popup เมื่อคลิกที่ปุ่มปิด (×)
document.getElementById('close-popup-login').addEventListener('click', function() {
  document.getElementById('popup-login').classList.add('hidden');
});

// ปิด Popup เมื่อคลิกที่พื้นที่นอก Popup
document.getElementById('popup-login').addEventListener('click', function(event) {
  if (event.target === this) {
      document.getElementById('popup-login').classList.add('hidden');
  }
});

document.getElementById('toggle-password').addEventListener('click', function() {
  const passwordField = document.getElementById('password');
  const type = passwordField.type === 'password' ? 'text' : 'password';
  passwordField.type = type;
});

// search
let debounceTimeout;


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