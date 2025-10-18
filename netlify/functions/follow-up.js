// netlify/functions/follow-up.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, phone, message } = JSON.parse(event.body);

    // Validate required fields
    if (!email || !name) {
      return { statusCode: 400, body: 'Name and email required' };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is missing');
      return { statusCode: 500, body: 'Email service not configured' };
    }

    const from = "ali.prystech@gmail.com"; // ← verify this domain in Resend!
    const subject = "Still Interested in Working Together?";
    const html = `
      <p>Hi ${name},</p>
      <p>Thanks for reaching out to Prystech! We noticed you explored booking a call but didn’t complete it.</p>
      <p>We’d still love to hear about your project:</p>
      <ul>
        <li><strong>Phone:</strong> ${phone || '—'}</li>
        <li><strong>Message:</strong> ${message || '—'}</li>
      </ul>
      <p>👉 Feel free to <a href="https://calendly.com/ali-prystech/book-a-meeting-prystech">schedule a call</a> anytime!</p>
      <p>Best,<br>The Prystech Team</p>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ from, to: email, subject, html })
    });

    if (response.ok) {
      return { statusCode: 200, body: 'Follow-up email queued' };
    } else {
      const errText = await response.text();
      console.error('Resend error:', errText);
      return { statusCode: 500, body: 'Failed to send email' };
    }

  } catch (error) {
    console.error('Function error:', error);
    return { statusCode: 500, body: 'Internal error' };
  }
};