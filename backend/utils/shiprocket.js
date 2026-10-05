/*
  Thin client for the Shiprocket API.
  Docs: https://apidocs.shiprocket.in/
  Auth tokens are valid for ~10 days; we cache in memory and refresh on 401.
*/
const BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

let cachedToken = null;
let cachedTokenAt = 0;
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // refresh a day early

async function login() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new Error('Shiprocket credentials are not configured');
  }

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(data.message || 'Shiprocket login failed');
  }
  cachedToken = data.token;
  cachedTokenAt = Date.now();
  return cachedToken;
}

async function getToken() {
  if (cachedToken && Date.now() - cachedTokenAt < TOKEN_TTL_MS) return cachedToken;
  return login();
}

async function request(path, { method = 'GET', body, retry = true } = {}) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && retry) {
    cachedToken = null;
    return request(path, { method, body, retry: false });
  }
  if (!res.ok) {
    throw new Error(data.message || `Shiprocket request failed (${res.status})`);
  }
  return data;
}

/* Build the payload Shiprocket expects from one of our Order documents. */
function buildOrderPayload(order) {
  const [firstName, ...rest] = (order.user?.name || 'Customer').trim().split(' ');
  return {
    order_id: order.orderId,
    order_date: new Date(order.createdAt || Date.now()).toISOString().slice(0, 19).replace('T', ' '),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    billing_customer_name: firstName,
    billing_last_name: rest.join(' ') || firstName,
    billing_address: order.shipping?.line1 || '',
    billing_address_2: order.shipping?.line2 || '',
    billing_city: order.shipping?.city || '',
    billing_pincode: order.shipping?.pincode || '',
    billing_state: order.shipping?.state || '',
    billing_country: 'India',
    billing_email: order.user?.email || '',
    billing_phone: order.user?.phone || '',
    shipping_is_billing: true,
    order_items: (order.items || []).map((item) => ({
      name: item.name,
      sku: item.productId ? String(item.productId) : item.name,
      units: item.qty,
      selling_price: item.price,
    })),
    payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    sub_total: order.subtotal,
    length: Number(process.env.SHIPROCKET_DEFAULT_LENGTH_CM || 10),
    breadth: Number(process.env.SHIPROCKET_DEFAULT_BREADTH_CM || 10),
    height: Number(process.env.SHIPROCKET_DEFAULT_HEIGHT_CM || 10),
    weight: Number(process.env.SHIPROCKET_DEFAULT_WEIGHT_KG || 0.5),
  };
}

/* Create (or re-push) a Shiprocket order/shipment for one of our orders. */
async function createShipment(order) {
  return request('/orders/create/adhoc', { method: 'POST', body: buildOrderPayload(order) });
}

/* Fetch live tracking info for an AWB code. */
async function trackByAwb(awbCode) {
  return request(`/courier/track/awb/${encodeURIComponent(awbCode)}`);
}

/* Fetch live tracking info by Shiprocket's own order id. */
async function trackByShipmentId(shipmentId) {
  return request(`/courier/track/shipment/${encodeURIComponent(shipmentId)}`);
}

module.exports = { createShipment, trackByAwb, trackByShipmentId };
