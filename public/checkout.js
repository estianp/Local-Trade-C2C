let itemId, itemPrice, savedPaymentDetails;

document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadItemDetails();
    loadSavedPayment();
    setupForm();
});

function loadItemDetails() {
    const params = new URLSearchParams(window.location.search);
    itemId = params.get('id');

    if (!itemId) {
        window.location.href = 'browse.html';
        return;
    }

    fetch(`api/get_item.php?id=${itemId}`, {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.item) {
            const item = data.item;
            itemPrice = parseFloat(item.price);

            document.getElementById('itemImage').src = item.image_url || '';
            document.getElementById('itemTitle').textContent = item.title;
            document.getElementById('itemSeller').textContent = `Seller: ${item.username}`;
            document.getElementById('itemDescription').textContent = item.description.substring(0, 100) + '...';
            document.getElementById('itemPrice').textContent = `R${itemPrice.toFixed(2)}`;
            document.getElementById('totalAmount').textContent = `R${itemPrice.toFixed(2)}`;
        } else {
            alert('Item not found');
            window.location.href = 'browse.html';
        }
    })
    .catch(error => {
        console.error('Error loading item:', error);
        alert('Error loading item');
        window.location.href = 'browse.html';
    });
}

function loadSavedPayment() {
    fetch('api/get_payment_details.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.exists) {
            savedPaymentDetails = data;
            
            document.getElementById('savedPaymentContainer').style.display = 'block';
            document.getElementById('savedPaymentInfo').innerHTML = `
                <p><strong>${data.card_holder_name}</strong></p>
                <p>${data.card_number}</p>
                <p>Expires: ${data.expiry_date}</p>
            `;

            document.getElementById('useSavedBtn').addEventListener('click', function() {
                completePurchaseWithSavedCard();
            });
        }
    })
    .catch(error => console.error('Error loading saved payment:', error));
}

function setupForm() {
    // Format card number
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formatted;
    });

    // Format expiry
    document.getElementById('expiryDate').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });

    // Format CVV
    document.getElementById('cvv').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Form submit
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        completeCheckout();
    });
}

function completePurchaseWithSavedCard() {
    const errorEl = document.getElementById('checkoutError');
    const successEl = document.getElementById('checkoutSuccess');

    fetch('api/purchase_item.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
            item_id: itemId,
            use_saved_payment: true
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            successEl.textContent = 'Purchase completed successfully!';
            successEl.style.display = 'block';
            setTimeout(() => {
                window.location.href = `item.html?id=${itemId}`;
            }, 2000);
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    })
    .catch(error => {
        errorEl.textContent = 'Error processing purchase: ' + error.message;
        errorEl.style.display = 'block';
    });
}

function completeCheckout() {
    const cardHolder = document.getElementById('cardHolder').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiryDate').value.trim();
    const cvv = document.getElementById('cvv').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const savePayment = document.getElementById('savePayment').checked;
    const errorEl = document.getElementById('checkoutError');
    const successEl = document.getElementById('checkoutSuccess');

    errorEl.textContent = '';
    errorEl.style.display = 'none';
    successEl.textContent = '';
    successEl.style.display = 'none';

    // Basic validation
    if (!cardHolder || !cardNumber || !expiryDate || !cvv || !zipCode) {
        errorEl.textContent = 'All fields are required';
        errorEl.style.display = 'block';
        return;
    }

    fetch('api/purchase_item.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
            item_id: itemId,
            card_holder_name: cardHolder,
            card_number: cardNumber,
            expiry_date: expiryDate,
            cvv: cvv,
            zip_code: zipCode,
            save_payment: savePayment
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            successEl.textContent = 'Purchase completed successfully!';
            successEl.style.display = 'block';
            setTimeout(() => {
                window.location.href = `item.html?id=${itemId}`;
            }, 2000);
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    })
    .catch(error => {
        errorEl.textContent = 'Error processing purchase: ' + error.message;
        errorEl.style.display = 'block';
    });
}