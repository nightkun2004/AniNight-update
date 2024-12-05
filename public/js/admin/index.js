const aside = document.getElementById('aside');
const toggleAside = document.getElementById('toggleAside');
const mainContent = document.getElementById('mainContent');

let isAsideOpen = false;

toggleAside.addEventListener('click', () => {
    isAsideOpen = !isAsideOpen;

    if (isAsideOpen) {
        // เปิด aside
        aside.classList.remove('hidden');
        mainContent.classList.remove('expanded');
        mainContent.classList.add('collapsed');
    } else {
        // ปิด aside
        aside.classList.add('hidden');
        mainContent.classList.remove('collapsed');
        mainContent.classList.add('expanded');
    }
});

toggleAside.addEventListener('click', () => {
 aside.classList.toggle('open');  // สลับ class เพื่อเปิด/ปิด aside
});
