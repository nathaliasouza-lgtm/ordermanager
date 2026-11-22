function renderReadOnlyRow(row) {
      const price = row.dataset.price;
      const amount = row.dataset.amount;
      const isActive = row.dataset.activated === 'true';

      row.classList.toggle('row-inactive', !isActive);
      row.querySelector('.cell-price').textContent = price;
      row.querySelector('.cell-amount').textContent = amount;
      row.querySelector('.cell-status').innerHTML = `
        <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}">
          ${isActive ? 'Active' : 'Inactive'}
        </span>
      `;
      row.querySelector('.cell-actions').innerHTML = `
        <div class="actions-wrapper">
          <button type="button" class="btn-action btn-edit">Edit</button>
        </div>
      `;
    }

    function enterEditMode(row) {
      const currentPrice = row.dataset.price;
      const currentAmount = row.dataset.amount;
      const isActive = row.dataset.activated === 'true';

      row.querySelector('.cell-price').innerHTML = `
        <input type="number" step="0.01" min="0" class="inline-input input-price" value="${currentPrice}">
      `;
      row.querySelector('.cell-amount').innerHTML = `
        <input type="number" step="1" min="0" class="inline-input input-amount" value="${currentAmount}">
      `;

      const toggleLabel = isActive ? 'Deactivate product' : 'Reactivate product';
      row.querySelector('.cell-actions').innerHTML = `
        <div class="actions-wrapper">
          <label class="deactivate-option">
            <input type="checkbox" class="checkbox-toggle-status">
            ${toggleLabel}
          </label>
          <button type="button" class="btn-action btn-save">Save</button>
          <button type="button" class="btn-action btn-cancel">Cancel</button>
        </div>
      `;
    }

    document.getElementById('tbody-data').addEventListener('click', async (event) => {
      const target = event.target;
      const row = target.closest('tr');
      if (!row) return;

      if (target.classList.contains('btn-edit')) {
        enterEditMode(row);
        return;
      }

      if (target.classList.contains('btn-cancel')) {
        renderReadOnlyRow(row);
        return;
      }

      if (target.classList.contains('btn-save')) {
        const sku = row.dataset.sku;
        const price = row.querySelector('.input-price').value;
        const storage_amt = row.querySelector('.input-amount').value;
        const wasActive = row.dataset.activated === 'true';
        const toggleChecked = row.querySelector('.checkbox-toggle-status').checked;
        const nextActivated = toggleChecked ? !wasActive : wasActive;

        target.disabled = true;
        target.textContent = 'Saving...';

        try {
          const response = await fetch(`/product/${encodeURIComponent(sku)}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              price,
              storage_amt,
              activated: nextActivated
            })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Error updating product.');
          }

          row.dataset.price = data.product.price;
          row.dataset.amount = data.product.storage_amt;
          row.dataset.activated = String(data.product.activated);

          row.querySelector('.cell-activation-date').textContent = data.product.activation_date || '-';
          row.querySelector('.cell-deactivated-at').textContent = data.product.deactivated_at || '-';

          renderReadOnlyRow(row);
        } catch (err) {
          alert(err.message);
          target.textContent = 'Save';
          target.disabled = false;
        }
      }
    });