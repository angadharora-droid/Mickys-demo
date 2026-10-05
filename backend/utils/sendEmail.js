const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  // Render's network can't route Gmail's IPv6 SMTP address (causes ENETUNREACH) — force IPv4.
  family: 4,
});

const sendOrderConfirmation = async (order) => {
  const itemRows = order.items.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${(i.price*i.qty).toLocaleString('en-IN')}</td>
    </tr>`
  ).join('');

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff">
      <div style="background:#6f0e13;padding:24px;text-align:center">
        <h1 style="color:#f1c53e;font-size:28px;margin:0">Micky's</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Restaurant-Style Indian Flavours</p>
      </div>
      <div style="padding:32px">
        <h2 style="color:#220a0b;margin:0 0 8px">Order Confirmed! 🎉</h2>
        <p style="color:#7a4a4e">Hi ${order.user.name}, your order has been placed successfully.</p>
        <div style="background:#fdf9ee;border-radius:12px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:13px;color:#7a4a4e">Order ID</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#6f0e13">${order.orderId}</p>
        </div>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:#fdf9ee">
            <th style="padding:10px 8px;text-align:left;font-size:13px;color:#7a4a4e">Product</th>
            <th style="padding:10px 8px;text-align:center;font-size:13px;color:#7a4a4e">Qty</th>
            <th style="padding:10px 8px;text-align:right;font-size:13px;color:#7a4a4e">Price</th>
          </tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="text-align:right;margin-top:16px;padding-top:16px;border-top:2px solid #6f0e13">
          <p style="margin:0;font-size:20px;font-weight:700;color:#6f0e13">Total: ₹${order.total.toLocaleString('en-IN')}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#7a4a4e">Payment: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</p>
        </div>
        <div style="background:#fdf3d0;border-radius:12px;padding:16px;margin:24px 0">
          <p style="margin:0;font-size:13px;font-weight:600;color:#220a0b">Shipping to:</p>
          <p style="margin:4px 0 0;font-size:13px;color:#7a4a4e">${order.shipping.line1}, ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pincode}</p>
        </div>
        <p style="color:#7a4a4e;font-size:13px">We'll notify you when your order ships. Expected delivery: 3-5 business days.</p>
      </div>
      <div style="background:#220a0b;padding:20px;text-align:center">
        <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0">© ${new Date().getFullYear()} Micky's Foods. Nagpur, Maharashtra.</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from: `"Micky's Foods" <${process.env.EMAIL_USER}>`,
    to:   order.user.email,
    subject: `Order Confirmed — ${order.orderId} | Micky's Foods`,
    html,
  });
};

const sendStatusUpdate = async (order) => {
  const statusMap = {
    confirmed:  { emoji: '✅', text: 'confirmed and being prepared' },
    processing: { emoji: '🔄', text: 'being processed' },
    shipped:    { emoji: '🚚', text: 'on its way to you' },
    delivered:  { emoji: '🎉', text: 'delivered' },
    cancelled:  { emoji: '❌', text: 'cancelled' },
  };
  const s = statusMap[order.orderStatus] || { emoji: '📦', text: 'updated' };

  await transporter.sendMail({
    from: `"Micky's Foods" <${process.env.EMAIL_USER}>`,
    to:   order.user.email,
    subject: `Order ${order.orderId} — ${s.emoji} ${order.orderStatus.charAt(0).toUpperCase()+order.orderStatus.slice(1)}`,
    html: `<div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:32px;text-align:center">
      <h1 style="color:#6f0e13">Micky's</h1>
      <p style="font-size:48px">${s.emoji}</p>
      <h2>Your order is ${s.text}!</h2>
      <p style="color:#7a4a4e">Order ID: <strong>${order.orderId}</strong></p>
      ${order.trackingNumber ? `<p style="color:#7a4a4e">Tracking: <strong>${order.trackingNumber}</strong></p>` : ''}
    </div>`,
  });
};

module.exports = { sendOrderConfirmation, sendStatusUpdate };
