// validators.js

// Function to validate email addresses
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}

// Function to validate payment plans
function validatePaymentPlan(plan) {
    const validPlans = ['basic', 'premium', 'enterprise'];
    return validPlans.includes(plan);
}

// Function to validate user data
function validateUserData(user) {
    if (!user || typeof user !== 'object') return false;
    const { username, email, paymentPlan } = user;
    return (
        typeof username === 'string' &&
        validateEmail(email) &&
        validatePaymentPlan(paymentPlan)
    );
}

module.exports = { validateEmail, validatePaymentPlan, validateUserData };