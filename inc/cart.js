/* Shared cart state management utilities for purchase and basket pages */
(function () {
  "use strict";

  /* Local storage key used to persist basket items across page loads */
  const CART_STORAGE_KEY = "jermaine_fotography_cart";

  /* Dispatch a custom browser event for cart UI updates */
  function dispatchCartEvent(eventName, detailPayload) {
    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: detailPayload
      })
    );
  }

  /* Resolve a placeholder product type sentence from a known product id prefix */
  function getPlaceholderTypeById(productId) {
    if (productId.startsWith("turquoise-alpine-lake")) {
      return "Mollis cras tincidunt lacus, posuere varius nibh, dictum sapien.";
    }

    if (productId.startsWith("sunflowers-and-lemons")) {
      return "Vitae penatibus torquent curae, fringilla sem donec, gravida erat.";
    }

    if (productId.startsWith("rolling-green-hills")) {
      return "Rhoncus integer platea justo, facilisi metus arcu, interdum nisl.";
    }

    if (productId.startsWith("two-pears-in-sunlight")) {
      return "Felis habitasse proin tempor, aliquam lectus urna, suscipit elit.";
    }

    if (productId.startsWith("lemon-grove-still-life")) {
      return "Pulvinar sociosqu eros massa, ullamcorper enim mi, accumsan quam.";
    }

    return "";
  }

  /* Replace legacy product-type labels with placeholder text while preserving variant suffixes */
  function normalizeProductType(productId, productType) {
    const placeholderType = getPlaceholderTypeById(productId);
    if (!placeholderType || !productType) {
      return productType;
    }

    const legacyPrefixes = [
      "Limited Edition Fine Art Photographic Print",
      "Gallery Quality Giclee Print",
      "Museum Grade Archival Print"
    ];

    const matchedLegacyPrefix = legacyPrefixes.find(function (prefix) {
      return productType.startsWith(prefix);
    });

    if (!matchedLegacyPrefix) {
      return productType;
    }

    const variantSuffix = productType.slice(matchedLegacyPrefix.length);
    return placeholderType + variantSuffix;
  }

  /* Return a safe cart array from local storage */
  function readCart() {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (!storedCart) {
        return [];
      }

      const parsedCart = JSON.parse(storedCart);
      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return parsedCart
        .filter(function (item) {
          return item && typeof item.id === "string";
        })
        .map(function (item) {
          const safeId = String(item.id);
          const safeType = String(item.type || "");
          return {
            id: safeId,
            name: String(item.name || ""),
            price: Number(item.price) || 0,
            image: String(item.image || ""),
            type: normalizeProductType(safeId, safeType),
            publishedDate: String(item.publishedDate || ""),
            quantity: normalizeQuantity(item.quantity)
          };
        });
    } catch (error) {
      return [];
    }
  }

  /* Save cart array back to local storage */
  function writeCart(cartItems) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    dispatchCartEvent("jermaine-cart-updated", {
      cartItems: cartItems
    });
  }

  /* Ensure quantity is always at least one whole number */
  function normalizeQuantity(quantityValue) {
    const parsedQuantity = Number.parseInt(quantityValue, 10);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      return 1;
    }
    return parsedQuantity;
  }

  /* Insert a product into the cart or increase its quantity if already present */
  function addItem(product, quantityToAdd) {
    const cartItems = readCart();
    const safeQuantity = normalizeQuantity(quantityToAdd);
    const existingIndex = cartItems.findIndex(function (item) {
      return item.id === product.id;
    });
    let addedLineItem;

    if (existingIndex >= 0) {
      cartItems[existingIndex].quantity = cartItems[existingIndex].quantity + safeQuantity;
      addedLineItem = cartItems[existingIndex];
    } else {
      addedLineItem = {
        id: String(product.id),
        name: String(product.name || ""),
        price: Number(product.price) || 0,
        image: String(product.image || ""),
        type: String(product.type || ""),
        publishedDate: String(product.publishedDate || ""),
        quantity: safeQuantity
      };
      cartItems.push(addedLineItem);
    }

    writeCart(cartItems);
    dispatchCartEvent("jermaine-cart-item-added", {
      item: addedLineItem,
      addedQuantity: safeQuantity,
      cartItems: cartItems
    });
    return cartItems;
  }

  /* Update quantity for a specific product in the cart */
  function updateItemQuantity(productId, nextQuantity) {
    const cartItems = readCart();
    const itemIndex = cartItems.findIndex(function (item) {
      return item.id === productId;
    });

    if (itemIndex < 0) {
      return cartItems;
    }

    if (nextQuantity <= 0) {
      cartItems.splice(itemIndex, 1);
    } else {
      cartItems[itemIndex].quantity = normalizeQuantity(nextQuantity);
    }

    writeCart(cartItems);
    return cartItems;
  }

  /* Remove a product from the cart completely */
  function removeItem(productId) {
    const cartItems = readCart().filter(function (item) {
      return item.id !== productId;
    });
    writeCart(cartItems);
    return cartItems;
  }

  /* Calculate the cart subtotal from all line items */
  function calculateSubtotal(cartItems) {
    return cartItems.reduce(function (runningTotal, item) {
      return runningTotal + item.price * item.quantity;
    }, 0);
  }

  /* Return total number of units currently in the cart */
  function getItemCount(cartItems) {
    return cartItems.reduce(function (runningCount, item) {
      return runningCount + item.quantity;
    }, 0);
  }

  /* Format GBP prices consistently for display */
  function formatCurrency(value) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP"
    }).format(value);
  }

  /* Expose cart API globally for page scripts */
  window.JermaineCart = {
    readCart: readCart,
    addItem: addItem,
    updateItemQuantity: updateItemQuantity,
    removeItem: removeItem,
    calculateSubtotal: calculateSubtotal,
    getItemCount: getItemCount,
    formatCurrency: formatCurrency
  };
})();
