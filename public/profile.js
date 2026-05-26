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
            itemEl.className = 'listing-card';

            const imageHtml = item.image_url 
                ? `<img src="${item.image_url}" alt="${item.title}" class="listing-image">`
                : `<div class="listing-image" style="background-color: #ddd; display: flex; align-items: center; justify-content: center; color: #999;">No Image</div>`;

            itemEl.innerHTML = `
                <div class="listing-image-wrapper">
                    ${imageHtml}
                </div>
                <div class="listing-details">
                    <h3>${item.title}</h3>
                    <p class="listing-description">${item.description}</p>
                    <p class="listing-price">R${parseFloat(item.price).toFixed(2)}</p>
                    <div class="listing-actions">
                        <a href="item.html?id=${item.id}" class="btn btn-register">View</a>
                        <button type="button" class="btn btn-login delete-btn" data-id="${item.id}">Delete</button>
                    </div>
                </div>
            `;
            container.appendChild(itemEl);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const listingId = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this listing?')) {
                    deleteListing(listingId);
                }
            });
        });
    })
    .catch(error => console.error('Error loading listings:', error));
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
    .catch(error => {
        alert('Error deleting listing: ' + error.message);
        console.error('Error:', error);
    });
}

// Check if user is admin and show admin tab
function checkAdminStatus() {
    fetch("api/check_session.php", {
        credentials: 'include',
        cache: 'no-store'
    })
    .then(response => response.json())
    .then(data => {
        if (data.logged_in && data.is_admin) {
            document.getElementById("adminTabBtn").style.display = "block";
        }
    })
    .catch(error => console.error('Error checking admin status:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    loadUserListings();
    checkAdminStatus();

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