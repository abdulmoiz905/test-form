// netlify/functions/follow-up.js
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, email, phone = '', message = '' } = data;

    if (!name || !email) {
      return { statusCode: 400, body: 'Name and email are required' };
    }

    // 🔑 Get API key
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('❌ Missing RESEND_API_KEY in environment variables');
      return { statusCode: 500, body: 'Email service not configured' };
    }

    // 📨 Prepare email
    const from = 'ali.prystech@gmail.com'; // must be verified in Resend
    const to = email;
    const subject = 'Still Interested in Working Together?';
    const html = `
      <p>Hi ${name},</p>
      <p>Thanks for reaching out to Prystech! We noticed you explored booking a call but didn’t complete it.</p>
      <p><strong>Phone:</strong> ${phone || '—'}<br>
      <strong>Message:</strong> ${message || '—'}</p>
      <p>👉 Feel free to <a href="https://calendly.com/ali-prystech/book-a-meeting-prystech">schedule a call</a> anytime!</p>
      <p>Best,<br>The Prystech Team</p>
    `;

    // ✅ NO TRAILING SPACES
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ from, to, subject, html })
    });

    const result = await response.json();
    console.log('📤 Resend response:', result);

    if (response.ok) {
      return { statusCode: 200, body: 'Email sent' };
    } else {
      console.error('❌ Resend failed:', result);
      return { statusCode: 500, body: 'Failed to send email' };
    }

  } catch (error) {
    console.error('💥 Function error:', error.message, error.stack);
    return { statusCode: 500, body: 'Internal error' };
  }
};