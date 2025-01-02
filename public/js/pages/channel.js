document.addEventListener('DOMContentLoaded', function () {
    // ฟังก์ชันสำหรับติดตาม
    function toggleFollow(channelId) {
        fetch(`/api/v2/user/follow/${channelId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'ติดตามสำเร็จ',
                        text: data.message,
                        confirmButtonText: 'ตกลง'
                    }).then(() => location.reload());
                } else {
                    Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: data.message });
                }
            })
            .catch(err => console.error(err));
    }

    // ฟังก์ชันสำหรับยกเลิกติดตาม
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
                    headers: { 'Content-Type': 'application/json' }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'ยกเลิกติดตามสำเร็จ',
                                text: data.message,
                                confirmButtonText: 'ตกลง'
                            }).then(() => location.reload());
                        } else {
                            Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: data.message });
                        }
                    })
                    .catch(err => Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาดที่ไม่รู้จัก',
                        text: err.message
                    }));
            }
        });
    }

    // เพิ่ม Event Listener ให้กับปุ่มทั้งหมด
    document.querySelectorAll('.follow-btn').forEach(button => {
        button.addEventListener('click', () => {
            const channelId = button.getAttribute('data-channel-id');
            toggleFollow(channelId);
        });
    });

    document.querySelectorAll('.unfollow-btn').forEach(button => {
        button.addEventListener('click', () => {
            const channelId = button.getAttribute('data-channel-id');
            confirmUnfollow(channelId);
        });
    });

    // สำหรับโหลดข้อมูลของผู้ใช้ที่เข้าชมหน้า Channel
    let currentPage = 1;
    let isLoading = false;
    const container = document.querySelector('.MainContent');
    const userID = document.querySelector('body').dataset.userid;

    const fetchArticles = async (page) => {
        if (isLoading) return;
        isLoading = true;

        const url = `/api/v2/article/${userID}/datas`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ page }),
            });

            const data = await response.json();

            const checkImageUrl = (url) => {
                if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                    return url;
                }
                return `https://ani-night.online/uploads/thumbnails/${url}`;
            };

            if (data.articles.length === 0 && !data.hasNext) {
                const loadingElement = document.getElementById('loading');
                loadingElement.innerHTML = '<p>โหลดข้อมูลหมดแล้วขอรับ</p>';
            } else {
                data.articles.forEach(article => {
                    const thumbnailUrl = checkImageUrl(article.thumbnail || '/uploads/thumbnails/default.png');

                    const articleCard = `
                    <article class="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 hover:bg-blue-400 hover:text-white cursor-pointer">
                        <picture class="lazyload-article">
                            <a href="/read/${article.urlslug}">
                                <img class="lazyload-article w-full h-48 object-cover" src="${thumbnailUrl}" alt="${article.title}" loading="lazy" />
                            </a>
                        </picture>
    
                        <div class="p-6">
                            <h2 class="text-xl font-bold mb-2 line-clamp-2">
                                <a href="/read/${article.urlslug}" class="hover:text-blue-500">${article.title}</a>
                            </h2>
                        </div>
                    </article>
                    `;
                    container.insertAdjacentHTML('beforeend', articleCard);
                });
            }

            if (!data.hasNext) {
                const loadingElement = document.getElementById('loading');
                loadingElement.innerHTML = '<p>โหลดข้อมูลหมดแล้วขอรับ</p>';
                window.removeEventListener('scroll', handleScroll);
            } else {
                currentPage += 1; // เพิ่มหน้าถัดไป
            }
        } catch (err) {
            console.error(err);
        } finally {
            isLoading = false;
        }
    };

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
            fetchArticles(currentPage);
        }
    };

    window.onload = () => {
        window.addEventListener('scroll', handleScroll);
        fetchArticles(currentPage); // โหลดข้อมูลครั้งแรก
    };

});
