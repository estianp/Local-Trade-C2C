function switchTab(tabName) {
    const tabs = document.querySelectorAll(".tab-content");
    const buttons = document.querySelectorAll(".tab-btn");
    
    tabs.forEach(tab => tab.classList.remove("active"));
    buttons.forEach(btn => btn.classList.remove("active"));
    
    document.getElementById(tabName).classList.add("active");
    event.target.classList.add("active");
}

function checkSession() {
    fetch("api/check_session.php", {
        credentials: 'include',
        cache: 'no-store'
    })
    .then(response => response.json())
    .then(data => {
        const signupBtn = document.getElementById("signupBtn");
        const userProfile = document.getElementById("userProfile");
        const sellLink = document.getElementById("sellLink");
        
        if (data.logged_in) {
            if (signupBtn) signupBtn.style.display = "none";
            if (userProfile) {
                userProfile.style.display = "flex";
                const usernameEl = document.getElementById("username");
                usernameEl.textContent = data.username;
                usernameEl.style.cursor = "pointer";
                usernameEl.addEventListener("click", () => {
                    window.location.href = "profile.html";
                });
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

document.addEventListener("DOMContentLoaded", function() {
    const errors = document.querySelectorAll('.error');
    errors.forEach(error => {
        error.textContent = '';
        error.classList.remove('show');
    });
    
    checkSession();
});

if (document.getElementById("signoutBtn")) {
    document.getElementById("signoutBtn").addEventListener("click", function() {
        fetch("api/logout.php", {
            credentials: 'include',
            cache: 'no-store'
        })
        .then(response => response.json())
        .then(data => {
            window.location.href = "index.html";
        });
    });
}

if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;
        const errorEl = document.getElementById("loginError");
        
        fetch("api/login.php", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: 'include',
            cache: 'no-store',
            body: JSON.stringify({username, password})
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                errorEl.textContent = "";
                errorEl.classList.remove("show");
                // Update UI immediately
                checkSession();
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 500);
            } else {
                errorEl.textContent = data.message;
                errorEl.classList.add("show");
            }
        })
        .catch(error => {
            errorEl.textContent = "Error: " + error;
            errorEl.classList.add("show");
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
        const errorEl = document.getElementById("registerError");
        
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
                errorEl.textContent = "";
                errorEl.classList.remove("show");
                switchTab('login');
            } else {
                errorEl.textContent = data.message;
                errorEl.classList.add("show");
            }
        })
        .catch(error => {
            errorEl.textContent = "Error: " + error;
            errorEl.classList.add("show");
            console.error('Error:', error);
        });
    });
}

