const modal = document.getElementById('customer-modal');
const modalLoading = document.getElementById('modal-loading');
const editForm = document.getElementById('customer-edit-form');
const saveBtn = document.getElementById('btn-save-customer');
let currentCustomerId = null;
let lastTriggerButton = null;

function openModal(triggerBtn) {
  lastTriggerButton = triggerBtn || document.activeElement;
  modal.removeAttribute('inert');
  modal.classList.add('active');
}

function closeModal() {
  if (modal.contains(document.activeElement)) {
    document.activeElement.blur();
  }
  modal.setAttribute('inert', '');
  modal.classList.remove('active');
  currentCustomerId = null;

  if (lastTriggerButton && typeof lastTriggerButton.focus === 'function') {
    lastTriggerButton.focus();
  }
}

document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

// Open modal and load full customer data when clicking the edit icon
document.getElementById('tbody-data').addEventListener('click', async (event) => {
  const btn = event.target.closest('.btn-edit-customer');
  if (!btn) return;

  currentCustomerId = btn.dataset.customerId;
  modalLoading.style.display = 'block';
  editForm.style.display = 'none';
  openModal(btn);

  try {
    const res = await fetch(`/customer/${encodeURIComponent(currentCustomerId)}`, {
      headers: { 'Accept': 'application/json' }
    });
    const customer = await res.json();

    if (!res.ok) {
      throw new Error(customer.error || 'Erro ao carregar dados do cliente.');
    }

    document.getElementById('modal-customer-title').textContent = `Editar Cliente — ${customer.name}`;
    document.getElementById('edit-name').value = customer.name || '';
    document.getElementById('edit-cpf').value = customer.cpf || '';
    document.getElementById('edit-email').value = customer.email || '';
    document.getElementById('edit-phone').value = customer.phone || '';
    document.getElementById('edit-zipcode').value = customer.zipcode || '';
    document.getElementById('edit-address').value = customer.address || '';
    document.getElementById('edit-residence-number').value = customer.residence_number || '';
    document.getElementById('edit-neighborhood').value = customer.neighborhood || '';
    document.getElementById('edit-city').value = customer.city || '';
    document.getElementById('edit-state').value = customer.state || '';
    document.getElementById('edit-uf').value = customer.uf || '';

    modalLoading.style.display = 'none';
    editForm.style.display = 'block';
  } catch (err) {
    alert(err.message);
    closeModal();
  }
});

// Save updated customer details via PATCH /customer/:id
editForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!currentCustomerId) return;

  const payload = {
    name: document.getElementById('edit-name').value,
    cpf: document.getElementById('edit-cpf').value,
    email: document.getElementById('edit-email').value,
    phone: document.getElementById('edit-phone').value,
    zipcode: document.getElementById('edit-zipcode').value,
    address: document.getElementById('edit-address').value,
    residence_number: document.getElementById('edit-residence-number').value,
    neighborhood: document.getElementById('edit-neighborhood').value,
    city: document.getElementById('edit-city').value,
    state: document.getElementById('edit-state').value,
    uf: document.getElementById('edit-uf').value
  };

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const res = await fetch(`/customer/${encodeURIComponent(currentCustomerId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Erro ao atualizar cliente.');
    }

    // Update table row in place without reloading
    const tableRow = document.querySelector(`#tbody-data tr[data-customer-id="${currentCustomerId}"]`);
    if (tableRow) {
      tableRow.querySelector('.cell-customer-cpf').textContent = data.customer.cpf;
      tableRow.querySelector('.cell-customer-name').textContent = data.customer.name;
      tableRow.querySelector('.cell-customer-email').textContent = data.customer.email || '-';
      tableRow.querySelector('.cell-customer-phone').textContent = data.customer.phone || '-';
      tableRow.querySelector('.cell-customer-city').textContent =
        [data.customer.city, data.customer.uf].filter(Boolean).join(' - ') || '-';
    }

    closeModal();
  } catch (err) {
    alert(err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
});