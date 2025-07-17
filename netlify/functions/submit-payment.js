const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'azkabloch786@gmail.com',
      pass: process.env.GMAIL_PASS || 'your-app-password' // Use app-specific password
    }
  });
};

exports.handler = async (event, _context) => {
  // eslint-disable-next-line no-unused-vars
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Parse the form data
    const formData = JSON.parse(event.body);
    
    const {
      senderName,
      senderEmail,
      senderPhone,
      paymentMethod,
      transactionId,
      additionalNotes,
      // paymentScreenshot // This would be base64 encoded in a real implementation
    } = formData;

    // Validate required fields
    if (!senderName || !senderEmail || !senderPhone || !paymentMethod || !transactionId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Create email transporter
    const transporter = createTransporter();

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8b5cf6; text-align: center; margin-bottom: 30px;">
          🎓 New PRO Purchase Request - ECC Educational Platform
        </h2>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #334155; margin-bottom: 15px;">Payment Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Sender Name:</td>
              <td style="padding: 8px 0; color: #64748b;">${senderName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td>
              <td style="padding: 8px 0; color: #64748b;">${senderEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Phone:</td>
              <td style="padding: 8px 0; color: #64748b;">${senderPhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Payment Method:</td>
              <td style="padding: 8px 0; color: #64748b;">${paymentMethod === 'meezan_bank' ? 'Meezan Bank' : 'JazzCash'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Transaction ID:</td>
              <td style="padding: 8px 0; color: #64748b;">${transactionId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Amount:</td>
              <td style="padding: 8px 0; color: #16a34a; font-weight: bold;">219 PKR</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Submitted:</td>
              <td style="padding: 8px 0; color: #64748b;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
        </div>

        ${additionalNotes ? `
          <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #92400e; margin-bottom: 10px;">Additional Notes:</h4>
            <p style="color: #92400e; margin: 0;">${additionalNotes}</p>
          </div>
        ` : ''}

        <div style="background: #dcfce7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h4 style="color: #166534; margin-bottom: 10px;">Next Steps:</h4>
          <ol style="color: #166534; margin: 0;">
            <li>Verify the payment details with the bank/payment service</li>
            <li>Activate PRO access for the user: ${senderEmail}</li>
            <li>Send confirmation email to the user</li>
            <li>Update user count in the system</li>
          </ol>
        </div>

        <div style="background: #dbeafe; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <h4 style="color: #1e40af; margin-bottom: 10px;">Trial System Integration:</h4>
          <p style="color: #1e40af; margin: 0;">
            This user's trial system will automatically handle PRO activation once payment is approved.
            Use the userTierManager.activatePROAfterPayment() method to complete the process.
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px;">
          <p style="color: #64748b; margin: 0;">
            <strong>Contact Information:</strong><br>
            📧 Email: azkabloch786@gmail.com<br>
            📱 WhatsApp: +923707874867
          </p>
        </div>
      </div>
    `;

    // Email options
    const mailOptions = {
      from: `"ECC Payment System" <${process.env.GMAIL_USER || 'azkabloch786@gmail.com'}>`,
      to: 'azkabloch786@gmail.com',
      subject: `🎓 New PRO Purchase Request - ${senderName}`,
      html: emailHtml,
      // In a real implementation, you would attach the payment screenshot here
      // attachments: paymentScreenshot ? [{ filename: 'payment-screenshot.jpg', content: paymentScreenshot }] : []
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send confirmation email to user
    const userMailOptions = {
      from: `"ECC Educational Platform" <${process.env.GMAIL_USER || 'azkabloch786@gmail.com'}>`,
      to: senderEmail,
      subject: '🎓 PRO Purchase Request Received - ECC Educational Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #8b5cf6; text-align: center; margin-bottom: 30px;">
            🎓 PRO Purchase Request Received
          </h2>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #334155; margin-bottom: 15px;">Dear ${senderName},</p>
            
            <p style="color: #475569; line-height: 1.6;">
              Thank you for your interest in upgrading to our PRO learning experience! We have received your payment details and are currently processing your request.
            </p>
            
            <div style="background: #dcfce7; border-radius: 6px; padding: 15px; margin: 15px 0;">
              <h4 style="color: #166534; margin-bottom: 10px;">Payment Details Received:</h4>
              <ul style="color: #166534; margin: 0;">
                <li>Transaction ID: ${transactionId}</li>
                <li>Payment Method: ${paymentMethod === 'meezan_bank' ? 'Meezan Bank' : 'JazzCash'}</li>
                <li>Amount: 219 PKR</li>
              </ul>
            </div>
            
            <p style="color: #475569; line-height: 1.6;">
              <strong>What happens next:</strong><br>
              • We will verify your payment within 24 hours<br>
              • Once verified, your PRO access will be activated<br>
              • You will receive a confirmation email with activation details
            </p>
            
            <div style="background: #fef3c7; border-radius: 6px; padding: 15px; margin: 15px 0;">
              <p style="color: #92400e; margin: 0;">
                <strong>Need Help?</strong><br>
                If you don't receive an update within 24 hours, please contact us:<br>
                📧 azkabloch786@gmail.com<br>
                📱 +923707874867 (WhatsApp)
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px;">
            <p style="color: #64748b; margin: 0;">
              Thank you for choosing ECC Educational Platform!<br>
              We're excited to enhance your learning experience.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(userMailOptions);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Payment details submitted successfully' 
      })
    };

  } catch (error) {
    console.error('Email sending error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: 'Failed to submit payment details',
        details: error.message 
      })
    };
  }
};
