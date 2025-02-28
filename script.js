// Data Storage
let products = [];
let productions = [];

// DOM Elements
const addProductForm = document.getElementById('addProductForm');
const productionForm = document.getElementById('productionForm');
const productionProduct = document.getElementById('productionProduct');
const dailyReportBtn = document.getElementById('dailyReportBtn');
const weeklyReportBtn = document.getElementById('weeklyReportBtn');
const monthlyReportBtn = document.getElementById('monthlyReportBtn');
const reportTableBody = document.querySelector('#reportTable tbody');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const sendWhatsAppBtn = document.getElementById('sendWhatsAppBtn');

// Toggle Forms
function toggleForm(formId) {
  const form = document.getElementById(formId);
  form.classList.toggle('active');
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
  updateProductDropdown();
  addProductForm.reset();
  alert('Product added successfully!');
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

  // Update total stock and closing stock
  const product = products.find((p) => p.id === productId);
  if (product) {
    product.totalStock += quantity;
    product.closingStock += quantity;
  }

  productionForm.reset();
  alert('Production entry added successfully!');
});

// Generate Reports
dailyReportBtn.addEventListener('click', () => generateReport('daily'));
weeklyReportBtn.addEventListener('click', () => generateReport('weekly'));
monthlyReportBtn.addEventListener('click', () => generateReport('monthly'));

function generateReport(type) {
  const today = new Date();
  let filteredProductions = [];

  if (type === 'daily') {
    filteredProductions = productions.filter((p) => p.date === today.toISOString().split('T')[0]);
  } else if (type === 'weekly') {
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    filteredProductions = productions.filter((p) => new Date(p.date) >= startOfWeek);
  } else if (type === 'monthly') {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    filteredProductions = productions.filter((p) => new Date(p.date) >= startOfMonth);
  }

  displayReport(filteredProductions);
}

// Display Report
function displayReport(data) {
  reportTableBody.innerHTML = '';
  const groupedData = {};

  // Group data by product and calculate total quantity
  data.forEach((entry) => {
    const product = products.find((p) => p.id === entry.productId);
    const key = `${product.name}|${product.unit}|${product.size}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        name: product.name,
        unit: product.unit,
        size: product.size,
        totalQty: 0,
        totalStock: product.totalStock,
        closingStock: product.closingStock,
        date: entry.date,
      };
    }
    groupedData[key].totalQty += entry.quantity;
  });

  // Display grouped data in the table
  Object.values(groupedData).forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.unit}</td>
      <td>${item.size}</td>
      <td>${item.date}</td>
      <td>${item.totalQty}</td>
      <td>${item.totalStock}</td>
      <td>${item.closingStock}</td>
    `;
    reportTableBody.appendChild(row);
  });
}

// Export as PDF
exportPdfBtn.addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add colorful heading
  doc.setFontSize(18);
  doc.setTextColor(74, 144, 226); // Blue color
  doc.text('Production Report', 10, 10);

  // Add report date
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0); // Black color
  const reportDate = new Date().toLocaleDateString();
  doc.text(`Report Date: ${reportDate}`, 10, 20);

  // Add table headers
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255); // White color
  doc.setFillColor(74, 144, 226); // Blue background
  doc.rect(10, 25, 190, 10, 'F');
  doc.text('Date', 15, 30);
  doc.text('Item Name', 50, 30);
  doc.text('Size', 100, 30);
  doc.text('Qty', 140, 30);
  doc.text('Unit', 160, 30);
  doc.text('Total Stock', 180, 30);
  doc.text('Closing Stock', 200, 30);

  // Add report data
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Black color
  let y = 40;
  reportTableBody.querySelectorAll('tr').forEach((row) => {
    const cells = row.querySelectorAll('td');
    doc.text(cells[3].textContent, 15, y); // Date
    doc.text(cells[0].textContent, 50, y); // Item Name
    doc.text(cells[2].textContent, 100, y); // Size
    doc.text(cells[4].textContent, 140, y); // Quantity
    doc.text(cells[1].textContent, 160, y); // Unit
    doc.text(cells[5].textContent, 180, y); // Total Stock
    doc.text(cells[6].textContent, 200, y); // Closing Stock
    y += 10;
  });

  // Save the PDF
  doc.save('production_report.pdf');
});

// Send Report via WhatsApp
sendWhatsAppBtn.addEventListener('click', () => {
  let reportText = 'Production Report:\n\n';
  reportTableBody.querySelectorAll('tr').forEach((row) => {
    const cells = row.querySelectorAll('td');
    reportText += `${cells[3].textContent} | ${cells[0].textContent} (${cells[2].textContent}) | ${cells[4].textContent} ${cells[1].textContent} | Total Stock: ${cells[5].textContent} | Closing Stock: ${cells[6].textContent}\n`;
  });

  const whatsappUrl = `https://wa.me/9803282511?text=${encodeURIComponent(reportText)}`;
  window.open(whatsappUrl, '_blank');
});