let itemId = null;
let sellerId = null;

document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    
    // Get item ID from URL
    const params = new URLSearchParams(window.location.search);
    itemId = params.get('id');
    
    console.log('Page loaded with itemId:', itemId);
    
    if (!itemId) {
        window.location.href = 'browse.html';
        return;
    }
    
    loadItemDetails();
    setupRating();
});

function loadItemDetails() {
    fetch(`api/get_item.php?id=${itemId}`, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Item data:', data);
        if (data.success && data.item) {
            const item = data.item;
            sellerId = item.user_id;
            
            console.log('Seller ID set to:', sellerId);
            console.log('Item ID:', itemId);
            
            // Display item details
            document.getElementById('itemImage').src = item.image_url || '';
            document.getElementById('itemTitle').textContent = item.title;
            document.getElementById('itemCategory').textContent = `Category: ${item.category}`;
            document.getElementById('itemPrice').textContent = `R${parseFloat(item.price).toFixed(2)}`;
            document.getElementById('sellerName').textContent = item.username;
            
            // Check if already rated
            checkIfAlreadyRated();
        } else {
            alert('Item not found');
            window.location.href = 'browse.html';
        }
    })
    .catch(error => {
        console.error('Error loading item:', error);
        window.location.href = 'browse.html';
    });
}

function setupRating() {
    const starRatingEl = document.getElementById('starRating');
    
    // Create 10 stars
    for (let i = 1; i <= 10; i++) {
        const star = document.createElement('span');
        star.textContent = '★';
        star.dataset.rating = i;
        star.onclick = () => selectRating(i);
        starRatingEl.appendChild(star);
    }
    
    // Form submission
    document.getElementById('ratingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitRating();
    });
}

function selectRating(rating) {
    document.getElementById('rating').value = rating;
    
    const stars = document.querySelectorAll('#starRating span');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function checkIfAlreadyRated() {
    fetch(`api/check_buyer_rating.php?item_id=${itemId}`, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.already_rated) {
            // Hide form, show message
            document.getElementById('ratingForm').style.display = 'none';
            document.getElementById('alreadyRatedMessage').style.display = 'block';
        }
    })
    .catch(error => console.error('Error checking rating:', error));
}

function submitRating() {
    const rating = parseInt(document.getElementById('rating').value);
    const review = document.getElementById('review').value.trim();
    const errorEl = document.getElementById('ratingError');
    const successEl = document.getElementById('ratingSuccess');
    
    console.log('Submitting rating:', {
        ratee_id: sellerId,
        item_id: itemId,
        rating: rating,
        review: review
    });
    
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
    
    if (rating === 0) {
        errorEl.textContent = 'Please select a rating';
        errorEl.style.display = 'block';
        return;
    }
    
    fetch('api/submit_rating.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
            ratee_id: sellerId,
            item_id: itemId,
            rating: rating,
            review: review,
            rating_type: 'buyer_to_seller'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Rating response:', data);
        if (data.success) {
            successEl.textContent = '✓ ' + data.message;
            successEl.style.display = 'block';
            
            setTimeout(() => {
                window.location.href = 'browse.html';
            }, 2000);
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Rating error:', error);
        errorEl.textContent = 'Error submitting rating: ' + error.message;
        errorEl.style.display = 'block';
    });
}