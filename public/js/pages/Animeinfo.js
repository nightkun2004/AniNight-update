async function toggleBookmark(animeid) {
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

        const response = await fetch(`/anime/bookmark/${animeid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ animeid })
        });

        const data = await response.json();

        if (data.success) {
            const bookmarkIcon = document.getElementById(`bookmark-${animeid}`);
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



function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}