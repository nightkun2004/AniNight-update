document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll('.lazyload');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const image = entry.target;
                image.src = image.getAttribute('data-src');
                image.onload = () => image.style.opacity = 1;
                observer.unobserve(image);
            }
        });
    });

    images.forEach(image => {
        observer.observe(image);
    });
});
