// scripts.js

// Base URL for API
const API_BASE = "http://localhost:3000/api";

// User registration function
async function registerUser(userData) {
    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });
        const result = await response.json();
        if (response.ok) {
            alert("Registration successful!");
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error during registration:", error);
    }
}

// User login function
async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });
        const result = await response.json();
        if (response.ok) {
            alert("Login successful!");
            localStorage.setItem("token", result.token); // Save token for authenticated requests
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
}

// Fetch and display stories
async function fetchStories() {
    try {
        const response = await fetch(`${API_BASE}/stories`);
        const stories = await response.json();
        const storiesContainer = document.getElementById("content");
        storiesContainer.innerHTML = stories.map(story => `
            <div class="story">
                <h2>${story.title}</h2>
                <p>${story.desc}</p>
                <small>${new Date(story.postedDate).toLocaleDateString()}</small>
            </div>
        `).join("");
    } catch (error) {
        console.error("Error fetching stories:", error);
    }
}

// Event listeners (example usage)
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname === "/stories.html") {
        fetchStories();
    }
});