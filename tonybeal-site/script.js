const navToggle = document.querySelector(".nav-toggle");
const siteHeader = document.querySelector(".site-header");
const siteNav = document.querySelector("#site-nav");
const navLinks = siteNav ? siteNav.querySelectorAll("a") : [];

if (navToggle && siteHeader && siteNav) {
  const closeNav = () => {
    siteHeader.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  };

  const openNav = () => {
    siteHeader.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = siteHeader.classList.contains("nav-open");
    if (isOpen) {
      closeNav();
      return;
    }

    openNav();
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });
}
