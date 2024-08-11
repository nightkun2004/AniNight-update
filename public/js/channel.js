function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function toggleFollow() {
    const button = document.getElementById('followButton');
    const userId = document.querySelector('h1[data-userid]').dataset.userid;
    const action = button.textContent === 'ติดตาม' ? 'follow' : 'followers';
    const token = getCookie('token');
    console.log(action);

    try {
        const response = await fetch(`/channel/${action}/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, userId, token })
        });
        console.log(response);

        if (response.ok) {
            if (action === 'follow') {
                button.textContent = 'กดติดตามแล้ว';
                button.classList.remove('bg-indigo-600');
                button.classList.add('bg-gray-400');
            } else {
                button.textContent = 'ติดตาม';
                button.classList.remove('bg-gray-400');
                button.classList.add('bg-indigo-600');
            }
        } else {
            console.error('Failed to follow/unfollow');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
