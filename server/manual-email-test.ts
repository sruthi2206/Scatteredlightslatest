import nodemailer from 'nodemailer';

async function testManualEmail() {
  console.log('Starting manual email test...');
  
  // Get environment variables
  const config = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    username: process.env.EMAIL_USERNAME,
    password: process.env.EMAIL_PASSWORD,
    tlsRejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false'
  };
  
  console.log('Email configuration:');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`Secure: ${config.secure}`);
  console.log(`Username: ${config.username}`);
  console.log(`Password: ${config.password ? 'SET' : 'NOT SET'}`);
  console.log(`TLS Reject Unauthorized: ${config.tlsRejectUnauthorized}`);
  
  // Create transporter with detailed configuration
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.username,
      pass: config.password,
    },
    tls: {
      rejectUnauthorized: config.tlsRejectUnauthorized,
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds  
    socketTimeout: 60000,     // 60 seconds
    debug: true,              // Enable debug output
    logger: true              // Enable logging
  });
  
  console.log('\nTesting SMTP connection...');
  
  try {
    // Test connection
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');
    
    // Send test email
    console.log('\nSending test email to sruthi2206@gmail.com...');
    
    const mailOptions = {
      from: `"Scattered Lights Test" <${config.username}>`,
      to: 'sruthi2206@gmail.com',
      subject: 'Test Email from Scattered Lights',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Test Email from Scattered Lights</h2>
          <p>This is a test email to verify that the SMTP configuration is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Server:</strong> ${config.host}:${config.port}</p>
          <p>If you receive this email, the SMTP service is functioning properly!</p>
        </div>
      `,
      text: `Test Email from Scattered Lights

This is a test email to verify that the SMTP configuration is working correctly.

Timestamp: ${new Date().toISOString()}
Server: ${config.host}:${config.port}

If you receive this email, the SMTP service is functioning properly!`
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Response:', result.response);
    
  } catch (error) {
    console.error('❌ SMTP test failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
  
  console.log('\nManual email test completed.');
}

// Run the test
testManualEmail().catch(console.error);