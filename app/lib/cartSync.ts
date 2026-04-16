/**
 * cartSync.ts
 * Shared cart persistence helpers — called on login and logout.
 * No React state here; all callers are responsible for updating their own state.
 */

export type Cart = Record<string, number>;

const BACKEND = "/backend/api/users/cart";

/**
 * Save the given cart to the user's backend account.
 * Fire-and-forget — failures are silently ignored so they never block login/logout.
 */
export async function saveCartToBackend(token: string, cart: Cart): Promise<void> {
  try {
    await fetch(BACKEND, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ cart }),
    });
  } catch { /* best-effort */ }
}

/**
 * On login: fetch the user's saved backend cart, merge with the current guest cart,
 * persist the merged cart to backend, update localStorage, and return the merged cart.
 *
 * Merge rule: guest cart wins on quantity for items present in both.
 * Items only in the user's backend cart are added to the result.
 * This ensures guest items are never lost and previously saved items are restored.
 */
export async function fetchAndMergeCart(
  token: string,
  guestCart: Cart,
): Promise<Cart> {
  let userCart: Cart = {};
  try {
    const r = await fetch(BACKEND, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) {
      const d = await r.json();
      if (d?.cart && typeof d.cart === "object") userCart = d.cart as Cart;
    }
  } catch { /* network error — proceed with empty user cart */ }

  // Merge: start with user's saved cart, then overlay guest cart
  // (guest quantities take priority; user-only items fill in the rest)
  const merged: Cart = { ...userCart };
  Object.entries(guestCart).forEach(([id, qty]) => {
    if (qty > 0) merged[id] = qty;
  });

  // Remove zero-or-negative entries
  Object.keys(merged).forEach(id => { if ((merged[id] || 0) <= 0) delete merged[id]; });

  // Persist merged cart to backend
  await saveCartToBackend(token, merged);

  // Sync to localStorage so all other components react via storage event
  localStorage.setItem("qf_cart", JSON.stringify(merged));
  window.dispatchEvent(new StorageEvent("storage", { key: "qf_cart", newValue: JSON.stringify(merged) }));

  return merged;
}

/**
 * On logout: save the current cart to backend, then wipe it from localStorage.
 * Returns the now-empty cart so callers can update their state.
 */
export async function saveAndClearCart(token: string, cart: Cart): Promise<Cart> {
  await saveCartToBackend(token, cart);
  localStorage.setItem("qf_cart", JSON.stringify({}));
  window.dispatchEvent(new StorageEvent("storage", { key: "qf_cart", newValue: JSON.stringify({}) }));
  return {};
}
