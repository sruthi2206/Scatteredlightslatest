import nodemailer from 'nodemailer';

async function testSecuredSMTP() {
  console.log('Testing SMTP with secured connection and authentication...');
  
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // Use secured connection
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    debug: true,
    logger: true
  };
  
  console.log('SMTP Configuration:');
  console.log(`Host: ${config.host}:${config.port}`);
  console.log(`Secured Connection: ${config.secure}`);
  console.log(`Username: ${config.auth.user}`);
  console.log(`Password: ${config.auth.pass ? 'SET' : 'NOT SET'}`);
  
  try {
    const transporter = nodemailer.createTransport(config);
    
    console.log('\nTesting SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    console.log('\nSending test email to sruthi2206@gmail.com...');
    const result = await transporter.sendMail({
      from: `"Scattered Lights" <${config.auth.user}>`,
      to: 'sruthi2206@gmail.com',
      subject: 'SMTP Test - Secured Connection Working!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">✅ SMTP Configuration Successful!</h2>
          <p>Excellent! The email service is now working correctly with secured connection and authentication.</p>
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
            <h3>Working Configuration:</h3>
            <ul>
              <li><strong>Server:</strong> ${config.host}:${config.port}</li>
              <li><strong>Secured Connection:</strong> ${config.secure}</li>
              <li><strong>Authentication:</strong> Enabled</li>
              <li><strong>Username:</strong> ${config.auth.user}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          <p>Password reset emails and welcome emails will now work properly in the Scattered Lights application!</p>
          <p>You can now test the password reset functionality from the login page.</p>
        </div>
      `,
      text: `SMTP Configuration Successful!

The email service is now working correctly with secured connection and authentication.

Working Configuration:
- Server: ${config.host}:${config.port}
- Secured Connection: ${config.secure}
- Authentication: Enabled
- Username: ${config.auth.user}
- Timestamp: ${new Date().toISOString()}

Password reset emails and welcome emails will now work properly in the Scattered Lights application!`
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    
  } catch (error) {
    console.error('❌ SMTP test failed:');
    console.error('Error:', error);
  }
}

testSecuredSMTP().catch(console.error);