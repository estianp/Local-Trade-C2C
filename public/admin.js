let currentEditingUserId = null;
let currentEditingItemId = null;

// Initialize
document.addEventListener("DOMContentLoaded", function() {
	checkAdminSession();
	setupTabNavigation();
	setupModals();
	loadUsers();
});

function checkAdminSession() {
	fetch("api/check_session.php", {
		credentials: 'include',
		cache: 'no-store'
	})
	.then(response => response.json())
	.then(data => {
		if (!data.logged_in || !data.is_admin) {
			window.location.href = "index.html";
		} else {
			document.getElementById("username").textContent = data.username;
		}
	})
	.catch(error => {
		console.error('Error checking session:', error);
		window.location.href = "index.html";
	});
}

function setupTabNavigation() {
	const tabButtons = document.querySelectorAll(".admin-nav-btn");

	tabButtons.forEach(button => {
		button.addEventListener("click", function() {
			const tabName = this.getAttribute("data-tab");

			// Hide all tabs
			document.querySelectorAll(".admin-tab").forEach(tab => {
				tab.classList.remove("active");
			});

			// Remove active class from all buttons
			tabButtons.forEach(btn => btn.classList.remove("active"));

			// Show selected tab
			document.getElementById(tabName).classList.add("active");
			this.classList.add("active");

			// Load data
			if (tabName === "users") {
				loadUsers();
			} else if (tabName === "listings") {
				loadListings();
			}
		});
	});
}

function setupModals() {
	// User Modal
	const userModal = document.getElementById("userModal");
	const userCloseBtn = userModal.querySelector(".close");

	userCloseBtn.addEventListener("click", function() {
		userModal.style.display = "none";
	});

	document.getElementById("editUserForm").addEventListener("submit", function(e) {
		e.preventDefault();
		saveUserChanges();
	});

	document.getElementById("deleteUserBtn").addEventListener("click", function() {
		if (confirm("Are you sure you want to delete this user and all their listings?")) {
			deleteUser();
		}
	});

	// Listing Modal
	const listingModal = document.getElementById("listingModal");
	const listingCloseBtn = listingModal.querySelector(".close");

	listingCloseBtn.addEventListener("click", function() {
		listingModal.style.display = "none";
	});

	document.getElementById("editListingForm").addEventListener("submit", function(e) {
		e.preventDefault();
		saveListingChanges();
	});

	document.getElementById("deleteListingBtn").addEventListener("click", function() {
		if (confirm("Are you sure you want to delete this listing?")) {
			deleteListing();
		}
	});

	// Close modal when clicking outside
	window.addEventListener("click", function(e) {
		if (e.target === userModal) {
			userModal.style.display = "none";
		}
		if (e.target === listingModal) {
			listingModal.style.display = "none";
		}
	});
}

function loadUsers() {
	fetch("api/get_all_users.php", {
		credentials: 'include'
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			displayUsers(data.users);
		} else {
			alert(data.message);
		}
	})
	.catch(error => console.error('Error loading users:', error));
}

function displayUsers(users) {
    const tbody = document.getElementById("usersTableBody");
    tbody.innerHTML = '';
    
    let adminCount = 0;
    
    users.forEach(user => {
        // Convert is_admin to boolean
        const isAdmin = user.is_admin == 1 || user.is_admin === true;
        
        if (isAdmin) adminCount++;
        
        const row = document.createElement("tr");
        const createdDate = new Date(user.created_at).toLocaleDateString();
        const adminBadge = isAdmin ? '<span class="admin-badge">Admin</span>' : '';
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${createdDate}</td>
            <td>${adminBadge}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-sm btn-edit" onclick="editUser(${user.id}, '${user.username}', '${user.email}', ${isAdmin})">Edit</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById("totalUsers").textContent = users.length;
    document.getElementById("adminUsers").textContent = adminCount;
}

function editUser(userId, username, email, isAdmin) {
	currentEditingUserId = userId;

	document.getElementById("editUserId").value = userId;
	document.getElementById("editUsername").value = username;
	document.getElementById("editEmail").value = email;
	document.getElementById("editIsAdmin").checked = isAdmin;

	document.getElementById("userModal").style.display = "flex";
}

function saveUserChanges() {
	const isAdmin = document.getElementById("editIsAdmin").checked;

	fetch("api/edit_user.php", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		credentials: 'include',
		body: JSON.stringify({
			user_id: currentEditingUserId,
			is_admin: isAdmin
		})
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			document.getElementById("userModal").style.display = "none";
			loadUsers();
		} else {
			alert(data.message);
		}
	})
	.catch(error => console.error('Error saving user:', error));
}

function deleteUser() {
	fetch("api/delete_user.php", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		credentials: 'include',
		body: JSON.stringify({
			user_id: currentEditingUserId
		})
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			document.getElementById("userModal").style.display = "none";
			loadUsers();
		} else {
			alert(data.message);
		}
	})
	.catch(error => console.error('Error deleting user:', error));
}

function loadListings() {
	fetch("api/get_all_listings.php", {
		credentials: 'include'
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			displayListings(data.listings);
		} else {
			alert(data.message);
		}
	})
	.catch(error => console.error('Error loading listings:', error));
}

function displayListings(listings) {
    const tbody = document.getElementById("listingsTableBody");
    tbody.innerHTML = '';
    
    let activeCount = 0;
    
    listings.forEach(listing => {
        // Convert is_sold to boolean
        const isSold = listing.is_sold == 1 || listing.is_sold === true;
        
        if (!isSold) activeCount++;
        
        const row = document.createElement("tr");
        const createdDate = new Date(listing.created_at).toLocaleDateString();
        const statusBadge = isSold 
            ? '<span class="status-badge status-sold">Sold</span>' 
            : '<span class="status-badge status-active">Active</span>';
        
        row.innerHTML = `
            <td>${listing.id}</td>
            <td>${listing.title}</td>
            <td>${listing.category_name}</td>
            <td>${listing.username}</td>
            <td>R${parseFloat(listing.price).toFixed(2)}</td>
            <td>${statusBadge}</td>
            <td>${createdDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-sm btn-edit" onclick="editListing(${listing.id}, '${listing.title}', '${listing.username}', ${isSold})">Edit</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById("totalListings").textContent = listings.length;
    document.getElementById("activeListings").textContent = activeCount;
}

function editListing(itemId, title, username, isSold) {
	currentEditingItemId = itemId;

	document.getElementById("editItemId").value = itemId;
	document.getElementById("editItemTitle").value = title;
	document.getElementById("editItemSeller").value = username;
	document.getElementById("editItemSold").checked = isSold;

	document.getElementById("listingModal").style.display = "flex";
}

function saveListingChanges() {
	const isSold = document.getElementById("editItemSold").checked;

	fetch("api/edit_listing.php", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		credentials: 'include',
		body: JSON.stringify({
			item_id: currentEditingItemId,
			is_sold: isSold
		})
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			document.getElementById("listingModal").style.display = "none";
			loadListings();
		} else {
			alert(data.message);
		}
	})
	.catch(error => console.error('Error saving listing:', error));
}

function deleteListing() {
	fetch("api/delete_listing.php", {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		credentials: 'include',
		body: JSON.stringify({
			item_id: currentEditingItemId
		})
	})
	.then(response => response.json())
	.then(data => {
		if (data.success) {
			document.getElementById("listingModal").style.display = "none";
			loadListings();
		} else {
			alert(data.message);
		}
	})
	.catch(error => console.error('Error deleting listing:', error));
}