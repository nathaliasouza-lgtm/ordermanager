'use strict';
let currentPage = 1;
const limit = 10;

// Customer vars
const customerInput = document.getElementById('customer');
const tokenInput = document.getElementById('token_input');
let selectedCustomerToken = '';

// Customer dropdown
const arrowButton = document.getElementById('customer_btn-search');
const customerModal = document.getElementById('modal-customers');
const customerList = document.getElementById('customer-list');

// Pagination
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// Deadlines
const paymentDate = document.getElementById('payment_date');
const handlingDeadline = document.getElementById('handling_deadline');


if (paymentDate && handlingDeadline) {
  paymentDate.addEventListener('change', () => {
    const deadline = new Date(paymentDate.value);
    if (!paymentDate.value || Number.isNaN(deadline.getTime())) return;

    deadline.setDate(deadline.getDate() + 3);

    const year = deadline.getFullYear();
    const month = String(deadline.getMonth() + 1).padStart(2, '0');
    const day = String(deadline.getDate()).padStart(2, '0');
    const hours = String(deadline.getHours()).padStart(2, '0');
    const minutes = String(deadline.getMinutes()).padStart(2, '0');

    handlingDeadline.value =
      `${year}-${month}-${day}T${hours}:${minutes}`;
  });
}

// CUSTOMERS
function openCustomerModal() {
  if (!customerModal) return;

  customerModal.classList.add('is-open');

  if (arrowButton) {
    arrowButton.classList.add('is-open');
  }

  if (customerList) {
    customerList.querySelectorAll('tr').forEach(row => {
      row.style.display = '';
    });
  }
  loadCustomers(currentPage);
}

function closeCustomerModal() {
  if (!customerModal) return;

  customerModal.classList.remove('is-open');

  if (arrowButton) {
    arrowButton.classList.remove('is-open');
  }
}

if (arrowButton && customerModal) {
  arrowButton.addEventListener('click', event => {
    event.preventDefault();

    if (customerModal.classList.contains('is-open')) {
      closeCustomerModal();
    } else {
      openCustomerModal();
    }
  });
}

if (customerInput) {
  customerInput.addEventListener('input', () => {
    if (tokenInput) {
      tokenInput.value = '';
    }

    const searchTerm = customerInput.value.toLowerCase().trim();

    if (!customerList) return;

    customerList.querySelectorAll('tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(searchTerm) ? '' : 'none';
    });
  });
}

async function loadCustomers(page) {
  if (!customerList) return;

  try {
    const searchValue =
      customerInput && customerInput.value.trim() !== '' ? '' : (customerInput ? customerInput.value.trim() : '');

    const response = await fetch(
      `../order/new/customers?searchValue=${encodeURIComponent(searchValue)}&page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result = await response.json();

    renderTable(result.data);

    updatePaginationControls(
      result.currentPage ?? page,
      result.totalPages ?? 1
    );

  } catch (error) {
    console.error('Error loading customers:', error);
  }
}

function selectCustomer(token, name) {
  if (!customerInput || !tokenInput) {
    console.error('Customer input elements not found.');
    return;
  }

  if (name === undefined || name === null || String(name).trim() === '') {
    console.error('Customer name is invalid:', name);
    return;
  }

  if (token === undefined || token === null || String(token).trim() === '') {
    console.error('The selected customer has no token in the API response.');
    return;
  }

  selectedCustomerToken = String(token).trim();
  customerInput.value = String(name);
  tokenInput.value = selectedCustomerToken;

  closeCustomerModal();
}

function renderTable(customers) {
  if (!customerList) return;

  customerList.innerHTML = '';

  if (!Array.isArray(customers) || customers.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    td.colSpan = 3;
    td.textContent = 'Customer not found.';
    td.className = 'text-center';

    tr.appendChild(td);
    customerList.appendChild(tr);

    return;
  }

  customers.forEach(customerData => {
    const customerName =
      customerData.name ??
      customerData.customer_name ??
      customerData.full_name ??
      customerData.nome ??
      '';

    const customerToken =
      customerData.token ??
      customerData.customer_token ??
      customerData.customerToken ??
      '';

    const customerCpf =
      customerData.cpf ??
      customerData.customer_cpf ??
      '';

    const tr = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = customerName;

    const cpfCell = document.createElement('td');
    cpfCell.textContent = customerCpf;

    const actionCell = document.createElement('td');
    actionCell.className = 'text-center';

    const selectButton = document.createElement('button');

    selectButton.type = 'button';
    selectButton.className = 'btn btn-primary btn-sm';
    selectButton.textContent = 'Select';

    selectButton.addEventListener('click', () => {
      selectCustomer(customerToken, customerName);
    });

    actionCell.appendChild(selectButton);

    tr.appendChild(nameCell);
    tr.appendChild(cpfCell);
    tr.appendChild(actionCell);

    customerList.appendChild(tr);
  });
}

if (prevPageBtn) {
  prevPageBtn.addEventListener('click', event => {
    event.preventDefault();

    if (currentPage > 1) {
      currentPage--;
      loadCustomers(currentPage);
    }
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener('click', event => {
    event.preventDefault();

    currentPage++;
    loadCustomers(currentPage);
  });
}

function updatePaginationControls(page, totalPages) {
  currentPage = page;

  const total = Math.max(1, Number(totalPages) || 1);

  if (pageInfo) {
    pageInfo.textContent = `Page ${page} of ${total}`;
  }

  if (prevPageBtn) {
    prevPageBtn.disabled = page <= 1;
  }

  if (nextPageBtn) {
    nextPageBtn.disabled = page >= total;
  }
}

// Keep customer_token populated in the submitted form data.
const orderForm = customerInput?.closest('form') || document.querySelector('form');

if (orderForm) {
  orderForm.addEventListener('submit', () => {
    if (tokenInput && selectedCustomerToken) {
      tokenInput.value = selectedCustomerToken;
    }
  });
}

// PRODUCTS
let productCurrentPage = 1;
const productLimit = 10;

const productsEndpoint = '../order/new/products';

const addProductsButton = document.getElementById('btn-add-products');
const productsModal = document.getElementById('modal-products');
const closeProductsButton = document.getElementById('close-product-modal');
const saveProductsButton = document.getElementById('save-products');

const productSearchInput = document.getElementById('product-search');
const productList = document.getElementById('product-list');

const prevProductPageBtn = document.getElementById('prev-product-page');
const nextProductPageBtn = document.getElementById('next-product-page');
const productPageInfo = document.getElementById('product-page-info');

const selectedProductList = document.getElementById('selected-product-list');
const productSummaryInput = document.getElementById('product');
const productHiddenFields = document.getElementById('product-hidden-fields');

const selectedProducts = new Map();

// Order Values
const discountPercentageInput = document.getElementById('discount_percentage');
const discountValueInput = document.getElementById('discount_value');
const shippingFeeInput = document.getElementById('shipping_fee');
const paymentValueInput = document.getElementById('payment_value');

function getProductId(product) {
  const id = product.sku ?? '';
  return id === undefined || id === null ? '' : String(id);
}

function getProductPrice(product) {
  const value = product.price ?? 0;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  let normalized = String(value).trim().replace(/[^\d,.-]/g, '');

  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function isProductActive(product) {
  const activeValue = product.activated;

  if (activeValue === undefined || activeValue === null) {
    return;
  }

  return activeValue
}

function formatProductPrice(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

//Order Total Value
function parseOrderNumber(value) {
  if (value === undefined || value === null || value === '') {
    return 0;
  }

  let normalized = String(value)
    .trim()
    .replace(/[^0-9,.-]/g, '');

  if (normalized.includes(',')) {
    normalized = normalized
      .replace(/\./g, '')
      .replace(',', '.');
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

function updateOrderTotal() {
  // Calculate products subtotal
  let productsSubtotal = 0;

  selectedProducts.forEach(product => {
    productsSubtotal += product.amount * product.unitPrice;
  });

  // Get discount percentage
  const discountPercentage = Math.min(
    100,
    Math.max(
      0,
      parseOrderNumber(discountPercentageInput?.value)
    )
  );

  // Get shipping fee
  const shippingFee = Math.max(
    0,
    parseOrderNumber(shippingFeeInput?.value)
  );

  // Calculate discount amount
  const discountAmount = productsSubtotal * (discountPercentage / 100);

  // Calculate final total
  const orderTotal = productsSubtotal - discountAmount + shippingFee;

  // Update discount value field
  if (discountValueInput) {
    discountValueInput.value = discountAmount.toFixed(2);
  }

  // Update total field
  if (paymentValueInput) {
    paymentValueInput.value = orderTotal.toFixed(2);
  }
}


// Update total when discount or shipping changes
if (discountPercentageInput) {
  discountPercentageInput.addEventListener(
    'input',
    updateOrderTotal
  );
}

if (shippingFeeInput) {
  shippingFeeInput.addEventListener(
    'input',
    updateOrderTotal
  );
}

// PRODUCT MODAL
function openProductsModal() {
  if (!productsModal) return;

  productsModal.classList.add('is-open');

  productCurrentPage = 1;

  if (productSearchInput) {
    productSearchInput.value = '';
  }

  loadProducts(productCurrentPage);
}

function closeProductsModal() {
  if (!productsModal) return;

  productsModal.classList.remove('is-open');
}

if (addProductsButton) {
  addProductsButton.addEventListener(
    'click',
    openProductsModal
  );
}

if (closeProductsButton) {
  closeProductsButton.addEventListener(
    'click',
    closeProductsModal
  );
}

async function loadProducts(page) {
  if (!productList) return;

  try {
    const searchValue = productSearchInput ? productSearchInput.value.trim() : '';

    const response = await fetch(
      `../order/new/products?searchValue=${encodeURIComponent(searchValue)}&page=${page}&limit=${productLimit}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result = await response.json();

    const products = Array.isArray(result.data) ? result.data : [];


    renderProductTable(products);

    updateProductPagination(
      result.currentPage ?? page,
      result.totalPages ?? 1
    );

  } catch (error) {
    console.error('Error loading products:', error);

    productList.innerHTML = '';

    const tr = document.createElement('tr');
    const td = document.createElement('td');

    td.colSpan = 4;
    td.className = 'product-empty-message';
    td.textContent = 'Unable to load products.';

    tr.appendChild(td);
    productList.appendChild(tr);
  }
}

function renderProductTable(products) {
  if (!productList) return;
  productList.innerHTML = '';

  if (!Array.isArray(products) || products.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    td.colSpan = 4;
    td.textContent = 'No active products found.';
    td.className = 'product-empty-message';

    tr.appendChild(td);
    productList.appendChild(tr);

    return;
  }

  products.forEach(product => {
    const sku = product.sku ?? ''
    
    if (!sku) {
      console.warn('Product without a valid identifier:', product);
      return;
    }

    const name = product.description ?? ''
    const price = getProductPrice(product);
    const amount = selectedProducts.get(sku)?.amount ?? 0;

    const tr = document.createElement('tr');
    const skuCell = document.createElement('td');
    skuCell.textContent = sku;

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = name;

    const priceCell = document.createElement('td');
    priceCell.textContent = formatProductPrice(price);

    const amountCell = document.createElement('td');

    const amountControl = document.createElement('div');
    amountControl.className = 'amount-control';

    const decreaseButton = document.createElement('button');
    decreaseButton.type = 'button';
    decreaseButton.textContent = '−';
    decreaseButton.setAttribute('aria-label', 'Remove one');

    const amountValue = document.createElement('span');
    amountValue.textContent = amount;

    const increaseButton = document.createElement('button');
    increaseButton.type = 'button';
    increaseButton.textContent = '+';
    increaseButton.setAttribute('aria-label', 'Add one');

    decreaseButton.addEventListener('click', () => {
      changeProductAmount(sku, product, -1);
      amountValue.textContent = selectedProducts.get(sku)?.amount ?? 0;
    });

    increaseButton.addEventListener('click', () => {
      changeProductAmount(sku, product, 1);
      amountValue.textContent = selectedProducts.get(sku)?.amount ?? 0;
    });

    amountControl.appendChild(decreaseButton);
    amountControl.appendChild(amountValue);
    amountControl.appendChild(increaseButton);

    amountCell.appendChild(amountControl);

    tr.appendChild(skuCell);
    tr.appendChild(descriptionCell);
    tr.appendChild(priceCell);
    tr.appendChild(amountCell);

    productList.appendChild(tr);
  });
}

function changeProductAmount(id, product, difference) {
  const existing = selectedProducts.get(id);
  const newAmount = (existing?.amount ?? 0) + difference;

  if (newAmount <= 0) {
    selectedProducts.delete(id);
    return;
  }

  selectedProducts.set(id, {
    sku: product.sku,
    description: product.description,
    unitPrice: product.price,
    amount: newAmount
  });
}

// Product search
if (productSearchInput) {
  productSearchInput.addEventListener('input', () => {
    productCurrentPage = 1;
    loadProducts(productCurrentPage);
  });
}

// Product pagination
if (prevProductPageBtn) {
  prevProductPageBtn.addEventListener('click', () => {
    if (productCurrentPage > 1) {
      productCurrentPage--;
      loadProducts(productCurrentPage);
    }
  });
}

if (nextProductPageBtn) {
  nextProductPageBtn.addEventListener('click', () => {
    productCurrentPage++;
    loadProducts(productCurrentPage);
  });
}

function updateProductPagination(page, totalPages) {
  productCurrentPage = Number(page) || 1;

  const total = Math.max(1, Number(totalPages) || 1);

  if (productPageInfo) {
    productPageInfo.textContent = `Page ${productCurrentPage} of ${total}`;
  }

  if (prevProductPageBtn) {
    prevProductPageBtn.disabled = productCurrentPage <= 1;
  }

  if (nextProductPageBtn) {
    nextProductPageBtn.disabled = productCurrentPage >= total;
  }
}

function renderSelectedProducts() {
  if (!selectedProductList) {
    console.error( 'Selected products table body (#selected-product-list) was not found.');
    return;
  }

  selectedProductList.innerHTML = '';

  if (productHiddenFields) {
    productHiddenFields.innerHTML = '';
  }

  // No products selected
  if (selectedProducts.size === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');

    td.colSpan = 4;
    td.textContent = 'No products selected.';
    td.className = 'product-empty-message';

    tr.appendChild(td);
    selectedProductList.appendChild(tr);

    if (productSummaryInput) {
      productSummaryInput.value = 'No products selected';
    }

    updateOrderTotal();
    return;
  }

  let index = 0;
  let totalProducts = 0;

  selectedProducts.forEach(product => {
    const lineTotal = product.amount * product.unitPrice;
    totalProducts += product.amount;

    const tr = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = product.description;

    const amountCell = document.createElement('td');
    amountCell.textContent = product.amount;

    const priceCell = document.createElement('td');
    priceCell.textContent = formatProductPrice(product.unitPrice);

    const totalCell = document.createElement('td');
    totalCell.textContent = formatProductPrice(lineTotal);

    tr.appendChild(nameCell);
    tr.appendChild(amountCell);
    tr.appendChild(priceCell);
    tr.appendChild(totalCell);

    selectedProductList.appendChild(tr);

    if (productHiddenFields) {
      const hiddenFields = [
        ['sku', product.sku],
        ['description', product.description],
        ['amount', product.amount],
        ['unit_price', product.unitPrice],
        ['total_price', lineTotal]
    ];

    hiddenFields.forEach(([field, value]) => {
      const input = document.createElement('input');

      input.type = 'hidden';
      input.name = `products[${index}][${field}]`;
      input.value = value ?? '';

      productHiddenFields.appendChild(input);
    });
    }

    index++;
  });

  if (productSummaryInput) {
    productSummaryInput.value = `${selectedProducts.size} product(s) selected —  ${totalProducts} unit(s)`;
  }

  updateOrderTotal();
}

function saveProducts() {
  if (selectedProducts.size === 0) {
    alert('Please select at least one product.');
    return;
  }

  renderSelectedProducts();

  closeProductsModal();
}


if (saveProductsButton) {
  saveProductsButton.addEventListener(
    'click',
    saveProducts
  );
}

updateOrderTotal();