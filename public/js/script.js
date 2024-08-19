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

window.onload = function() {
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

window.onload = function() {
    document.getElementById('loading-content').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
}