async function searchUsers() {
    const searchName = document.getElementById('searchName').value;

    try {
        const response = await fetch('/admin/filter-users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchName })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        updateUserSelect(result.users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function updateUserSelect(users) {
    const userSelect = document.getElementById('userIdToUpdate');
    userSelect.innerHTML = ''; // Clear existing options

    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user._id;
        option.textContent = `${user.username} - ${user.email}`;
        userSelect.appendChild(option);
    });
}

function filterOptions() {
    const searchQuery = document.getElementById('searchUser').value.toLowerCase();
    const options = document.querySelectorAll('#userIdToUpdate option:not([disabled])');

    options.forEach(option => {
        const username = option.getAttribute('data-username').toLowerCase();
        const email = option.getAttribute('data-email').toLowerCase();
        if (username.includes(searchQuery) || email.includes(searchQuery)) {
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        }
    });
}