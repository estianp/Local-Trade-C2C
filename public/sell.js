let uploadedImageUrl = '';

document.getElementById("image").addEventListener("change", function(e) {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const preview = document.getElementById("imagePreview");
        preview.innerHTML = '<img src="' + event.target.result + '" style="max-width: 100%; max-height: 200px; margin-top: 10px; border-radius: 4px;">';
    };
    reader.readAsDataURL(file);

    uploadImage(file);
});

function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    fetch("api/upload_image.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            uploadedImageUrl = data.imageUrl;
        } else {
            document.getElementById("formMessage").textContent = data.message;
            document.getElementById("formMessage").style.color = "red";
        }
    })
    .catch(error => {
        document.getElementById("formMessage").textContent = "Error uploading image: " + error;
        document.getElementById("formMessage").style.color = "red";
    });
}

document.getElementById("listingForm").addEventListener("submit", function(e) {
    e.preventDefault();

    if (!uploadedImageUrl) {
        document.getElementById("formMessage").textContent = "Please upload an image";
        document.getElementById("formMessage").style.color = "red";
        return;
    }

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;

    fetch("api/create_listing.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title, description, price, imageUrl: uploadedImageUrl})
    })
    .then(response => response.json())
    .then(data => {
        const message = document.getElementById("formMessage");
        if (data.success) {
            message.textContent = data.message;
            message.style.color = "green";
            document.getElementById("listingForm").reset();
            document.getElementById("imagePreview").innerHTML = '';
            uploadedImageUrl = '';
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

