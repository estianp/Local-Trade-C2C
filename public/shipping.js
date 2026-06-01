document.addEventListener('DOMContentLoaded', function() {
    loadShippingAddress();
    setupShippingForm();
});

function loadShippingAddress() {
    fetch('api/get_shipping_address.php', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        const statusEl = document.getElementById('shippingStatus');
        const deleteBtn = document.getElementById('deleteShippingBtn');
        const form = document.getElementById('shippingForm');

        if (data.success && data.exists) {
            const addr = data.address;
            statusEl.innerHTML = `
                <div style="padding: 15px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; color: #155724;">
                    <strong>Shipping address saved</strong><br>
                    <small><strong>${addr.full_name}</strong></small><br>
                    <small>${addr.street_address}</small><br>
                    <small>${addr.city}, ${addr.province} ${addr.postal_code}</small><br>
                    <small>Phone: ${addr.phone_number}</small>
                </div>
            `;
            deleteBtn.style.display = 'inline-block';
            form.style.display = 'none';
        } else {
            statusEl.innerHTML = '<p style="color: #666;">No shipping address saved yet. Add one below.</p>';
            deleteBtn.style.display = 'none';
            form.style.display = 'block';
        }
    })
    .catch(error => console.error('Error loading shipping address:', error));
}

function setupShippingForm() {
    document.getElementById('shippingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveShippingAddress();
    });

    document.getElementById('deleteShippingBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete your shipping address?')) {
            deleteShippingAddress();
        }
    });
}

function saveShippingAddress() {
    const fullName = document.getElementById('shippingFullName').value.trim();
    const phone = document.getElementById('shippingPhone').value.trim();
    const street = document.getElementById('shippingStreet').value.trim();
    const city = document.getElementById('shippingCity').value.trim();
    const province = document.getElementById('shippingProvince').value.trim();
    const postal = document.getElementById('shippingPostal').value.trim();
    const errorEl = document.getElementById('shippingError');
    const successEl = document.getElementById('shippingSuccess');

    errorEl.textContent = '';
    errorEl.style.display = 'none';
    successEl.textContent = '';
    successEl.style.display = 'none';

    fetch('api/save_shipping_address.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify({
            full_name: fullName,
            phone_number: phone,
            street_address: street,
            city: city,
            province: province,
            postal_code: postal
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            successEl.textContent = data.message;
            successEl.style.display = 'block';
            document.getElementById('shippingForm').reset();
            setTimeout(() => {
                loadShippingAddress();
            }, 1500);
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    })
    .catch(error => {
        errorEl.textContent = 'Error saving address: ' + error.message;
        errorEl.style.display = 'block';
    });
}

function deleteShippingAddress() {
    const errorEl = document.getElementById('shippingError');
    const successEl = document.getElementById('shippingSuccess');

    fetch('api/delete_shipping_address.php', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            successEl.textContent = data.message;
            successEl.style.display = 'block';
            document.getElementById('shippingForm').reset();
            setTimeout(() => {
                loadShippingAddress();
            }, 1500);
        } else {
            errorEl.textContent = data.message;
            errorEl.style.display = 'block';
        }
    })
    .catch(error => {
        errorEl.textContent = 'Error deleting address: ' + error.message;
        errorEl.style.display = 'block';
    });
}