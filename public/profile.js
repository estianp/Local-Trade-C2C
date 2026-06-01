function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(tabName);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function loadUserProfile() {
    console.log('Loading user profile...');
    fetch('api/get_user_profile.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Profile data:', data);
        if (data.success) {
            document.getElementById('editUsername').value = data.user.username;
            document.getElementById('editEmail').value = data.user.email || '';
            
            // Load trust score
            console.log('Loading trust score for user:', data.user.id);
            loadTrustScore(data.user.id);
        }
    })
    .catch(error => console.error('Error loading profile:', error));
}

function loadTrustScore(userId) {
    console.log('Fetching ratings for user:', userId);
    fetch(`api/get_user_ratings.php?user_id=${userId}`)
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Ratings data received:', data);
            if (data.success) {
                const rating = parseFloat(data.average_rating);
                const totalRatings = parseInt(data.total_ratings);
                
                console.log('Updating UI with - rating:', rating, 'totalRatings:', totalRatings);
                
                // Update trust score display - make sure elements exist first
                const scoreEl = document.getElementById('profileTrustScore');
                const starsEl = document.getElementById('profileTrustStars');
                const countEl = document.getElementById('profileRatingCount');
                
                if (scoreEl) {
                    scoreEl.textContent = rating.toFixed(1);
                    console.log('Updated trust score to:', rating.toFixed(1));
                } else {
                    console.error('profileTrustScore element not found!');
                }
                
                if (starsEl) {
                    starsEl.innerHTML = generateProfileStars(rating);
                    console.log('Updated stars');
                } else {
                    console.error('profileTrustStars element not found!');
                }
                
                if (countEl) {
                    const countText = totalRatings === 0 
                        ? 'No ratings yet' 
                        : totalRatings + ' rating' + (totalRatings !== 1 ? 's' : '');
                    countEl.textContent = countText;
                    console.log('Updated rating count to:', countText);
                } else {
                    console.error('profileRatingCount element not found!');
                }
                
                // Display recent ratings if any
                if (data.recent_ratings && data.recent_ratings.length > 0) {
                    console.log('Displaying recent ratings:', data.recent_ratings.length);
                    displayRecentRatings(data.recent_ratings);
                } else {
                    console.log('No recent ratings to display');
                }
            } else {
                console.error('Error in ratings response:', data.message);
            }
        })
        .catch(error => console.error('Error loading trust score:', error));
}

function generateProfileStars(rating) {
    // Convert 10-point scale to 5-star display
    const fiveStarRating = (rating / 10) * 5;
    const fullStars = Math.floor(fiveStarRating);
    const hasHalfStar = fiveStarRating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '★';
        } else if (i === fullStars && hasHalfStar) {
            stars += '½';
        } else {
            stars += '☆';
        }
    }
    console.log('Generated stars for rating', rating, ':', stars);
    return stars;
}

function displayRecentRatings(ratings) {
    const container = document.getElementById('recentRatingsContainer');
    if (!container) {
        console.error('recentRatingsContainer not found!');
        return;
    }
    
    let html = '<h3>Recent Ratings</h3><div class="ratings-list">';
    
    ratings.forEach(rating => {
        const date = new Date(rating.created_at).toLocaleDateString();
        const starDisplay = '★'.repeat(Math.round(rating.rating / 2)); // Convert to 5-star
        html += `
            <div class="rating-item">
                <div class="rating-header">
                    <strong>${escapeHtml(rating.username)}</strong>
                    <span class="rating-badge">${rating.role}</span>
                    <span class="rating-value">${starDisplay}</span>
                </div>
                ${rating.review ? `<p class="rating-review">${escapeHtml(rating.review)}</p>` : ''}
                <small class="rating-date">${date}</small>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    console.log('Recent ratings displayed');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadUserListings() {
    console.log('Loading user listings...');
    fetch('api/get_user_listings.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Listings data:', data);
        if (data.success && data.listings.length > 0) {
            displayUserListings(data.listings);
        } else {
            const container = document.getElementById('userListingsContainer');
            if (container) {
                container.innerHTML = '<p style="text-align: center; color: #999;">You have no listings yet. <a href="sell.html">Create one now!</a></p>';
            }
        }
    })
    .catch(error => {
        console.error('Error loading listings:', error);
        const container = document.getElementById('userListingsContainer');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: red;">Error loading listings</p>';
        }
    });
}

function displayUserListings(listings) {
    const container = document.getElementById('userListingsContainer');
    if (!container) {
        console.error('userListingsContainer not found!');
        return;
    }
    
    let html = '';
    listings.forEach(item => {
        html += `
            <div class="item-card">
                <img src="${item.image_url || 'placeholder.png'}" alt="${escapeHtml(item.title)}" class="item-image">
                <div class="item-content">
                    <h3>${escapeHtml(item.title)}</h3>
                    <p class="item-description">${escapeHtml(item.description.substring(0, 100))}</p>
                    <div class="item-price">R${parseFloat(item.price).toFixed(2)}</div>
                    <div class="item-actions">
                        <a href="item.html?id=${item.id}" class="btn btn-sm btn-register">View</a>
                        <button class="btn btn-sm btn-delete" onclick="deleteUserListing(${item.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log('User listings displayed');
}

function deleteUserListing(itemId) {
    if (!confirm('Are you sure you want to delete this listing?')) {
        return;
    }
    
    console.log('Deleting item:', itemId);
    fetch('api/delete_listing.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({item_id: itemId})
    })
    .then(response => {
        console.log('Delete response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Delete response:', data);
        if (data.success) {
            console.log('Listing deleted, reloading...');
            loadUserListings();
        } else {
            alert('Error deleting listing: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting listing:', error);
        alert('Error deleting listing');
    });
}

function checkAdminStatus() {
    fetch('api/check_session.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Session check:', data);
        if (data.is_admin === true || data.is_admin === 1) {
            document.getElementById('adminTabBtn').style.display = 'block';
        }
    })
    .catch(error => console.error('Error checking admin status:', error));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded, initializing...');
    
    // Setup tabs FIRST
    setupTabs();
    
    // Load profile data
    loadUserProfile();
    loadUserListings();
    checkAdminStatus();

    // Setup profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
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
            })
            .catch(error => {
                document.getElementById('profileError').textContent = 'Error updating profile';
                document.getElementById('profileError').style.display = 'block';
            });
        });
    }
});