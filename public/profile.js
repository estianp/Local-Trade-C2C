function loadUserProfile() {
    fetch('api/get_user_profile.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('editUsername').value = data.user.username;
            document.getElementById('editEmail').value = data.user.email || '';
        }
    })
    .catch(error => console.error('Error loading profile:', error));
}

function loadUserListings() {
    fetch('api/get_user_listings.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById('userListingsContainer');
        container.innerHTML = '';

        if (!data.listings || data.listings.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #666;">No listings yet. <a href="sell.html">Create one</a></p>';
            return;
        }

        data.listings.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'item-card';

            const imageHtml = item.image_url 
                ? `<img src="${item.image_url}" alt="${item.title}" class="item-image">`
                : `<div class="item-image" style="background-color: #ddd; display: flex; align-items: center; justify-content: center; color: #999;">No Image</div>`;

            itemEl.innerHTML = `
                ${imageHtml}
                <h3>${item.title}</h3>
                <p class="item-description">${item.description}</p>
                <p class="item-price">R${parseFloat(item.price).toFixed(2)}</p>
                <div style="display: flex; gap: 10px;">
                    <a href="item.html?id=${item.id}" class="btn btn-register" style="flex: 1; text-align: center;">View</a>
                    <button class="btn btn-login" onclick="deleteListingPrompt(${item.id})" style="flex: 1;">Delete</button>
                </div>
            `;
            container.appendChild(itemEl);
        });
    })
    .catch(error => console.error('Error loading listings:', error));
}

function deleteListingPrompt(listingId) {
    if (confirm('Are you sure you want to delete this listing?')) {
        deleteListing(listingId);
    }
}

function deleteListing(listingId) {
    fetch('api/delete_listing.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({id: listingId})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadUserListings();
        } else {
            alert('Error deleting listing: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadUserListings();

    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            const tabContents = document.querySelectorAll('.tab-content');
            const tabButtons = document.querySelectorAll('.tab-btn');

            tabContents.forEach(content => content.classList.remove('active'));
            tabButtons.forEach(btn => btn.classList.remove('active'));

            document.getElementById(tabName).classList.add('active');
            this.classList.add('active');
        });
    });

    document.getElementById('profileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const newUsername = document.getElementById('editUsername').value;
        const formData = {
            username: newUsername
        };

        fetch('api/update_user_profile.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            const errorEl = document.getElementById('profileError');
            const successEl = document.getElementById('profileSuccess');

            if (data.success) {
                errorEl.style.display = 'none';
                successEl.textContent = 'Profile updated successfully!';
                successEl.style.display = 'block';
                document.getElementById('username').textContent = newUsername;
                checkSession();
                setTimeout(() => successEl.style.display = 'none', 3000);
            } else {
                successEl.style.display = 'none';
                errorEl.textContent = data.message;
                errorEl.style.display = 'block';
            }
        });
    });
});