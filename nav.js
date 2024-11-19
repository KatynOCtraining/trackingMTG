// navigation.js
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      // Activer le lien
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Afficher la section correspondante
      sections.forEach((section) => section.classList.remove("active"));
      const target = document.querySelector(link.getAttribute("href"));
      target.classList.add("active");
    });
  });
});
