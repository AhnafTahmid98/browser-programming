"use strict";

// Console logs
console.log("JavaScript connected successfully.");
console.log("Portfolio page loaded.");
console.log("Lecture 04 script is running.");

// Variables
const themeToggleButton = document.getElementById("themeToggle");
const contactButton = document.getElementById("contactButton");
const body = document.body;

let isDarkMode = false;
let contactClickCount = 0;

// Function 1
function setTheme() {
  if (isDarkMode) {
    body.classList.add("dark-mode");
    console.log("Dark mode enabled.");
  } else {
    body.classList.remove("dark-mode");
    console.log("Light mode enabled.");
  }
}

// Function 2
function showContactInfo() {
  alert("Contact: yourname@example.com\nLinkedIn: https://www.linkedin.com/in/your-linkedin-profile");
  console.log("Contact quick action used.");
}

// Event 1
themeToggleButton.onclick = function () {
  isDarkMode = !isDarkMode;
  setTheme();
  console.log("Theme button clicked. Current dark mode state:", isDarkMode);
};

// Event 2
contactButton.onclick = function () {
  contactClickCount = contactClickCount + 1;
  showContactInfo();
  console.log("Contact button clicked", contactClickCount, "time(s).");
};

// Initial state
setTheme();