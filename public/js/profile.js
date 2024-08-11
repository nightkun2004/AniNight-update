// async function edit() {
//     const form = document.getElementById('edit-profile-form');
//     const formData = new FormData(form);
    
//     const iduser = document.querySelector('.iduser');
//     let token = iduser ? iduser.dataset.iduser : null;

//     if (!token) {
//         console.error('No authentication token found.');
//         return;
//     }

//     try {
//         const response = await axios.post('https://api.ani-night.online/api/users/edit/profile/detaills', formData, {
//             headers: {
//                 'Authorization': 'Bearer ' + token,
//                 'Content-Type': 'multipart/form-data'
//             }
//         });

//         const session = response.data;
//         window.location.href = '/';
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// const iduser = document.querySelector('.iduser');
// let token = iduser ? iduser.dataset.iduser : null;
// console.log(token);


function logout(event) {
    event.preventDefault();
    Swal.fire({
        title: 'คุณแน่ใจหรือไม่?',
        text: "คุณต้องการออกจากระบบหรือไม่?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ใช่, ออกจากระบบ!',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            document.getElementById('logoutForm').submit();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.getElementById('menu-button');
    const menuContent = document.getElementById('menu-content');
    
    menuButton.addEventListener('click', () => {
        menuContent.classList.toggle('hidden');
    });

    // Close the menu if clicked outside
    document.addEventListener('click', (event) => {
        if (!menuButton.contains(event.target) && !menuContent.contains(event.target)) {
            menuContent.classList.add('hidden');
        }
    });
});