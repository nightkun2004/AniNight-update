let selectedPriceId = null;
const profileContent = document.querySelector('.profile-content');
let userEmail = profileContent ? profileContent.dataset.useremail : null;
console.log(userEmail)

function selectItem(element, priceId) {
    // ซ่อนข้อความ "กำลังเลือก" จากไอเทมทั้งหมด
    const items = document.querySelectorAll('.item .selection-text');
    items.forEach(item => item.classList.add('hidden'));
    
    // แสดงข้อความ "กำลังเลือก" สำหรับไอเทมที่ถูกคลิก
    const selectionText = element.querySelector('.selection-text');
    selectionText.classList.remove('hidden');
    
    // แสดงปุ่ม "ชำระเงิน"
    const payButton = document.getElementById('payButton');
    payButton.classList.remove('hidden');
    
    // บันทึกราคา ID ที่เลือกไว้
    selectedPriceId = priceId;
}

async function checkout() {
    if (!selectedPriceId) {
        alert('กรุณาเลือกไอเทมก่อนชำระเงิน');
        return;
    }

    try {
        const response = await axios.post('/create-checkout-session', {
            priceId: selectedPriceId,
            email: userEmail
        });

        const session = response.data;

        window.location.href = session.url;
    } catch (error) {
        console.error('Error:', error);
    }
}