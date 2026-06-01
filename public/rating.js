let currentItemId = null;
let currentItem = null;

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    currentItemId = params.get('id');
    
    if (currentItemId) {
        // First load the item details
        fetch(`api/get_item.php?id=${currentItemId}`, {
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.item) {
                currentItem = data.item;
                console.log('Item loaded:', currentItem);
                loadSellerRating();
                checkRatingEligibility();
            }
        })
        .catch(error => console.error('Error loading item:', error));
    }
});

function loadSellerRating() {
    if (!currentItem || !currentItem.user_id) {
        console.error('Item or seller ID not available');
        return;
    }
    
    fetch(`api/get_user_ratings.php?user_id=${currentItem.user_id}`)
        .then(response => response.json())
        .then(data => {
            console.log('Seller rating data:', data);
            if (data.success) {
                displaySellerRating(data.average_rating, data.total_ratings);
            }
        })
        .catch(error => console.error('Error loading seller rating:', error));
}

function displaySellerRating(rating, count) {
    document.getElementById('sellerRatingValue').textContent = rating.toFixed(1);
    document.getElementById('sellerRatingCount').textContent = count;
    document.getElementById('sellerStars').innerHTML = generateStars(rating);
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
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
    return stars;
}

function checkRatingEligibility() {
    fetch(`api/get_transaction_ratings.php?item_id=${currentItemId}`, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log('Transaction rating eligibility:', data);
        if (data.success) {
            if (data.can_rate_seller || data.can_rate_buyer) {
                document.getElementById('ratingSection').style.display = 'block';
                
                if (data.can_rate_seller) {
                    console.log('Can rate seller:', data.seller_id);
                    setupBuyerRating(data.seller_id);
                }
                if (data.can_rate_buyer) {
                    console.log('Can rate buyer:', data.buyer_id);
                    setupSellerRating(data.buyer_id);
                }
            } else {
                console.log('Cannot rate - already rated or not applicable');
                console.log('can_rate_seller:', data.can_rate_seller);
                console.log('can_rate_buyer:', data.can_rate_buyer);
            }
        }
    })
    .catch(error => console.error('Error checking rating eligibility:', error));
}

function setupBuyerRating(sellerId) {
    document.getElementById('buyerRatingForm').style.display = 'block';
    
    const starsContainer = document.getElementById('buyerStarRating');
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const star = document.createElement('span');
        star.textContent = '★';
        star.style.cursor = 'pointer';
        star.style.color = '#ddd';
        star.style.marginRight = '5px';
        star.onclick = () => setRating('buyer', i);
        starsContainer.appendChild(star);
    }
    
    document.getElementById('submitBuyerRating').addEventListener('click', function() {
        submitRating('buyer_to_seller', sellerId);
    });
}

function setupSellerRating(buyerId) {
    document.getElementById('sellerRatingForm').style.display = 'block';
    
    const starsContainer = document.getElementById('sellerStarRating');
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 10; i++) {
        const star = document.createElement('span');
        star.textContent = '★';
        star.style.cursor = 'pointer';
        star.style.color = '#ddd';
        star.style.marginRight = '5px';
        star.onclick = () => setRating('seller', i);
        starsContainer.appendChild(star);
    }
    
    document.getElementById('submitSellerRating').addEventListener('click', function() {
        submitRating('seller_to_buyer', buyerId);
    });
}

function setRating(type, rating) {
    const inputId = type === 'buyer' ? 'buyerRating' : 'sellerRating';
    const starsId = type === 'buyer' ? 'buyerStarRating' : 'sellerStarRating';
    
    document.getElementById(inputId).value = rating;
    
    const stars = document.querySelectorAll(`#${starsId} span`);
    stars.forEach((star, index) => {
        star.style.color = index < rating ? '#f39c12' : '#ddd';
    });
}

function submitRating(ratingType, rateeId) {
    const rating = ratingType === 'buyer_to_seller' 
        ? parseInt(document.getElementById('buyerRating').value)
        : parseInt(document.getElementById('sellerRating').value);
    
    const review = ratingType === 'buyer_to_seller'
        ? document.getElementById('buyerReview').value.trim()
        : document.getElementById('sellerReview').value.trim();
    
    const errorEl = document.getElementById('ratingError');
    const successEl = document.getElementById('ratingSuccess');
    
    if (rating === 0) {
        errorEl.textContent = 'Please select a rating';
        errorEl.style.display = 'block';
        return;
    }
    
    console.log('Submitting rating:', {
        ratee_id: rateeId,
        item_id: currentItemId,
        rating: rating,
        review: review,
        rating_type: ratingType
    });
    
    fetch('api/submit_rating.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
            ratee_id: rateeId,
            item_id: currentItemId,
            rating: rating,
            review: review,
            rating_type: ratingType
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Rating submission response:', data);
        if (data.success) {
            successEl.textContent = data.message;
            successEl.style.display = 'block';
            errorEl.style.display = 'none';
            
            setTimeout(() => {
                if (ratingType === 'buyer_to_seller') {
                    document.getElementById('buyerRatingForm').style.display = 'none';
                } else {
                    document.getElementById('sellerRatingForm').style.display = 'none';
                }
                loadSellerRating();
            }, 2000);
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error submitting rating:', error);
        errorEl.textContent = 'Error submitting rating: ' + error.message;
        errorEl.style.display = 'block';
    });
}