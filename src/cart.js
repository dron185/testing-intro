const DELIVERY_COST = 30000;
const FREE_DELIVERY_FROM = 50000;
const SAVE10_MIN_SUBTOTAL = 20000;
const SAVE10_PERCENT = 10;
const SAVE10_CODE = 'SAVE10';

function assertPositiveQuantity(quantity) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new RangeError('Количество товара должно быть положительным целым числом');
  }
}

function findItem(cart, id) {
  return cart.find((item) => item.id === id);
}

function addToCart(cart, product, quantity) {
  assertPositiveQuantity(quantity);

  const existing = findItem(cart, product.id);
  const nextQuantity = (existing ? existing.quantity : 0) + quantity;

  if (nextQuantity > product.stock) {
    throw new RangeError('Нельзя добавить больше товара, чем есть на складе');
  }

  if (existing) {
    return cart.map((item) =>
        item.id === product.id ? { ...item, quantity: nextQuantity } : item
    );
  }

  return [...cart, { ...product, quantity }];
}

function changeQuantity(cart, id, quantity) {
  assertPositiveQuantity(quantity);

  const existing = findItem(cart, id);
  if (!existing) return cart;

  if (quantity > existing.stock) {
    throw new RangeError('Количество не может превышать остаток на складе');
  }

  return cart.map((item) => (item.id === id ? { ...item, quantity } : item));
}

function removeFromCart(cart, id) {
  return cart.filter((item) => item.id !== id);
}

function calculateCartSubtotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function calculateOrderTotal(cart, promoCode) {
  const subtotal = calculateCartSubtotal(cart);

  const normalizedCode = String(promoCode || '').trim().toUpperCase();
  const discount =
      normalizedCode === SAVE10_CODE && subtotal >= SAVE10_MIN_SUBTOTAL
          ? Math.round((subtotal * SAVE10_PERCENT) / 100)
          : 0;

  const delivery =
      subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_COST;

  return {
    subtotal,
    discount,
    delivery,
    total: subtotal - discount + delivery,
  };
}

const cartApi = {
  addToCart,
  changeQuantity,
  removeFromCart,
  calculateCartSubtotal,
  calculateOrderTotal,
};

if (typeof module !== 'undefined') module.exports = cartApi;
if (typeof window !== 'undefined') window.cartApi = cartApi;
