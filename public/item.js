let currentItem = null;

function loadItem() {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    
    if (!itemId) {
        document.querySelector('.item-detail-section').innerHTML = '<p style="text-align: center; color: red;">No item ID provided</p>';
        return;
    }
    
    fetch(`api/get_item.php?id=${itemId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentItem = data.item;
            const item = data.item;
            
            document.getElementById('itemCategory').textContent = item.category;
            document.getElementById('itemTitle').textContent = item.title;
            document.getElementById('itemSeller').textContent = `Seller: ${item.username}`;
            document.getElementById('itemDescription').textContent = item.description;
            document.getElementById('itemPrice').textContent = `R${parseFloat(item.price).toFixed(2)}`;
            
            const date = new Date(item.created_at).toLocaleDateString();
            document.getElementById('itemDate').textContent = `Listed: ${date}`;
            
            if (item.is_sold) {
                document.getElementById('itemStatus').textContent = 'SOLD';
                document.getElementById('itemStatus').style.color = '#d32f2f';
                document.getElementById('buyNowBtn').disabled = true;
                document.getElementById('buyNowBtn').textContent = 'Sold';
                document.getElementById('buyNowBtn').style.opacity = '0.5';
                document.getElementById('buyNowBtn').style.cursor = 'not-allowed';
            }
            
            if (item.image_url) {
                document.getElementById('itemImage').src = item.image_url;
            } else {
                document.getElementById('itemImage').style.backgroundColor = '#ddd';
                document.getElementById('itemImage').style.height = '400px';
                document.getElementById('itemImage').alt = 'No Image';
            }
            
            // Load seller's trust score
            loadSellerTrustScore(item.user_id);
        } else {
            document.querySelector('.item-detail-section').innerHTML = `<p style="text-align: center; color: red;">${data.message}</p>`;
        }
    })
    .catch(error => {
        console.error('Error loading item:', error);
        document.querySelector('.item-detail-section').innerHTML = '<p style="text-align: center; color: red;">Error loading item</p>';
    });
}

function loadSellerTrustScore(sellerId) {
    fetch(`api/get_user_ratings.php?user_id=${sellerId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const ratingValue = data.average_rating || 0;
            const totalRatings = data.total_ratings || 0;
            
            document.getElementById('sellerRatingValue').textContent = ratingValue.toFixed(1);
            document.getElementById('sellerRatingCount').textContent = totalRatings;
            
            // Convert 10-point scale to 5-star display
            const starCount = Math.round((ratingValue / 10) * 5);
            let starsHtml = '';
            for (let i = 0; i < 5; i++) {
                starsHtml += i < starCount ? '★' : '☆';
            }
            document.getElementById('sellerStars').textContent = starsHtml;
        }
    })
    .catch(error => console.error('Error loading seller trust score:', error));
}

function openPaymentModal() {
    if (!currentItem) return;
    document.getElementById('paymentItemTitle').textContent = currentItem.title;
    document.getElementById('paymentAmount').textContent = `R${parseFloat(currentItem.price).toFixed(2)}`;
    document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('paymentForm').reset();
    document.getElementById('paymentError').textContent = '';
    document.getElementById('paymentError').style.color = '#d32f2f';
}

function showSuccessModal(transactionId) {
    document.getElementById('paymentModal').style.display = 'none';
    document.getElementById('successItemName').textContent = currentItem.title;
    document.getElementById('successAmount').textContent = `R${parseFloat(currentItem.price).toFixed(2)}`;
    document.getElementById('successTransactionId').textContent = transactionId;
    document.getElementById('successDateTime').textContent = new Date().toLocaleString();
    document.getElementById('successModal').style.display = 'flex';
}

function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    loadItem();
    window.location.href = 'browse.html';
}

function processPayment(e) {
    e.preventDefault();
    
    const cardName = document.getElementById('cardName').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.trim().replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry').value.trim();
    const cardCVV = document.getElementById('cardCVV').value.trim();
    const billingZip = document.getElementById('billingZip').value.trim();
    const errorEl = document.getElementById('paymentError');
    
    errorEl.textContent = '';
    errorEl.style.color = '#d32f2f';
    
    if (!cardName || !cardNumber || !cardExpiry || !cardCVV || !billingZip) {
        errorEl.textContent = 'Please fill in all fields';
        return false;
    }
    
    if (cardNumber.length !== 16) {
        errorEl.textContent = 'Card number must be 16 digits';
        return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        errorEl.textContent = 'Expiry date must be in MM/YY format';
        return false;
    }
    
    if (cardCVV.length !== 3 || isNaN(cardCVV)) {
        errorEl.textContent = 'CVV must be 3 digits';
        return false;
    }
    
    if (!/^\d+$/.test(billingZip)) {
        errorEl.textContent = 'Zip code must contain only numbers';
        return false;
    }
    
    fetch('api/process_payment.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
            item_id: currentItem.id,
            card_name: cardName,
            card_number: cardNumber.slice(-4),
            amount: currentItem.price
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const transactionId = 'TXN' + Date.now();
            showSuccessModal(transactionId);
        } else {
            errorEl.style.color = '#d32f2f';
            errorEl.textContent = data.message || 'Payment failed';
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        errorEl.style.color = '#d32f2f';
        errorEl.textContent = 'Payment processing error: ' + error.message;
    });
    
    return false;
}

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    loadItem();
    
    const buyBtn = document.getElementById('buyNowBtn');
    const closeBtn = document.querySelector('.close-payment-btn');
    const paymentForm = document.getElementById('paymentForm');
    
    if (buyBtn) buyBtn.addEventListener('click', openPaymentModal);
    if (closeBtn) closeBtn.addEventListener('click', closePaymentModal);
    if (paymentForm) paymentForm.addEventListener('submit', processPayment);
    
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('paymentModal');
        if (e.target === modal) closePaymentModal();
    });
    
    document.getElementById('buyNowBtn').addEventListener('click', function() {
        const itemId = new URLSearchParams(window.location.search).get('id');
        window.location.href = `checkout.html?id=${itemId}`;
    });
});