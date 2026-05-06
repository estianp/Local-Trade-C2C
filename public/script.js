function switchTab(tabName) {
    const tabs = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-btn");
    
    tabs.forEach(tab => tab.classList.remove("active"));
    buttons.forEach(btn => btn.classList.remove("active"));
    
    document.getElementById(tabName).classList.add("active");
    event.target.classList.add("active");
}

function checkSession() {
    fetch("api/check_session.php")
    .then(response => response.json())
    .then(data => {
        const signupBtn = document.getElementById("signupBtn");
        const userProfile = document.getElementById("userProfile");
        const sellLink = document.getElementById("sellLink");
        
        if (data.logged_in) {
            if (signupBtn) signupBtn.style.display = "none";
            if (userProfile) {
                userProfile.style.display = "flex";
                document.getElementById("username").textContent = data.username;
            }
            if (sellLink) sellLink.style.display = "block";
        } else {
            if (signupBtn) signupBtn.style.display = "block";
            if (userProfile) userProfile.style.display = "none";
            if (sellLink) sellLink.style.display = "none";
            
            if (window.location.pathname.includes('sell')) {
                window.location.href = "signup.html";
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", checkSession);

if (document.getElementById("signoutBtn")) {
    document.getElementById("signoutBtn").addEventListener("click", function() {
        fetch("api/logout.php", {method: "POST"})
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = "index.html";
            }
        });
    });
}

if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;
        
        fetch("api/login.php", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Login successful!");
                window.location.href = "index.html";
            } else {
                document.getElementById("loginError").textContent = data.message;
            }
        })
        .catch(error => {
            document.getElementById("loginError").textContent = "Error: " + error;
            console.error('Error:', error);
        });
    });
}

if (document.getElementById("registerForm")) {
    document.getElementById("registerForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const username = document.getElementById("registerUsername").value;
        const email = document.getElementById("registerEmail").value;
        const password = document.getElementById("registerPassword").value;
        
        fetch("api/register.php", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, email, password})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Registration successful!");
                document.getElementById("registerForm").reset();
                switchTab('login');
            } else {
                document.getElementById("registerError").textContent = data.message;
            }
        })
        .catch(error => {
            document.getElementById("registerError").textContent = "Error: " + error;
            console.error('Error:', error);
        });
    });
}

