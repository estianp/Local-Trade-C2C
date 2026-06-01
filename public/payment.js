// Load payment details on page load
document.addEventListener('DOMContentLoaded', function() {
    loadPaymentDetails();
    setupPaymentForm();
});

function loadPaymentDetails() {
    fetch('api/get_payment_details.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const statusEl = document.getElementById('paymentStatus');
        const deleteBtn = document.getElementById('deletePaymentBtn');
        const form = document.getElementById('paymentForm');
        
        if (data.success && data.exists) {
            statusEl.innerHTML = `
                <div style="padding: 15px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; color: #155724;">
                    <strong>Payment details saved</strong><br>
                    <small>Cardholder: ${data.card_holder_name}</small><br>
                    <small>Card: ${data.card_number}</small><br>
                    <small>Expires: ${data.expiry_date}</small>
                </div>
            `;
            deleteBtn.style.display = 'inline-block';
            form.style.display = 'none';
        } else {
            statusEl.innerHTML = '<p style="color: #666;">No payment details saved yet. Add one below.</p>';
            deleteBtn.style.display = 'none';
            form.style.display = 'block';
        }
    })
    .catch(error => console.error('Error loading payment details:', error));
}

function setupPaymentForm() {
    // Format card number input
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });

    // Format expiry date input
    document.getElementById('expiryDate').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });

    // Format CVV input (numbers only)
    document.getElementById('cvv').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Form submission
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        savePaymentDetails();
    });

    // Delete button
    document.getElementById('deletePaymentBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete your saved payment details?')) {
            deletePaymentDetails();
        }
    });
}

function savePaymentDetails() {
    const cardHolderName = document.getElementById('cardHolderName').value.trim();
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiryDate = document.getElementById('expiryDate').value.trim();
    const cvv = document.getElementById('cvv').value.trim();
    const errorEl = document.getElementById('paymentError');
    const successEl = document.getElementById('paymentSuccess');

    errorEl.textContent = '';
    errorEl.style.display = 'none';
    successEl.textContent = '';
    successEl.style.display = 'none';

    fetch('api/save_payment_details.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
            card_holder_name: cardHolderName,
            card_number: cardNumber,
            expiry_date: expiryDate,
            cvv: cvv
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            successEl.textContent = data.message;
            successEl.style.display = 'block';
            setTimeout(() => {
                loadPaymentDetails();
            }, 1500);
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    })
    .catch(error => {
        errorEl.textContent = 'Error saving payment details: ' + error.message;
        errorEl.style.display = 'block';
    });
}

function deletePaymentDetails() {
    const errorEl = document.getElementById('paymentError');
    const successEl = document.getElementById('paymentSuccess');

    fetch('api/delete_payment_details.php', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            successEl.textContent = data.message;
            successEl.style.display = 'block';
            setTimeout(() => {
                loadPaymentDetails();
                document.getElementById('paymentForm').reset();
            }, 1500);
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    })
    .catch(error => {
        errorEl.textContent = 'Error deleting payment details: ' + error.message;
        errorEl.style.display = 'block';
    });
}