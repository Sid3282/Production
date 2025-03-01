// Data Storage
let products = JSON.parse(localStorage.getItem('products')) || [];
let productions = JSON.parse(localStorage.getItem('productions')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];

// DOM Elements
const loginPage = document.getElementById('loginPage');
const app = document.getElementById('app');
const loginForm = document.getElementById('loginForm');
const todayDate = document.getElementById('todayDate');
const loggedInUser = document.getElementById('loggedInUser');
const logoutBtn = document.getElementById('logoutBtn');
const dateRangeBtn = document.getElementById('dateRangeBtn');
const addProductForm = document.getElementById('addProductForm');
const productionForm = document.getElementById('productionForm');
const productionProduct = document.getElementById('productionProduct');
const dateRangeForm = document.getElementById('dateRangeForm');
const reportTableBody = document.querySelector('#reportTable tbody');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
const notification = document.getElementById('notification');
const productionPopup = document.getElementById('productionPopup');
const popupMessage = document.getElementById('popupMessage');

// Users
const users = {
  Roshan: 'Roshan',
  Sid: 'Sid',
};

// Initialize the product dropdown on page load
window.onload = function() {
  updateProductDropdown();
  displayReport([]);
  displayHistory();
  setTodayDate();
};

// Set Today's Date
function setTodayDate() {
  const date = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  todayDate.innerText = date.toLocaleDateString('en-US', options);
}

// Login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (users[username] && users[username] === password) {
    loginPage.style.display = 'none';
    app.style.display = 'block';
    loggedInUser.innerText = `Welcome, ${username}`;
  } else {
    showPopup('Invalid username or password!');
  }
});

// Logout
logoutBtn.addEventListener('click', () => {
  loginPage.style.display = 'flex';
  app.style.display = 'none';
  loggedInUser.innerText = '';
});

// Toggle Forms
function toggleForm(formId) {
  const form = document.getElementById(formId);
  form.classList.toggle('active');
  if (formId === 'dateRangeForm') {
    dateRangeBtn.innerHTML = `<i class="fas fa-calendar"></i> Generate Report`;
  }
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
  popupMessage.innerText = message;
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
    showPopup('Product with the same name and size already exists!');
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

// Generate Report by Date Range
dateRangeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  const filteredProductions = productions.filter((p) => {
    const prodDate = new Date(p.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return prodDate >= start && prodDate <= end;
  });

  displayReport(filteredProductions);
});

// Display Report in Table
function displayReport(productions) {
  reportTableBody.innerHTML = '';
  const productTotals = {};

  productions.forEach((prod) => {
    const product = products.find((p) => p.id === prod.productId);
    if (product) {
      if (!productTotals[product.id]) {
        productTotals[product.id] = {
          name: product.name,
          size: product.size,
          unit: prod.unit,
          total: 0,
        };
      }
      productTotals[product.id].total += prod.quantity;

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

  // Add total row
  Object.values(productTotals).forEach((product) => {
    const row = document.createElement('tr');
    row.style.backgroundColor = '#f1f1f1';
    row.innerHTML = `
      <td colspan="3"><strong>Total</strong></td>
      <td><strong>${product.total}</strong></td>
      <td><strong>${product.unit}</strong></td>
      <td></td>
    `;
    reportTableBody.appendChild(row);
  });
}

// Export Report to PDF
exportPdfBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add colorful heading
  doc.setFont('helvetica');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(52, 152, 219);
  doc.rect(0, 0, 210, 30, 'F');
  doc.text('PARTEX - Production Report', 105, 15, null, null, 'center');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  // Add table headers
  doc.setFillColor(200, 220, 255);
  doc.rect(10, 40, 190, 10, 'F');
  doc.text('Date', 10, 45);
  doc.text('Item Name', 60, 45);
  doc.text('Size', 110, 45);
  doc.text('Quantity', 160, 45);

  let yPosition = 55;

  // Add table rows
  reportTableBody.querySelectorAll('tr').forEach((row) => {
    const cells = row.querySelectorAll('td');
    doc.text(cells[0].textContent, 10, yPosition);
    doc.text(cells[1].textContent, 60, yPosition);
    doc.text(cells[2].textContent, 110, yPosition);
    doc.text(cells[3].textContent, 160, yPosition);
    yPosition += 10;
  });

  // Save the PDF
  doc.save('partex_production_report.pdf');
});

// Send Report via WhatsApp
sendWhatsAppBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add colorful heading
  doc.setFont('helvetica');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(52, 152, 219);
  doc.rect(0, 0, 210, 30, 'F');
  doc.text('PARTEX - Production Report', 105, 15, null, null, 'center');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  // Add table headers
  doc.setFillColor(200, 220, 255);
  doc.rect(10, 40, 190, 10, 'F');
  doc.text('Date', 10, 45);
  doc.text('Item Name', 60, 45);
  doc.text('Size', 110, 45);
  doc.text('Quantity', 160, 45);

  let yPosition = 55;

  // Add table rows
  reportTableBody.querySelectorAll('tr').forEach((row) => {
    const cells = row.querySelectorAll('td');
    doc.text(cells[0].textContent, 10, yPosition);
    doc.text(cells[1].textContent, 60, yPosition);
    doc.text(cells[2].textContent, 110, yPosition);
    doc.text(cells[3].textContent, 160, yPosition);
    yPosition += 10;
  });

  // Save the PDF
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);

  // Open WhatsApp with the PDF
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent('Here is the production report:')}`;
  window.open(whatsappUrl, '_blank');
});