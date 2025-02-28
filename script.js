// Data Storage
let products = JSON.parse(localStorage.getItem('products')) || [];
let productions = JSON.parse(localStorage.getItem('productions')) || [];

// DOM Elements
const addProductForm = document.getElementById('addProductForm');
const productionForm = document.getElementById('productionForm');
const productionProduct = document.getElementById('productionProduct');
const dailyReportBtn = document.getElementById('dailyReportBtn');
const itemwiseReportBtn = document.getElementById('itemwiseReportBtn');
const monthlyReportBtn = document.getElementById('monthlyReportBtn');
const reportTableBody = document.querySelector('#reportTable tbody');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');
const notification = document.getElementById('notification');
const productionPopup = document.getElementById('productionPopup');

// Initialize the product dropdown on page load
window.onload = function() {
  updateProductDropdown();
  displayReport([]);
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
addProductForm.addEventListener('submit', (e) => {
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
  addProductForm.reset();
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
productionForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const productId = parseInt(productionProduct.value);
  const quantity = parseInt(document.getElementById('productionQuantity').value);
  const date = document.getElementById('productionDate').value;

  const production = {
    productId,
    quantity,
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

  productionForm.reset();
  showPopup('New production entry saved successfully!');
});

// Generate Reports
dailyReportBtn.addEventListener('click', () => generateReport('daily'));
itemwiseReportBtn.addEventListener('click', () => generateReport('itemwise'));
monthlyReportBtn.addEventListener('click', () => generateReport('monthly'));

function generateReport(type) {
  const today = new Date();
  let filteredProductions = [];

  if (type === 'daily') {
    filteredProductions = productions.filter((p) => p.date === today.toISOString().split('T')[0]);
  } else if (type === 'itemwise') {
    filteredProductions = productions;
  } else if (type === 'monthly') {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    filteredProductions = productions.filter((p) => new Date(p.date) >= startOfMonth);
  }

  displayReport(filteredProductions);
}

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
      `;
      reportTableBody.appendChild(row);
    }
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
  doc.text('Date', 10, 40);
  doc.text('Item Name', 60, 40);
  doc.text('Size', 110, 40);
  doc.text('Quantity', 160, 40);

  let yPosition = 50;

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
  doc.text('Date', 10, 40);
  doc.text('Item Name', 60, 40);
  doc.text('Size', 110, 40);
  doc.text('Quantity', 160, 40);

  let yPosition = 50;

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