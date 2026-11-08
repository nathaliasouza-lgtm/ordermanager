let currentPage = 1;
const limit = 10;
const customer = document.getElementById('customer');

const btnSearch = document.getElementById('btn-search');
const modal = document.getElementById('modal-customers');
const closeModalBtn = document.querySelector('.close-modal');
const customerList = document.getElementById('customer-list');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

document.addEventListener('DOMContentLoaded', () => {
    const payment_date = document.getElementById('payment_date');
    const handling_deadline = document.getElementById('handling_deadline');
  try{
        payment_date.addEventListener('change', ()=>{
            var paymentDate = payment_date.value;
            var paymentDateValue = Date.parse(paymentDate);

            var THREE_DAYS_IN_MS = 3 * (24*60*60*1000)
            threeDaysDeadline = paymentDateValue + THREE_DAYS_IN_MS

            handlingDeadLineValue = new Date(threeDaysDeadline);
            handling_deadline.value = `${handlingDeadLineValue.toISOString().replace('.000Z', '')}`;
        });
    
  }catch(err){
    return console.error('ERROR: ', err)
  }

});

// Input de cliente no formulário
const customerInput = document.querySelector('input[name="customer"]') || document.getElementById('customer');
const tokenInput = document.getElementById('token_input')

// Open Modal
btnSearch.addEventListener('click', () => {
  modal.style.display = 'block';
  loadCustomers(currentPage);
});

// Close Modal
closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// Fetch Paginado via AJAX
async function loadCustomers(page) {
    var searchValue = customer.value;
  try {
    const response = await fetch(`../order/new/customers?searchValue=${searchValue}&page=${page}&limit=${limit}`);
    const result = await response.json();
    console.log(result.data[0]['id'])

    renderTable(result.data);
    updatePaginationControls(result.currentPage, result.totalPages);
  } catch (error) {
    console.error('Erro ao carregar clientes:', error);
  }
}

// Renderiza Código, Nome e CPF
function renderTable(customers) {
  customerList.innerHTML = '';

  if (!customers || customers.length === 0) {
    customerList.innerHTML = '<tr><td colspan="4" class="text-center">Oops! We couldn\'t find a customer. </td></tr>';
    return;
  }

  customers.forEach(customer => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${customer.name}</td>
      <td>${customer.cpf}</td>
      <td class="text-center">
        <button type="button" class="btn btn-primary btn-sm" onclick="selectCustomer('${customer.token}',  '${customer.name}')">
          Selecionar
        </button>
      </td>
    `;
    customerList.appendChild(tr);
  });
}

// Seleciona o cliente e preenche o input principal
function selectCustomer(token, name) {
  if (customerInput) {
    customer.value = `${name}`;
    tokenInput.value = `${token}`;
  }
  modal.style.display = 'none';
}

// Eventos de Paginação
prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadCustomers(currentPage);
  }
});

nextPageBtn.addEventListener('click', () => {
  currentPage++;
  loadCustomers(currentPage);
});

function updatePaginationControls(page, totalPages) {
  currentPage = page;
  pageInfo.textContent = `Page ${page} of ${totalPages || 1}`;
  prevPageBtn.disabled = page <= 1;
  nextPageBtn.disabled = page >= totalPages;
}