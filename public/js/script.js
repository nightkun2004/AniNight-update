document.getElementById('searchIcon').addEventListener('click', function (event) {
    event.stopPropagation(); // หยุดการแพร่กระจายของคลิกไปที่เอกสาร
    const searchFormContainer = document.getElementById('searchFormContainer');
    searchFormContainer.classList.toggle('hidden'); // แสดงหรือซ่อน input search
    if (!searchFormContainer.classList.contains('hidden')) {
        searchFormContainer.querySelector('input[name="q"]').focus(); // โฟกัสไปที่ input
    }
});

// ปิด input search เมื่อคลิกนอก search form
document.addEventListener('click', function (event) {
    const searchFormContainer = document.getElementById('searchFormContainer');
    const searchIcon = document.getElementById('searchIcon');
    if (!searchFormContainer.contains(event.target) && event.target !== searchIcon) {
        searchFormContainer.classList.add('hidden');
    }
});