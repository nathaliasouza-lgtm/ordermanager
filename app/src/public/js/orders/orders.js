const modal = document.getElementById('order-modal');
    const modalLoading = document.getElementById('modal-loading');
    const modalContent = document.getElementById('modal-content');
    const statusSelect = document.getElementById('modal-status-select');
    const saveStatusBtn = document.getElementById('btn-save-order-status');
    let currentOrderId = null;
    let lastTriggerButton = null;

    const currencyFormatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    function formatCurrency(value) {
      const numeric = Number(value);
      return currencyFormatter.format(Number.isFinite(numeric) ? numeric : 0);
    }

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
      currentOrderId = null;

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

    // Open modal and fetch details when clicking the eye icon
    document.getElementById('tbody-data').addEventListener('click', async (event) => {
      const btn = event.target.closest('.btn-view-order');
      if (!btn) return;

      currentOrderId = btn.dataset.orderId;
      modalLoading.style.display = 'block';
      modalContent.style.display = 'none';
      openModal(btn);

      try {
        const res = await fetch(`/orders/${encodeURIComponent(currentOrderId)}/details`, {
          headers: { 'Accept': 'application/json' }
        });
        const order = await res.json();

        if (!res.ok) {
          throw new Error(order.error || 'Failed to load order details.');
        }

        const customer = order.customers || {};
        const items = order.items || [];

        // 1. Customer Information
        document.getElementById('modal-customer-name').textContent = customer.name || 'N/A';
        document.getElementById('modal-customer-cpf').textContent = customer.cpf || '-';
        document.getElementById('modal-customer-address').textContent =
          customer.address || customer.street || customer.logradouro || '-';
        document.getElementById('modal-customer-number').textContent =
          customer.residence_number || customer.address_number || customer.number || customer.numero || '-';
        document.getElementById('modal-customer-neighborhood').textContent =
          customer.neighborhood || customer.bairro || '-';
        document.getElementById('modal-customer-city').textContent =
          customer.city || customer.cidade || '-';

        const extraAddressInfo = [
          customer.address_info || customer.complement || customer.complemento,
          customer.state || customer.estado || customer.uf,
          customer.zip_code || customer.cep ? `CEP: ${customer.zip_code || customer.cep}` : ''
        ].filter(Boolean).join(' | ');
        document.getElementById('modal-customer-info').textContent = extraAddressInfo || '-';

        // 2. Order Information
        document.getElementById('modal-order-title').textContent = `Order #${order.order_number}`;
        document.getElementById('modal-current-status').textContent = order.status || '-';
        document.getElementById('modal-payment-method').textContent = order.payment_method || '-';
        document.getElementById('modal-payment-date').textContent = order.payment_date || '-';
        document.getElementById('modal-handling-deadline').textContent = order.handling_deadline || '-';
        document.getElementById('modal-delivery-deadline').textContent = order.delivery_deadline || '-';

        // 3. Products Information
        const itemsBody = document.getElementById('modal-items-body');
        if (items.length === 0) {
          itemsBody.innerHTML = '<tr><td colspan="5">No items found for this order.</td></tr>';
        } else {
          itemsBody.innerHTML = items.map(item => `
            <tr>
              <td>${item.products?.sku || '-'}</td>
              <td>${item.products?.description || '-'}</td>
              <td>${item.amount}</td>
              <td>${formatCurrency(item.unit_price)}</td>
              <td>${formatCurrency(item.total_price)}</td>
            </tr>
          `).join('');
        }

        // 4. Summary & Status
        const itemsSubtotal = items.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0);
        document.getElementById('modal-shipping-fee').textContent = formatCurrency(order.shipping_fee);
        document.getElementById('modal-discount').textContent =
          `${order.discount_percentage ?? 0}% (${formatCurrency(order.discount_value)})`;
        document.getElementById('modal-subtotal').textContent = formatCurrency(itemsSubtotal);
        document.getElementById('modal-payment-value').textContent = formatCurrency(order.payment_value);

        const normalizedStatus = String(order.status || '').trim().toLowerCase();
        const matchingOption = Array.from(statusSelect.options).find(
          opt => opt.value.toLowerCase() === normalizedStatus
        );
        if (matchingOption) {
          statusSelect.value = matchingOption.value;
        }

        modalLoading.style.display = 'none';
        modalContent.style.display = 'block';
      } catch (err) {
        alert(err.message);
        closeModal();
      }
    });

    // Save updated status via PATCH /orders/:id/status
    saveStatusBtn.addEventListener('click', async () => {
      if (!currentOrderId) return;

      const newStatus = statusSelect.value;
      saveStatusBtn.disabled = true;
      saveStatusBtn.textContent = 'Saving...';

      try {
        const res = await fetch(`/orders/${encodeURIComponent(currentOrderId)}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to update status.');
        }

        const tableRow = document.querySelector(`#tbody-data tr[data-order-id="${currentOrderId}"]`);
        if (tableRow) {
          tableRow.querySelector('.cell-order-status').textContent = data.status;
        }

        closeModal();
      } catch (err) {
        alert(err.message);
      } finally {
        saveStatusBtn.disabled = false;
        saveStatusBtn.textContent = 'Save';
      }
    });