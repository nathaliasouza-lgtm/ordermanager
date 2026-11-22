const { Product } = require('../config/models');

const DEDUCT_STATUSES = ['new', 'shipping', 'handling', 'delivered'];
const RESTORE_STATUSES = ['refunded', 'returned', 'cancelled'];
const NEUTRAL_STATUSES = ['failed', 'expired', 'payment pending'];

function normalizeStatus(status) {
  return String(status || '').trim().toLowerCase();
}

/**
 * Adjusts product `storage_amt` based on order status transitions or new order creation.
 * @param {Array<{product_id: number, amount: number}>} items - OrderItem records
 * @param {string|null} previousStatus - Previous status (null on new order creation)
 * @param {string} newStatus - Target status
 * @param {object} transaction - Sequelize transaction
 */
async function syncOrderInventory(items, previousStatus, newStatus, transaction) {
  const prev = normalizeStatus(previousStatus);
  const next = normalizeStatus(newStatus);

  // Neutral statuses ('failed', 'expired', 'payment pending') never alter inventory
  if (NEUTRAL_STATUSES.includes(next)) {
    return;
  }

  const wasDeducted = DEDUCT_STATUSES.includes(prev);
  const shouldDeduct = DEDUCT_STATUSES.includes(next);
  const shouldRestore = RESTORE_STATUSES.includes(next);

  let direction = 0; // -1 = decrease storage_amt, +1 = increase storage_amt

  if (!wasDeducted && shouldDeduct) {
    direction = -1;
  } else if (wasDeducted && shouldRestore) {
    direction = 1;
  }

  if (direction === 0) return;

  for (const item of items) {
    const product = await Product.findByPk(item.product_id, {
      transaction,
      lock: transaction ? transaction.LOCK.UPDATE : undefined
    });

    if (!product) {
      throw new Error(`Product ID ${item.product_id} was not found.`);
    }

    const qty = Number(item.amount ?? item.quantity) || 0;

    if (direction === -1) {
      if (Number(product.storage_amt) < qty) {
        throw new Error(
          `Insufficient stock for "${product.sku || product.description}" (available: ${product.storage_amt}, requested: ${qty}).`
        );
      }
      await product.decrement('storage_amt', { by: qty, transaction });
    } else if (direction === 1) {
      await product.increment('storage_amt', { by: qty, transaction });
    }
  }
}

module.exports = {
  syncOrderInventory
};