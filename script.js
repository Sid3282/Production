// Data Storage
let products = JSON.parse(localStorage.getItem('products')) || [];
let productions = JSON.parse(localStorage.getItem('productions')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];

// DOM Elements
const addProductForm = document.getElementById('addProductForm');
const productionForm = document.getElementById('productionForm');
const productionProduct = document.getElementById('productionProduct');
const dailyReportBtn = document.getElementById('dailyReportBtn');
const itemwiseReportBtn = document.getElementById('itemwiseReportBtn');
const monthlyReportBtn = document.getElementById('monthlyReportBtn');
const reportTableBody = document.querySelector('#reportTable tbody');
const historyTableBody = document.querySelector('#historyTable tbody');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
const notification = document.getElementById('notification');
const productionPopup = document.getElementById('productionPopup');

// Initialize the product dropdown on page load
window.onload = function() {
  updateProductDropdown();
  displayReport([]);
  displayHistory();
};

// Toggle Forms
function toggleForm(formId) {
  const form = document.getElementById(formId);
  form.classList.toggle('active');
}

// Show Notification
function showNotification(message) {
  notification.innerText = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Show Popup Message
function showPopup(message) {
  productionPopup.querySelector('p').innerText = message;
  productionPopup.style.display = 'block';
}

// Close Popup Message
function closePopup() {
  productionPopup.style.display = 'none';
}

// Add Product
document.getElementById('productForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const productName = document.getElementById('productName').value.trim();
  const productUnit = document.getElementById('productUnit').value;
  const productSize = document.getElementById('productSize').value.trim();

  // Check for duplicate product name and size
  if (products.some((p) => p.name.toLowerCase() === productName.toLowerCase() && p.size === productSize)) {
    alert('Product with the same name and size already exists!');
    return;
  }

  const product = {
    id: Date.now(),
    name: productName,
    unit: productUnit,
    size: productSize,
    totalStock: 0,
    closingStock: 0,
  };

  products.push(product);
  localStorage.setItem('products', JSON.stringify(products));  // Save to localStorage
  updateProductDropdown();
  document.getElementById('productForm').reset();
  showNotification('Product added successfully!');
  showPopup('Product added successfully!');
});

// Update Product Dropdown
function updateProductDropdown() {
  productionProduct.innerHTML = '<option value="">Select Product</option>';
  products.forEach((product) => {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = `${product.name} (${product.size}, ${product.unit})`;
    productionProduct.appendChild(option);
  });
}

// Add Production Entry
document.getElementById('productionEntryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const productId = parseInt(productionProduct.value);
  const quantity = parseInt(document.getElementById('productionQuantity').value);
  const unit = document.getElementById('productionUnit').value;
  const date = document.getElementById('productionDate').value;

  const production = {
    id: Date.now(),
    productId,
    quantity,
    unit,
    date,
  };

  productions.push(production);
  localStorage.setItem('productions', JSON.stringify(productions));  // Save to localStorage

  // Update total stock and closing stock
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.totalStock += quantity;
    product.closingStock += quantity;
  }

  document.getElementById('productionEntryForm').reset();
  showPopup('New production entry saved successfully!');
  displayReport(productions);
});

// Display Report in Table
function displayReport(productions) {
  reportTableBody.innerHTML = '';
  productions.forEach((prod) => {
    const product = products.find((p) => p.id === prod.productId);
    if (product) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${prod.date}</td>
        <td>${product.name}</td>
        <td>${product.size}</td>
        <td>${prod.quantity}</td>
        <td>${prod.unit}</td>
        <td>
          <button onclick="editProduction(${prod.id})" class="btn btn-info">Edit</button>
          <button onclick="deleteProduction(${prod.id})" class="btn btn-danger">Delete</button>
        </td>
      `;
      reportTableBody.appendChild(row);
    }
  });
}

// Edit Production Entry
function editProduction(id) {
  const production = productions.find((p) => p.id === id);
  if (production) {
    const product = products.find((p) => p.id === production.productId);
    const newQuantity = prompt('Enter new quantity:', production.quantity);
    const newUnit = prompt('Enter new unit:', production.unit);

    if (newQuantity !== null && newUnit !== null) {
      const oldQuantity = production.quantity;
      production.quantity = parseInt(newQuantity);
      production.unit = newUnit;

      // Update stock
      product.totalStock += (production.quantity - oldQuantity);
      product.closingStock += (production.quantity - oldQuantity);

      // Save to localStorage
      localStorage.setItem('productions', JSON.stringify(productions));
      localStorage.setItem('products', JSON.stringify(products));

      // Add to history
      addHistory('Edit', product.name, product.size, production.quantity, production.unit, production.date);
      displayReport(productions);
      showNotification('Production entry updated successfully!');
    }
  }
}

// Delete Production Entry
function deleteProduction(id) {
  const production = productions.find((p) => p.id === id);
  if (production) {
    const product = products.find((p) => p.id === production.productId);
    if (confirm('Are you sure you want to delete this production entry?')) {
      // Update stock
      product.totalStock -= production.quantity;
      product.closingStock -= production.quantity;

      // Remove production entry
      productions = productions.filter((p) => p.id !== id);

      // Save to localStorage
      localStorage.setItem('productions', JSON.stringify(productions));
      localStorage.setItem('products', JSON.stringify(products));

      // Add to history
      addHistory('Delete', product.name, product.size, production.quantity, production.unit, production.date);
      displayReport(productions);
      showNotification('Production entry deleted successfully!');
    }
  }
}

// Add to History
function addHistory(action, name, size, quantity, unit, date) {
  history.unshift({ action, name, size, quantity, unit, date });
  if (history.length > 5) history.pop(); // Keep only last 5 records
  localStorage.setItem('history', JSON.stringify(history));
  displayHistory();
}

// Display History
function displayHistory() {
  historyTableBody.innerHTML = '';
  history.forEach((record) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.action}</td>
      <td>${record.name}</td>
      <td>${record.size}</td>
      <td>${record.quantity}</td>
      <td>${record.unit}</td>
      <td>${record.date}</td>
    `;
    historyTableBody.appendChild(row);
  });
}