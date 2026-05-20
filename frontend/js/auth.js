document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // simple demo login: set demo token and go to dashboard
            localStorage.setItem('tm_token', 'demo-token');
            window.location.href = 'dashboard.html';
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('name')?.value || '';
            const email = document.getElementById('email')?.value || '';
            const password = document.getElementById('password')?.value || '';

            // Try to call backend /signup if available. If it fails, fallback to demo mode.
            try {
                const res = await fetch('/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email || name, password })
                });

                if (res.ok) {
                    // success - store demo token and redirect
                    localStorage.setItem('tm_token', 'demo-token');
                    window.location.href = 'dashboard.html';
                    return;
                }
                const text = await res.text();
                console.warn('Signup response not OK:', res.status, text);
            } catch (e) {
                console.warn('Signup failed, falling back to demo flow', e);
            }

            // fallback demo behavior
            localStorage.setItem('tm_token', 'demo-token');
            window.location.href = 'dashboard.html';
        });
    }
});
