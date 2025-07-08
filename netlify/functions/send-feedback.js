const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  const { email, message } = JSON.parse(event.body || '{}');

  if (!message) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Message is required.' }),
    };
  }

  try {
    // Transporter using Gmail SMTP (RECOMMENDED: Use SendGrid or Mailgun for production)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'azkabloch786@gmail.com',
        pass: process.env.FEEDBACK_APP_PASSWORD, // Set this in Netlify env vars
      },
    });

    await transporter.sendMail({
      from: email,
      to: 'azkabloch786@gmail.com',
      subject: 'ECC App - User Feedback',
      text: message,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("Email send error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send feedback email' }),
    };
  }
};
