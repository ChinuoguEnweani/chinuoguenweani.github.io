/* Shared mobile navigation behavior for pages that use the header menu */
(function () {
  "use strict";

  /* Locate the menu controls and navigation container */
  const menuToggleButton = document.querySelector(".menu-toggle");
  const menuCloseButton = document.querySelector(".menu-close");
  const primaryNavigation = document.getElementById("primary-nav");

  if (!menuToggleButton || !primaryNavigation) {
    return;
  }

  /* Apply open/closed state to navigation and page scrolling */
  function setMenuState(isOpen) {
    primaryNavigation.classList.toggle("is-open", isOpen);
    menuToggleButton.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  }

  /* Open/close menu from the hamburger toggle button */
  menuToggleButton.addEventListener("click", function () {
    const isOpen = !primaryNavigation.classList.contains("is-open");
    setMenuState(isOpen);
  });

  /* Close menu from explicit close button in the mobile panel */
  if (menuCloseButton) {
    menuCloseButton.addEventListener("click", function () {
      setMenuState(false);
    });
  }

  /* Close mobile menu after tapping any navigation link */
  primaryNavigation.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        setMenuState(false);
      }
    });
  });

  /* Ensure menu is reset when leaving mobile breakpoint */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      setMenuState(false);
    }
  });
})();
