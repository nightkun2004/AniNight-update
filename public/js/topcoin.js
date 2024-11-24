let selectedPriceId = null;
let selectedAmount = null;
const profileContent = document.getElementById('profile-content'); 
let userEmail = profileContent ? profileContent.dataset.useremail : null;
console.log(userEmail);


function selectItem(element, priceId, amount) {
    // Hide "กำลังเลือก" text from all items
    const items = document.querySelectorAll('.item .selection-text');
    items.forEach(item => item.classList.add('hidden'));

    // Show "กำลังเลือก" for the clicked item
    const selectionText = element.querySelector('.selection-text');
    selectionText.classList.remove('hidden');

    // Show "ชำระเงิน" button
    const payButton = document.getElementById('payButton');
    payButton.classList.remove('hidden');

    // Store selected price ID and amount
    selectedPriceId = priceId;
    selectedAmount = amount; // Make sure amount is a number
}

async function checkout() {
    if (!selectedPriceId) {
        alert('กรุณาเลือกไอเทมก่อนชำระเงิน');
        return;
    }

    try {
        const response = await axios.post('/create-checkout-session', {
            priceId: selectedPriceId,
            amount: Number(selectedAmount), 
            email: userEmail
        });

        const session = response.data;
        window.open(session.url, '_blank');
    } catch (error) {
        console.error('Error during checkout:', error);
        alert('เกิดข้อผิดพลาดในการชำระเงิน กรุณาลองอีกครั้ง');
    }
}
