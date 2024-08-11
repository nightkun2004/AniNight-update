document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('.open-fullscreen');
    const ReadFullscreen = document.querySelector('.open-windows-read');
    const fullscreenModal = document.getElementById('fullscreenModal');
    const fullscreenImage = document.getElementById('fullscreenImage');
    const closeFullscreen = document.getElementById('closeFullscreen');
    const prevImage = document.getElementById('prevImage');
    const nextImage = document.getElementById('nextImage');
    const toggleFullScreen = document.getElementById('toggleFullScreen');
    const toggleFullScreen_Read = document.getElementById('btn-read-fullscreen');

    let currentIndex = 0;

    function openFullscreen(index) {
        currentIndex = index;
        fullscreenImage.src = images[currentIndex].src;
        fullscreenModal.classList.remove('hidden');
        fullscreenModal.classList.add('flex');
    }

    function closeFullscreenModal() {
        fullscreenModal.classList.add('hidden');
        fullscreenModal.classList.remove('flex');
        exitFullScreen();
    }

    function showNextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        fullscreenImage.src = images[currentIndex].src;
    }

    function showPrevImage() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        fullscreenImage.src = images[currentIndex].src;
    }

    function toggleFullScreenMode() {
        if (!document.fullscreenElement) {
            fullscreenModal.requestFullscreen().then(() => {
                toggleFullScreen.innerHTML = '<i class="fa-solid fa-up-right-and-down-left-from-center"></i> ออกจากโหมดนี้';
            }).catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen().then(() => {
                toggleFullScreen.innerHTML = '<i class="fa-solid fa-expand"></i> ขยาย';
            });
        }
    }

    function toggleFullScreenRead() {
        if (!document.fullscreenElement) {
            ReadFullscreen.requestFullscreen().then(() => {
                toggleFullScreen_Read.innerHTML = '<i class="fa-solid fa-up-right-and-down-left-from-center"></i> ออกจากโหมดนี้';
                ReadFullscreen.classList.add('fullscreen-read');
            }).catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen().then(() => {
                toggleFullScreen_Read.innerHTML = '<i class="fa-solid fa-expand"></i> ขยาย';
                ReadFullscreen.classList.remove('fullscreen-read'); // ลบคลาสเมื่อออกจากโหมดเต็มหน้าจอ
            });
        }
    }


    function exitFullScreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }

    images.forEach((image, index) => {
        image.addEventListener('click', () => openFullscreen(index));
    });

    closeFullscreen.addEventListener('click', closeFullscreenModal);
    nextImage.addEventListener('click', showNextImage);
    prevImage.addEventListener('click', showPrevImage);
    toggleFullScreen.addEventListener('click', toggleFullScreenMode);
    toggleFullScreen_Read.addEventListener('click', toggleFullScreenRead);
});

// save API to User
// Function to get the value of a specific cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Function to save the article
async function saveArticle(articleId) {
    try {
        const token = getCookie('tksave');

        if (!token) {
            Swal.fire({
                icon: 'warning',
                title: 'คุณยังไม่ได้เข้าสู่ระบบ',
                text: 'กรุณาเข้าสู่ระบบก่อนบันทึกบทความ',
                confirmButtonText: 'เข้าสู่ระบบ',
                cancelButtonText: 'ยกเลิก',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                preConfirm: () => {
                    window.location.href = '/auth/login'; // เปลี่ยนเส้นทางไปยังหน้าล็อกอิน
                }
            });
            return;
        }

        const response = await fetch('/api/v2/save/article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ articleId })
        });

        const data = await response.json();

        if (data.success) {
            const bookmarkIcon = document.getElementById(`bookmark-${articleId}`);
            if (data.saved) {
                bookmarkIcon.classList.add('text-blue-500'); // Add blue class if saved
            } else {
                bookmarkIcon.classList.remove('text-blue-500'); // Remove blue class if not saved
            }
            Swal.fire({
                icon: 'success',
                title: data.message || 'สำเร็จ',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'ข้อผิดพลาด',
                text: `ไม่สามารถบันทึกบทความได้: ${data.message}`,
            });
        }
    } catch (error) {
        console.error('Error saving article:', error);
        Swal.fire({
            icon: 'error',
            title: 'ข้อผิดพลาดยังไม่ได้เข้าสู่ระบบ',
            text: 'เกิดข้อผิดพลาดในการบันทึกบทความ',
        });
    }
}


// JavaScript ฟังก์ชันสำหรับไลค์บทความ
async function likeArticle(articleId) {
    try {
        const response = await fetch('/api/v2/articles/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('tksave')}`
            },
            body: JSON.stringify({ articleId })
        });

        const data = await response.json();

        if (data.success) {
            const likeButton = document.getElementById(`like-button-${articleId}`);
            const heartIcon = likeButton.querySelector('i');
            const likeCount = likeButton.querySelector('span');

            if (data.message.includes('เพิ่มไลค์')) {
                heartIcon.classList.add('text-red-500');
            } else {
                heartIcon.classList.remove('text-red-500');
            }

            likeCount.textContent = `${data.likes} Likes`;

            Swal.fire({
                icon: 'success',
                title: data.message,
                didClose: () => {
                    location.reload();
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'ข้อผิดพลาด',
                text: data.message,
                didClose: () => {
                    location.reload();
                }
            });
        }
    } catch (error) {
        console.error('Error liking article:', error);
        Swal.fire({
            icon: 'error',
            title: 'ข้อผิดพลาด',
            text: 'เกิดข้อผิดพลาดในการไลค์บทความ || เซสชันของคุณหมดอายุโปรออกจากระบบแล้วเข้าสู่ระบบใหม่',
            didClose: () => {
                location.reload();
            }
        });
    }
}

// ads Displayed
// Function to track ad display
function trackAdDisplay(articleId) {
    fetch(`/api/v2/track-ad-display/${articleId}`, {
        method: 'POST'
    }).catch(error => console.error('Error tracking ad display:', error));
}

// Function to check if ad is displayed and update the data-attribute
function checkAdDisplay() {
    const adContainer = document.getElementById('ad-container');
    if (!adContainer) return;

    const articleId = adContainer.getAttribute('data-article-id');
    const adDisplayed = adContainer.getAttribute('data-ad-displayed');

    if (articleId && adDisplayed === 'false') {
        // Update the data-attribute to indicate that the ad has been displayed
        adContainer.setAttribute('data-ad-displayed', 'true');
        trackAdDisplay(articleId);
    }
}

// Call the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAdDisplay();
});


// แชร์ POPUP
document.addEventListener('DOMContentLoaded', function () {
    const shareButton = document.getElementById('share-button');
    const sharePopup = document.getElementById('share-popup');
    const copyLinkButton = document.getElementById('copy-link');
    const shareButtons = document.querySelectorAll('.share-button');
    const articleUrl = window.location.href;

    // Toggle share popup
    shareButton.addEventListener('click', function () {
        sharePopup.classList.toggle('hidden');
    });

    // Copy link to clipboard
    copyLinkButton.addEventListener('click', function () {
        navigator.clipboard.writeText(articleUrl).then(() => {
            popupalert.style.display = 'block';
            setTimeout(() => {
                popupalert.style.display = 'none';
            }, 2000);
        }).catch(err => {
            console.error('Error copying link:', err);
        });
    });

    window.fbAsyncInit = function () {
        FB.init({
            appId: '1075150200774995',
            status: true,
            cookie: true,
            xfbml: true,
            version: 'v20.0'
        });

        FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) { return; }
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Share to social platforms
    shareButtons.forEach(button => {
        button.addEventListener('click', function () {
            const platform = this.dataset.platform;
            const articleTitle = document.querySelector('input[name="articleTitle"]').value;
            let shareUrl = '';

            switch (platform) {
                case 'facebook':
                    FB.ui({
                        method: 'share',
                        href: articleUrl,
                        quote: articleTitle,
                    }, function (response) { });
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`;
                    window.open(shareUrl, '_blank');
                    break;
                case 'tiktok':
                    shareUrl = `https://www.tiktok.com/share?url=${encodeURIComponent(articleUrl)}`;
                    window.open(shareUrl, '_blank');
                    break;
                case 'youtube':
                    shareUrl = `https://www.youtube.com/share?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(articleTitle)}`;
                    window.open(shareUrl, '_blank');
                    break;
                default:
                    console.error(`Unsupported platform: ${platform}`);
                    break;
            }
            window.open(shareUrl, '_blank');
        });
    });

    // Hide popup when clicking outside
    document.addEventListener('click', function (event) {
        if (!shareButton.contains(event.target) && !sharePopup.contains(event.target)) {
            sharePopup.classList.add('hidden');
        }
    });
});