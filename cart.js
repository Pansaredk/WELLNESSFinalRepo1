// Initialize cart from localStorage or empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Function to add items to the cart
function addToCart(name, price, image) {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const item = { name, price, image, quantity: 1 };
    cart.push(item);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(`${name} added to cart!`);
}

// Function to update the cart count in the navigation bar
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

// Function to display cart items on the cart page
function displayCartItems() {
  const cartItems = document.getElementById('cart-items');
  const totalAmount = document.getElementById('totalAmount');
  const emptyCartMessage = document.getElementById('empty-cart-message');

  if (cartItems && totalAmount && emptyCartMessage) {
    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      emptyCartMessage.style.display = 'block';
    } else {
      emptyCartMessage.style.display = 'none';
    }

    cart.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'cart-item';
      itemElement.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 130px;">
        </div>
        <div class="cart-item-details">
          <span>${item.name} - ₹. ${item.price}</span>
          <div class="quantity-control">
            <button onclick="updateQuantity(${index}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="updateQuantity(${index}, 1)">+</button>
          </div>
        </div>
        <button onclick="openConfirmationModal(${index})">Remove</button>
      `;
      cartItems.appendChild(itemElement);
      total += item.price * item.quantity;
    });

    totalAmount.textContent = `Total: Rs. ${total}`;
  }
}

// Function to update item quantity
function updateQuantity(index, change) {
  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  displayCartItems();
  updateCartCount();
}

// Function to open confirmation modal for removing an item
function openConfirmationModal(index) {
  const confirmationModal = document.getElementById('confirmationModal');
  if (confirmationModal) {
    confirmationModal.style.display = 'flex';
    confirmationModal.setAttribute('data-index', index);
  }
}

// Function to confirm removal of an item
function confirmRemove() {
  const confirmationModal = document.getElementById('confirmationModal');
  if (confirmationModal) {
    const index = confirmationModal.getAttribute('data-index');
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCartItems();
    updateCartCount();
    confirmationModal.style.display = 'none';
  }
}

// Function to cancel removal of an item
function cancelRemove() {
  const confirmationModal = document.getElementById('confirmationModal');
  if (confirmationModal) {
    confirmationModal.style.display = 'none';
  }
}

// Function to handle checkout
function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
  } else {
    // Open QR Code Modal
    const qrModal = document.getElementById('qrModal');
    if (qrModal) {
      qrModal.style.display = 'flex';
    }
  }
}

// Function to confirm payment and generate receipt
function confirmPayment() {
  const qrModal = document.getElementById('qrModal');
  const receiptModal = document.getElementById('receiptModal');
  const receiptDetails = document.getElementById('receiptDetails');

  // Generate Receipt
  let receiptHTML = '<div>';
  cart.forEach((item) => {
    receiptHTML += `
      <div class="receipt-item">
        <img src="${item.image}" alt="${item.name}" style="height: 100px; width: 200px;">
        <br><b>
        <div class="receipt-item-details">
          <br>
          <span>${item.name}</span><br>
          <span>Quantity: ${item.quantity}</span><br>
          <span>Cost: Rs. ${item.price * item.quantity}</span>
        </div><br>
      </div>
    `;
  });
  receiptHTML += '</div>';
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  receiptHTML += `<p><strong>Total: Rs. ${total}</strong></p>`;
  receiptDetails.innerHTML = receiptHTML;

  // Close QR Modal and Open Receipt Modal
  qrModal.style.display = 'none';
  receiptModal.style.display = 'flex';
}

// Function to download the receipt as a PDF
function downloadReceipt() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const platformName = "WELLNESS FOREVER"; // Change this to your platform's name
  const date = new Date().toLocaleDateString();
  const orderNo = Math.floor(100000 + Math.random() * 900000); // Random Order No.

  // Platform Name
  doc.setFontSize(18);
  doc.text(platformName, 80, 15);

  // Invoice Title
  doc.setFontSize(16);
  doc.text('Invoice', 90, 25);
  
  // Order Details
  doc.setFontSize(12);
  doc.text(`Order No: #${orderNo}`, 10, 35);
  doc.text(`Date: ${date}`, 150, 35);
  doc.line(10, 40, 200, 40); // Separator

  // Table Headers
  let y = 50;
  doc.setFontSize(12);
  doc.text('Product', 10, y);
  doc.text('Qty', 100, y);
  doc.text('Unit Price (Rs.)', 130, y);
  doc.text('Total (Rs.)', 170, y);
  doc.line(10, y + 2, 200, y + 2); // Horizontal line
  y += 10;

  let subtotal = 0;

  // Add receipt details
  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    doc.text(item.name, 10, y);
    doc.text(String(item.quantity), 105, y);
    doc.text(`Rs. ${item.price}`, 135, y);
    doc.text(`Rs. ${itemTotal}`, 175, y);
    y += 10;
  });

  // Calculate taxes (Assume 10% GST)
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  // Summary section
  doc.line(10, y, 200, y); // Line before totals
  y += 10;
  doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, 150, y);
  y += 10;
  doc.text(`GST (10%): Rs. ${tax.toFixed(2)}`, 150, y);
  y += 10;
  doc.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 150, y);

  // Footer with platform reference
  y += 20;
  doc.setFontSize(10);
  doc.text('Thank you for shopping with us!', 70, y);
  doc.text(`Generated by ${platformName}`, 70, y + 10);
  doc.line(10, y + 12, 200, y + 12); // Footer separator

  // Save the PDF
  doc.save(`Invoice_${orderNo}.pdf`);

  // Clear the cart after the receipt is downloaded
  cart = [];
  localStorage.removeItem('cart');
  updateCartCount();
}


// Function to close QR Modal
function closeQRModal() {
  const qrModal = document.getElementById('qrModal');
  if (qrModal) {
    qrModal.style.display = 'none';
  }
}

// Function to close Receipt Modal
function closeReceiptModal() {
  const receiptModal = document.getElementById('receiptModal');
  if (receiptModal) {
    receiptModal.style.display = 'none';
  }
}

// Function to continue shopping
function continueShopping() {
  // Clear the cart
  cart = [];
  localStorage.removeItem('cart');
  updateCartCount();

  // Redirect to the home page
  window.location.href = 'index.html';
}

// Initialize cart count and display cart items on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  displayCartItems();
});