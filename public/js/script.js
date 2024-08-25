const toggleSidebarButton = document.getElementById('toggleSidebar');
const closeSidebarButton = document.getElementById('closeSidebar');
const sidebar = document.getElementById('sidebar');

toggleSidebarButton.addEventListener('click', function () {
    sidebar.classList.toggle('sidebar-open');
});

closeSidebarButton.addEventListener('click', function () {
    sidebar.classList.remove('sidebar-open');
});

window.addEventListener('click', function (event) {
    if (!sidebar.contains(event.target) && !toggleSidebarButton.contains(event.target)) {
        sidebar.classList.remove('sidebar-open');
    }
});

window.onload = function () {
    const progressBar = document.getElementById('progress-bar');

    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            progressBar.style.opacity = 0;
        } else {
            width++;
            progressBar.style.width = width + '%';
        }
    }, 20);
};

window.onload = function () {
    document.getElementById('loading-content').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
}

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('bg-black', 'text-white');
    body.classList.remove('bg-white', 'text-black');
    themeToggle.checked = true;
    document.querySelector('.dot').classList.add('translate-x-full', 'bg-white');
    document.querySelector('.block-dack').classList.add('bg-green-500');
}

themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
        body.classList.add('bg-black', 'text-white');
        body.classList.remove('bg-white', 'text-black');
        localStorage.setItem('theme', 'dark');
        document.querySelector('.dot').classList.add('translate-x-full', 'bg-white');
        document.querySelector('.block-dack').classList.add('bg-green-500');
        document.querySelector('.block-dack').classList.remove('bg-gray-100');
    } else {
        body.classList.add('bg-gray.100', 'text-white');
        body.classList.remove('bg-black', 'text-white');
        localStorage.setItem('theme', 'light');
        document.querySelector('.dot').classList.remove('translate-x-full', 'bg-black');
        document.querySelector('.block-dack').classList.add('bg-gray-100');
        document.querySelector('.block-dack').classList.remove('bg-green-500');
    }
});