// Script.js
const hamburger = document.querySelector(".hamburger");
const menubar = document.querySelector(".menubar");

hamburger.addEventListener("click", () => {
  menubar.classList.toggle("active");
  hamburger.classList.toggle("hamburger-active");
});
