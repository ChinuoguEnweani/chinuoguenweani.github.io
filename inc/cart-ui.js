/* Shared cart UI helpers: basket count badge and add-to-basket toast */
(function () {
  "use strict";

  /* Local storage key fallback for pages where cart helper is not yet loaded */
  const CART_STORAGE_KEY = "jermaine_fotography_cart";

  /* Read cart items safely from local storage */
  function readCartItemsFallback() {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (!storedCart) {
        return [];
      }

      const parsedCart = JSON.parse(storedCart);
      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return parsedCart;
    } catch (error) {
      return [];
    }
  }

  /* Resolve current cart item count with helper fallback */
  function getCartCount() {
    if (window.JermaineCart) {
      return window.JermaineCart.getItemCount(window.JermaineCart.readCart());
    }

    const fallbackItems = readCartItemsFallback();
    return fallbackItems.reduce(function (runningCount, item) {
      const parsedQuantity = Number.parseInt(item.quantity, 10);
      return runningCount + (Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 0);
    }, 0);
  }

  /* Ensure every basket icon includes a numeric badge element */
  function ensureBasketBadges() {
    const basketLinks = document.querySelectorAll(".basket-link");

    basketLinks.forEach(function (basketLink) {
      let countBadge = basketLink.querySelector(".basket-count");
      if (!countBadge) {
        countBadge = document.createElement("span");
        countBadge.className = "basket-count";
        countBadge.setAttribute("aria-live", "polite");
        basketLink.appendChild(countBadge);
      }
    });
  }

  /* Refresh displayed basket count on all basket icons */
  function updateBasketBadges() {
    const count = getCartCount();
    const basketBadges = document.querySelectorAll(".basket-count");

    basketBadges.forEach(function (badge) {
      if (count > 0) {
        badge.textContent = String(count);
        badge.classList.add("is-visible");
      } else {
        badge.textContent = "";
        badge.classList.remove("is-visible");
      }
    });
  }

  /* Create the top-right add-to-basket toast once per page */
  function ensureCartToast() {
    let cartToast = document.querySelector(".cart-toast");
    if (cartToast) {
      return cartToast;
    }

    cartToast = document.createElement("aside");
    cartToast.className = "cart-toast";
    cartToast.setAttribute("role", "status");
    cartToast.setAttribute("aria-live", "polite");
    cartToast.innerHTML =
      '<button class="cart-toast-close" type="button" aria-label="Close basket notification">×</button>' +
      '<p class="cart-toast-title">Added to basket</p>' +
      '<div class="cart-toast-body">' +
      '<img class="cart-toast-image" src="" alt="Added product preview">' +
      '<div class="cart-toast-copy">' +
      '<p class="cart-toast-item"></p>' +
      '<p class="cart-toast-meta"></p>' +
      "</div>" +
      "</div>" +
      '<a class="cart-toast-link" href="basket.html">View basket</a>';

    document.body.appendChild(cartToast);

    const closeButton = cartToast.querySelector(".cart-toast-close");
    if (closeButton) {
      closeButton.addEventListener("click", function () {
        cartToast.classList.remove("is-visible");
      });
    }

    return cartToast;
  }

  /* Show add-to-basket feedback toast in the top-right corner */
  function showAddToast(detailPayload) {
    if (!detailPayload || !detailPayload.item) {
      return;
    }

    const toastElement = ensureCartToast();
    const itemImage = toastElement.querySelector(".cart-toast-image");
    const itemName = toastElement.querySelector(".cart-toast-item");
    const itemMeta = toastElement.querySelector(".cart-toast-meta");
    const itemCount = getCartCount();

    if (itemImage) {
      itemImage.src = detailPayload.item.image || "";
      itemImage.alt = (detailPayload.item.name || "Added item") + " preview";
    }

    if (itemName) {
      itemName.textContent = detailPayload.item.name || "Item added";
    }

    if (itemMeta) {
      itemMeta.textContent =
        "Qty added: " + String(detailPayload.addedQuantity || 1) + " • Basket total items: " + String(itemCount);
    }

    toastElement.classList.add("is-visible");
  }

  ensureBasketBadges();
  updateBasketBadges();

  /* Update badge count when cart state changes in this tab */
  window.addEventListener("jermaine-cart-updated", function () {
    updateBasketBadges();
  });

  /* Show top-right notification when an item is added to the cart */
  window.addEventListener("jermaine-cart-item-added", function (event) {
    updateBasketBadges();
    showAddToast(event.detail);
  });

  /* Update badge count when cart changes in another browser tab */
  window.addEventListener("storage", function (event) {
    if (event.key === CART_STORAGE_KEY) {
      updateBasketBadges();
    }
  });
})();
