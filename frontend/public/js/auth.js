class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user'));
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Auth buttons
        document.getElementById('btn-login').addEventListener('click', () => this.showLoginForm());
        document.getElementById('btn-register').addEventListener('click', () => this.showRegisterForm());
        document.getElementById('btn-logout').addEventListener('click', () => this.logout());

        // Form submissions
        document.querySelector('#login-form form').addEventListener('submit', (e) => this.handleLogin(e));
        document.querySelector('#register-form form').addEventListener('submit', (e) => this.handleRegister(e));
    }

    showLoginForm() {
        document.getElementById('auth-forms').classList.remove('d-none');
        document.getElementById('login-form').classList.remove('d-none');
        document.getElementById('register-form').classList.add('d-none');
        document.getElementById('route-planner').classList.add('d-none');
        document.getElementById('route-history').classList.add('d-none');
    }

    showRegisterForm() {
        document.getElementById('auth-forms').classList.remove('d-none');
        document.getElementById('register-form').classList.remove('d-none');
        document.getElementById('login-form').classList.add('d-none');
        document.getElementById('route-planner').classList.add('d-none');
        document.getElementById('route-history').classList.add('d-none');
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                this.updateUI();
                document.getElementById('auth-forms').classList.add('d-none');
                document.getElementById('route-planner').classList.remove('d-none');
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Error during login');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (data.success) {
                alert('Registration successful! Please login.');
                this.showLoginForm();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Error during registration');
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateUI();
        this.showLoginForm();
    }

    updateUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const username = document.getElementById('username');

        if (this.token && this.user) {
            authButtons.classList.add('d-none');
            userInfo.classList.remove('d-none');
            username.textContent = this.user.username;
            document.getElementById('route-planner').classList.remove('d-none');
        } else {
            authButtons.classList.remove('d-none');
            userInfo.classList.add('d-none');
            username.textContent = '';
            document.getElementById('route-planner').classList.add('d-none');
        }
    }

    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }

    isAuthenticated() {
        return !!this.token;
    }
}

// Create and export auth instance
const auth = new Auth(); 