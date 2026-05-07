let uploadedImage = '';

document.getElementById("image").addEventListener("change", function(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        document.getElementById("formMessage").textContent = "File too large (max 5MB)";
        document.getElementById("formMessage").style.color = "red";
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const dataUrl = event.target.result;
        uploadedImage = dataUrl;
        const preview = document.getElementById("imagePreview");
        preview.innerHTML = '<img src="' + dataUrl + '" style="max-width: 100%; max-height: 200px; margin-top: 10px; border-radius: 4px;">';
    };
    reader.readAsDataURL(file);
});

document.getElementById("listingForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;
    
    fetch("api/create_listing.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title, description, price, image: uploadedImage || null})
    })
    .then(response => response.json())
    .then(data => {
        const message = document.getElementById("formMessage");
        if (data.success) {
            message.textContent = data.message;
            message.style.color = "green";
            document.getElementById("listingForm").reset();
            document.getElementById("imagePreview").innerHTML = '';
            uploadedImage = '';
            setTimeout(() => {
                window.location.href = "index.html";
            }, 2000);
        } else {
            message.textContent = data.message;
            message.style.color = "red";
        }
    })
    .catch(error => {
        document.getElementById("formMessage").textContent = "Error: " + error;
        document.getElementById("formMessage").style.color = "red";
    });
});

document.addEventListener("DOMContentLoaded", checkSession);

