let itemId, itemPrice, savedPaymentDetails, savedAddress;
const SHIPPING_COST = 99;

document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    loadItemDetails();
    loadSavedPayment();
    loadSavedAddress();
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
            updateTotal();
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

function loadSavedAddress() {
    fetch('api/get_shipping_address.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.exists) {
            savedAddress = data.address;
            
            document.getElementById('savedAddressContainer').style.display = 'block';
            document.getElementById('savedAddressInfo').innerHTML = `
                <p><strong>${data.address.full_name}</strong></p>
                <p>${data.address.street_address}, ${data.address.city}, ${data.address.province} ${data.address.postal_code}</p>
                <p>Phone: ${data.address.phone_number}</p>
            `;

            document.getElementById('useSavedAddressBtn').addEventListener('click', function() {
                useSavedAddressForm();
            });
        }
    })
    .catch(error => console.error('Error loading saved address:', error));
}

function setupForm() {
    // Shipping checkbox
    document.getElementById('enableShipping').addEventListener('change', function() {
        document.getElementById('addressForm').style.display = this.checked ? 'block' : 'none';
        document.getElementById('savedAddressContainer').style.display = (this.checked && savedAddress) ? 'block' : 'none';
        updateTotal();
    });

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

function updateTotal() {
    const shipping = document.getElementById('enableShipping').checked ? SHIPPING_COST : 0;
    const total = itemPrice + shipping;
    
    document.getElementById('shippingCost').textContent = `R${shipping.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `R${total.toFixed(2)}`;
}

function useSavedAddressForm() {
    document.getElementById('addressForm').style.display = 'none';
    document.getElementById('savedAddressContainer').style.display = 'block';
    
    // Hide "Use This Address" button and show form toggle
    document.getElementById('useSavedAddressBtn').style.display = 'none';
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn btn-login';
    editBtn.textContent = 'Use Different Address';
    editBtn.style.width = '100%';
    editBtn.addEventListener('click', function() {
        document.getElementById('addressForm').style.display = 'block';
        document.getElementById('savedAddressContainer').style.display = 'none';
    });
    document.getElementById('savedAddressInfo').parentElement.appendChild(editBtn);
}

function completePurchaseWithSavedCard() {
    const errorEl = document.getElementById('checkoutError');
    const successEl = document.getElementById('checkoutSuccess');
    
    let shippingData = null;
    if (document.getElementById('enableShipping').checked) {
        if (!savedAddress) {
            errorEl.textContent = 'Please select or enter a shipping address';
            errorEl.style.display = 'block';
            return;
        }
        shippingData = {
            use_saved_address: true
        };
    }

    fetch('api/purchase_item.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
            item_id: itemId,
            use_saved_payment: true,
            use_shipping: document.getElementById('enableShipping').checked,
            ...shippingData
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

    // Validation
    if (!cardHolder || !cardNumber || !expiryDate || !cvv || !zipCode) {
        errorEl.textContent = 'All payment fields are required';
        errorEl.style.display = 'block';
        return;
    }

    let shippingData = {};
    if (document.getElementById('enableShipping').checked) {
        const fullName = document.getElementById('fullName').value.trim();
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        const streetAddress = document.getElementById('streetAddress').value.trim();
        const city = document.getElementById('city').value.trim();
        const province = document.getElementById('province').value.trim();
        const postalCode = document.getElementById('postalCode').value.trim();
        const saveAddress = document.getElementById('saveAddress').checked;

        if (!fullName || !phoneNumber || !streetAddress || !city || !province || !postalCode) {
            errorEl.textContent = 'All delivery fields are required';
            errorEl.style.display = 'block';
            return;
        }

        shippingData = {
            use_shipping: true,
            full_name: fullName,
            phone_number: phoneNumber,
            street_address: streetAddress,
            city: city,
            province: province,
            postal_code: postalCode,
            save_address: saveAddress
        };
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
            save_payment: savePayment,
            ...shippingData
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