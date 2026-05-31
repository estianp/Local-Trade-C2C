// Handle Turnstile token for login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get Turnstile token
    const token = turnstile.getResponse();

    if (!token) {
        document.getElementById('loginError').textContent = 'Please complete the captcha';
        document.getElementById('loginError').classList.add('show');
        return;
    }

    submitLogin(token);
});

// Handle Turnstile token for register
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get Turnstile token
    const token = turnstile.getResponse();

    if (!token) {
        document.getElementById('registerError').textContent = 'Please complete the captcha';
        document.getElementById('registerError').classList.add('show');
        return;
    }

    submitRegister(token);
});

function submitLogin(captchaToken) {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');

    fetch("api/login.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
            username: username,
            password: password,
            captcha_token: captchaToken
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            errorEl.textContent = "";
            errorEl.classList.remove("show");
            checkSession();
            setTimeout(() => {
                window.location.href = data.is_admin ? "admin.html" : "index.html";
            }, 500);
        } else {
            errorEl.textContent = data.message;
            errorEl.classList.add("show");
            // Reset captcha on error
            turnstile.reset();
        }
    })
    .catch(error => {
        errorEl.textContent = "Login error: " + error.message;
        errorEl.classList.add("show");
        turnstile.reset();
    });
}

function submitRegister(captchaToken) {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorEl = document.getElementById('registerError');

    fetch("api/register.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
            captcha_token: captchaToken
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            errorEl.textContent = "";
            errorEl.classList.remove("show");
            document.getElementById('registerForm').reset();
            alert('Registration successful! Please login.');
            switchTab('login');
            // Reset captcha
            turnstile.reset();
        } else {
            errorEl.textContent = data.message;
            errorEl.classList.add("show");
            // Reset captcha on error
            turnstile.reset();
        }
    })
    .catch(error => {
        errorEl.textContent = "Registration error: " + error.message;
        errorEl.classList.add("show");
        turnstile.reset();
    });
}