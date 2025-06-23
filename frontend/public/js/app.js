// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status and show appropriate view
    if (auth.isAuthenticated()) {
        document.getElementById('route-planner').classList.remove('d-none');
    } else {
        auth.showLoginForm();
    }

    // Add loading spinner
    const spinner = document.createElement('div');
    spinner.className = 'spinner-overlay d-none';
    spinner.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `;
    document.body.appendChild(spinner);

    // Add global loading indicator
    window.showLoading = () => spinner.classList.remove('d-none');
    window.hideLoading = () => spinner.classList.add('d-none');

    // Add global error handler
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        alert('An unexpected error occurred. Please try again.');
    });

    // Add global promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        alert('An unexpected error occurred. Please try again.');
    });
});

// Add global fetch interceptor for loading indicator
const originalFetch = window.fetch;
window.fetch = async (...args) => {
    try {
        window.showLoading();
        const response = await originalFetch(...args);
        return response;
    } finally {
        window.hideLoading();
    }
}; 