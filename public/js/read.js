// document.addEventListener('DOMContentLoaded', function () {
//     const images = document.querySelectorAll('.open-fullscreen');
//     const ReadFullscreen = document.querySelector('.open-windows-read');
//     const fullscreenModal = document.getElementById('fullscreenModal');
//     const fullscreenImage = document.getElementById('fullscreenImage');
//     const closeFullscreen = document.getElementById('closeFullscreen');
//     const prevImage = document.getElementById('prevImage');
//     const nextImage = document.getElementById('nextImage');
//     const toggleFullScreen = document.getElementById('toggleFullScreen');
//     const toggleFullScreen_Read = document.getElementById('btn-read-fullscreen');

//     let currentIndex = 0;

//     function openFullscreen(index) {
//         currentIndex = index;
//         fullscreenImage.src = images[currentIndex].src;
//         fullscreenModal.classList.remove('hidden');
//         fullscreenModal.classList.add('flex');
//     }

//     function closeFullscreenModal() {
//         fullscreenModal.classList.add('hidden');
//         fullscreenModal.classList.remove('flex');
//         exitFullScreen();
//     }

//     function showNextImage() {
//         currentIndex = (currentIndex + 1) % images.length;
//         fullscreenImage.src = images[currentIndex].src;
//     }

//     function showPrevImage() {
//         currentIndex = (currentIndex - 1 + images.length) % images.length;
//         fullscreenImage.src = images[currentIndex].src;
//     }

//     function toggleFullScreenMode() {
//         if (!document.fullscreenElement) {
//             fullscreenModal.requestFullscreen().then(() => {
//                 toggleFullScreen.innerHTML = '<i class="fa-solid fa-up-right-and-down-left-from-center"></i> ออกจากโหมดนี้';
//             }).catch(err => {
//                 alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
//             });
//         } else {
//             document.exitFullscreen().then(() => {
//                 toggleFullScreen.innerHTML = '<i class="fa-solid fa-expand"></i> ขยาย';
//             });
//         }
//     }

//     function toggleFullScreenRead() {
//         if (!document.fullscreenElement) {
//             ReadFullscreen.requestFullscreen().then(() => {
//                 toggleFullScreen_Read.innerHTML = '<i class="fa-solid fa-up-right-and-down-left-from-center"></i> ออกจากโหมดนี้';
//                 ReadFullscreen.classList.add('fullscreen-read');
//             }).catch(err => {
//                 alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
//             });
//         } else {
//             document.exitFullscreen().then(() => {
//                 toggleFullScreen_Read.innerHTML = '<i class="fa-solid fa-expand"></i> ขยาย';
//                 ReadFullscreen.classList.remove('fullscreen-read'); // ลบคลาสเมื่อออกจากโหมดเต็มหน้าจอ
//             });
//         }
//     }


//     function exitFullScreen() {
//         if (document.fullscreenElement) {
//             document.exitFullscreen();
//         }
//     }

//     images.forEach((image, index) => {
//         image.addEventListener('click', () => openFullscreen(index));
//     });

//     closeFullscreen.addEventListener('click', closeFullscreenModal);
//     nextImage.addEventListener('click', showNextImage);
//     prevImage.addEventListener('click', showPrevImage);
//     toggleFullScreen.addEventListener('click', toggleFullScreenMode);
//     toggleFullScreen_Read.addEventListener('click', toggleFullScreenRead);
// });

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
                confirmButtonColor: '#333',
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
// async function likeArticle(articleId) {
//     try {
//         const response = await fetch('/api/v2/articles/like', { 
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${getCookie('tksave')}`
//             },
//             body: JSON.stringify({ articleId })
//         });

//         const data = await response.json();

//         if (data.success) {
//             const likeButton = document.getElementById(`like-button-${articleId}`);
//             const heartIcon = likeButton.querySelector('i');
//             const likeCount = likeButton.querySelector('span');

//             if (data.message.includes('เพิ่มไลค์')) {
//                 heartIcon.classList.add('text-red-500');
//             } else {
//                 heartIcon.classList.remove('text-red-500');
//             }

//             likeCount.textContent = `${data.likes} Likes`;

//             Swal.fire({
//                 icon: 'success',
//                 title: data.message,
//                 didClose: () => {
//                     location.reload();
//                 }
//             });
//         } else {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'ข้อผิดพลาด',
//                 text: data.message,
//                 didClose: () => {
//                     location.reload();
//                 }
//             });
//         }
//     } catch (error) {
//         console.error('Error liking article:', error);
//         Swal.fire({
//             icon: 'error',
//             title: 'ข้อผิดพลาด',
//             confirmButtonColor: '#333',
//             text: 'เกิดข้อผิดพลาดในการไลค์บทความที่ไม่รู้จัก',
//         });
//     }
// }

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
// document.addEventListener('DOMContentLoaded', function () {
//     const shareButton = document.getElementById('share-button');
//     const sharePopup = document.getElementById('share-popup');
//     const copyLinkButton = document.getElementById('copy-link');
//     const shareButtons = document.querySelectorAll('.share-button');
//     const articleUrl = window.location.href;

//     // Toggle share popup
//     shareButton.addEventListener('click', function () {
//         sharePopup.classList.toggle('hidden');
//     });

//     // Copy link to clipboard
//     copyLinkButton.addEventListener('click', function () {
//         navigator.clipboard.writeText(articleUrl).then(() => {
//             popupalert.style.display = 'block';
//             setTimeout(() => {
//                 popupalert.style.display = 'none';
//             }, 2000);
//         }).catch(err => {
//             console.error('Error copying link:', err);
//         });
//     });

//     // Share to social platforms
//     shareButtons.forEach(button => {
//         button.addEventListener('click', function () {
//             const platform = this.dataset.platform;
//             const articleTitle = document.querySelector('input[name="articleTitle"]').value;
//             let shareUrl = '';

//             switch (platform) {
//                 case 'facebook':
//                     FB.ui({
//                         method: 'share',
//                         href: articleUrl,
//                         quote: articleTitle,
//                     }, function (response) { });
//                     break;
//                 case 'twitter':
//                     shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`;
//                     window.open(shareUrl, '_blank');
//                     break;
//                 case 'tiktok':
//                     shareUrl = `https://www.tiktok.com/share?url=${encodeURIComponent(articleUrl)}`;
//                     window.open(shareUrl, '_blank');
//                     break;
//                 case 'youtube':
//                     shareUrl = `https://www.youtube.com/share?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(articleTitle)}`;
//                     window.open(shareUrl, '_blank');
//                     break;
//                 default:
//                     console.error(`Unsupported platform: ${platform}`);
//                     break;
//             }
//             window.open(shareUrl, '_blank');
//         });
//     });

//     // Hide popup when clicking outside
//     document.addEventListener('click', function (event) {
//         if (!shareButton.contains(event.target) && !sharePopup.contains(event.target)) {
//             sharePopup.classList.add('hidden');
//         }
//     });
// });



function toggleFollow(channelId) {
    fetch(`/api/v2/user/follow/${channelId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'ติดตามสำเร็จ',
                    text: data.message,
                    confirmButtonText: 'ตกลง'
                }).then(() => {
                    location.reload(); // รีเฟรชหน้าเมื่อกดติดตาม
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: data.message
                });
            }
        })
        .catch(err => console.error(err));
}

function confirmUnfollow(channelId) {
    Swal.fire({
        title: 'ยืนยันการยกเลิกติดตาม?',
        text: "คุณต้องการยกเลิกการติดตามใช่หรือไม่?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ยกเลิกติดตาม!',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`/api/v2/user/unfollow/${channelId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    // ตรวจสอบสถานะของการตอบกลับ
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'ยกเลิกติดตามสำเร็จ',
                            text: data.message,
                            confirmButtonText: 'ตกลง'
                        }).then(() => {
                            location.reload(); // รีเฟรชหน้าเมื่อยกเลิกติดตาม
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'เกิดข้อผิดพลาด',
                            text: data.message
                        });
                    }
                })
                .catch(err => {
                    // แสดงข้อผิดพลาดที่เกิดขึ้น
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาดที่ไม่รู้จัก',
                        text: err.message // แสดงเฉพาะข้อความของข้อผิดพลาด
                    });
                });
        }
    });
}




function likeArticle(articleId) {
    fetch(`/api/v2/like/articles/${articleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const likeButton = document.getElementById(`like-button-${articleId}`);
                const likeCount = document.getElementById(`like-count-${articleId}`);

                // อัปเดตจำนวนไลค์
                likeCount.textContent = `${data.likesCount} ไลค์`;

                // เปลี่ยนสีไอคอน
                likeButton.querySelector('i').classList.toggle('text-red-500');
                likeButton.querySelector('i').classList.toggle('text-gray-500');

                // ใช้ SweetAlert แจ้งเตือน
                Swal.fire({
                    icon: 'success',
                    title: 'สำเร็จ',
                    text: 'การกดไลค์สำเร็จ!',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถกดไลค์ได้'
                });
            }
        })
        .catch(err => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'มีข้อผิดพลาดบางอย่าง'
            });
        });
}



$(document).ready(function () {
    let currentIndex = 0;
    const slides = $('.slide');
    const totalSlides = slides.length;

    function showSlide(index) {
        const offset = -index * 100;
        $('.slides').css('transform', `translateX(${offset}%)`);
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        showSlide(currentIndex);
    }

    // เลื่อนสไลด์ทุก 5 วินาที
    setInterval(nextSlide, 5000);

    // ปุ่มสำหรับเลื่อนสไลด์
    $('.next').click(function () {
        nextSlide();
    });

    $('.prev').click(function () {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        showSlide(currentIndex);
    });

    // เริ่มต้นการแสดงภาพแรก
    showSlide(currentIndex);
});


// =================================== Comment
document.addEventListener('DOMContentLoaded', () => {
    // ฟังก์ชั่นสำหรับดึงคุกกี้
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    // ฟังก์ชั่นแสดง Popup ให้เข้าสู่ระบบ
    function showLoginPopup() {
        const popup = document.getElementById('popup-login');
        popup.classList.remove('hidden');

        // ปิด Popup เมื่อกดปุ่ม Close
        document.getElementById('closePopup').addEventListener('click', () => {
            popup.classList.add('hidden');
        });
    }

    // ฟังก์ชั่นแสดง Popup แจ้งเตือนการแสดงความคิดเห็น
    function showCommentPopup() {
        const popup = document.getElementById('popup-comment');
        popup.classList.remove('hidden');

        // ปิด Popup เมื่อกดปุ่ม Close
        document.getElementById('closeCommentPopup').addEventListener('click', () => {
            popup.classList.add('hidden');
        });

        // ปิด Popup หลังจาก 3 วินาที
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 3000);
    }

    // ตรวจสอบค่าคุกกี้ Token
    const token = getCookie('tksave');
    console.log('Token in Cookie:', token);  // เพิ่ม log เพื่อตรวจสอบค่าคุกกี้

    const commentForm = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');
    const commentsDiv = document.getElementById('comments');
    const articleId = commentForm.getAttribute('data-articleid'); // แก้ไขตรงนี้

    console.log('Article ID comment:', articleId);

    // เมื่อกดปุ่ม submit
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // ตรวจสอบหากไม่มี Token ให้แสดง Popup
        if (!token) {
            showLoginPopup();
            return;  // ไม่ทำการส่งข้อมูล
        }

        const comment = commentInput.value;
        console.log("รับค่า input Comment", comment)

        // ส่งข้อมูลความคิดเห็นผ่าน API
        fetch('/api/v2/add/comment/article', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                postId: articleId,
                comment: comment,
                userId: token,
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log("Comment added:", data);
                // แสดง Popup แจ้งเตือนแสดงความคิดเห็นสำเร็จ
                showCommentPopup();

                // เคลียร์ช่องข้อความหลังจากส่ง
                commentInput.value = '';
            })
            .catch(error => {
                console.error("Error adding comment:", error);
            });
    });

    // โหลดความคิดเห็นที่มีอยู่เมื่อโหลดหน้าเว็บ
    const loadComments = async () => {
        const response = await fetch(`/api/v2/article/comments/${articleId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        const comments = await response.json();
        console.log(comments);

        // อัปเดตจำนวนความคิดเห็นใน <span id="commentsAll">
        const commentsCount = comments.length;
        document.getElementById('commentsAll').textContent = `(${commentsCount})`;

        // เช็คว่าไม่มีความคิดเห็น
        if (comments.length === 0) {
            commentsDiv.innerHTML = '<p>คุณแสดงความคิดเห็นเป็นคนแรก</p>';
            return;
        }

        const checkImageUrl = (url) => {
            // เช็คว่า URL เริ่มต้นด้วย http:// หรือ https:// หรือไม่
            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                return url;
            }
            return `https://ani-night.online/uploads/profiles/${url}`;
        };

        comments.forEach(commentData => {
            const commentItem = document.createElement('div');
            commentItem.classList.add('comment-item');

            const profleUrl = checkImageUrl(commentData.userId.profilePicture || 'https://via.placeholder.com/150');

            // แปลงวันที่ให้เป็นรูปแบบ "21 พ.ย. 2024 เวลา 11:54"
            const commentDate = new Date(commentData.createdAt);

            // แปลงวันที่ให้เป็น ค.ศ.
            const formattedDate = new Intl.DateTimeFormat('th-TH', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }).format(commentDate);
            const formattedDateWithCE = formattedDate.replace(/\d{4}/, (year) => parseInt(year) - 543);

            // เวลา
            const formattedTime = commentDate.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
            });

            commentItem.innerHTML = `
                <div class="flex items-start space-x-4">
                    <!-- ใช้ profile picture ที่ดึงมา -->
                    <img src="${profleUrl}" alt="${commentData.userId.username}" class="w-12 h-12 rounded-full">
                    <div class="bg-white p-2 rounded-lg w-full">
                        <!-- ใช้ username ที่ดึงมา -->
                        <h3 class="text-sm font-semibold text-gray-800">${commentData.userId.username}</h3>
                        <!-- แสดงวันที่และเวลา -->
                        <p class="text-xs text-gray-500 mb-1">${formattedDateWithCE} เวลา ${formattedTime}</p>
                        <p class="text-gray-700 mb-2">${commentData.comment}</p>
                    </div>
                </div>
                <div class="nested-comments ml-12 mt-4">
                    <!-- ตัวอย่างความคิดเห็นย่อย -->
                </div>
            `;

            commentsDiv.appendChild(commentItem);
        });
    };



    // เรียกใช้ฟังก์ชันโหลดความคิดเห็น
    loadComments();
});
{/* <button class="reply-button text-blue-500 text-sm hover:underline">
ตอบกลับ
</button> */}