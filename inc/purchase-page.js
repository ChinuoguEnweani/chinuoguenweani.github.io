/* Purchase page interactions: quantity controls and add-to-basket actions */
(function () {
  "use strict";

  /* Locate all product cards displayed on the purchase page */
  const productCards = document.querySelectorAll(".product-card");
  if (!productCards.length) {
    return;
  }

  productCards.forEach(function (card) {
    /* Locate controls for this specific product card */
    const quantityInput = card.querySelector(".qty-input");
    const decreaseButton = card.querySelector(".qty-decrease");
    const increaseButton = card.querySelector(".qty-increase");
    const addButton = card.querySelector(".product-add-button");
    const feedbackLine = card.querySelector(".product-feedback");

    if (!quantityInput) {
      return;
    }

    /* Read and sanitize numeric quantity values */
    function getSafeQuantity() {
      const parsedValue = Number.parseInt(quantityInput.value, 10);
      if (!Number.isFinite(parsedValue) || parsedValue < 1) {
        return 1;
      }
      return parsedValue;
    }

    /* Write a sanitized quantity back to the input */
    function setSafeQuantity(nextValue) {
      quantityInput.value = String(Math.max(1, nextValue));
    }

    /* Quantity decrement control */
    if (decreaseButton) {
      decreaseButton.addEventListener("click", function () {
        setSafeQuantity(getSafeQuantity() - 1);
      });
    }

    /* Quantity increment control */
    if (increaseButton) {
      increaseButton.addEventListener("click", function () {
        setSafeQuantity(getSafeQuantity() + 1);
      });
    }

    /* Guard manual quantity edits */
    quantityInput.addEventListener("change", function () {
      setSafeQuantity(getSafeQuantity());
    });

    /* Add the selected product and quantity to basket storage */
    if (addButton) {
      addButton.addEventListener("click", function () {
        if (!window.JermaineCart) {
          return;
        }

        const selectedQuantity = getSafeQuantity();
        const selectedProduct = {
          id: card.dataset.productId,
          name: card.dataset.productName,
          price: Number.parseFloat(card.dataset.productPrice),
          image: card.dataset.productImage,
          type: card.dataset.productType,
          publishedDate: card.dataset.productPublished
        };

        window.JermaineCart.addItem(selectedProduct, selectedQuantity);
        if (feedbackLine) {
          feedbackLine.textContent = selectedProduct.name + " added to basket.";
        }
      });
    }
  });
})();
