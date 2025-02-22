// signin-out.js

const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");
const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");

// SIGNUP
signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("signinName").value;
    const email = document.getElementById("signinEmail").value;
    const password = document.getElementById("signPassword").value;

    try {
        const data = await Parse.Cloud.run("signup", { name, email, password }); // Call 'signup' Cloud Function
        alert(data.message);
        signupForm.reset();
        showLogin.click(); // Switch to login form
    } catch (error) {
        console.error("Sign-up Error:", error);
        alert("Sign-up Error: " + error.message); // Display error message from Parse
    }
});

// LOGIN
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const data = await Parse.Cloud.run("login", { email, password }); // Call 'login' Cloud Function
        alert(data.message);
        // Store userId in sessionStorage after successful login
        sessionStorage.setItem('userId', data.user.objectId);
        window.location.href = "home.html"; // Redirect to home page
    } catch (error) {
        console.error("Login Error:", error);
        alert("Login Error: " + error.message); // Display error message from Parse
    }
});