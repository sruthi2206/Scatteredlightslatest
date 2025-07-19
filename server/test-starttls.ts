import nodemailer from 'nodemailer';

async function testSTARTTLS() {
  console.log('Testing SMTP with STARTTLS (secured connection)...');
  
  // Test different secure configurations
  const configs = [
    {
      name: 'STARTTLS on port 587 (secured=false, requireTLS=true)',
      host: process.env.EMAIL_HOST,
      port: 587,
      secure: false, // false for STARTTLS
      requireTLS: true, // but require TLS upgrade
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      }
    },
    {
      name: 'SSL on port 465 (secured=true)',
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true, // true for SSL
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      }
    }
  ];
  
  for (const config of configs) {
    console.log(`\n🔍 Testing: ${config.name}`);
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Secure: ${config.secure}`);
    console.log(`   RequireTLS: ${config.requireTLS || 'not set'}`);
    
    try {
      const transporter = nodemailer.createTransport({
        ...config,
        connectionTimeout: 30000,
        greetingTimeout: 15000,
        socketTimeout: 30000,
        debug: false,
        logger: false
      });
      
      console.log('   🔌 Testing connection...');
      await transporter.verify();
      console.log('   ✅ CONNECTION SUCCESS!');
      
      console.log('   📧 Sending test email to sruthi2206@gmail.com...');
      const result = await transporter.sendMail({
        from: `"Scattered Lights" <${config.auth.user}>`,
        to: 'sruthi2206@gmail.com',
        subject: 'SMTP Working - Scattered Lights',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">🎉 Email Service Working!</h2>
            <p>Great news! The SMTP configuration is now working correctly.</p>
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0;">
              <h3>Working Configuration:</h3>
              <ul>
                <li><strong>Method:</strong> ${config.name}</li>
                <li><strong>Server:</strong> ${config.host}:${config.port}</li>
                <li><strong>Secured:</strong> ${config.secure}</li>
                <li><strong>RequireTLS:</strong> ${config.requireTLS || 'false'}</li>
                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            <p>Password reset emails and welcome emails will now work in the Scattered Lights application.</p>
            <p><strong>Test this now:</strong> Go to the login page and click "Forgot Password" to test the reset flow!</p>
          </div>
        `
      });
      
      console.log('   ✅ EMAIL SENT SUCCESSFULLY!');
      console.log(`   📬 Message ID: ${result.messageId}`);
      console.log('   🎉 WORKING CONFIGURATION FOUND!');
      
      return config; // Return working config
      
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }
  }
  
  return null;
}

testSTARTTLS().then((workingConfig) => {
  if (workingConfig) {
    console.log('\n✅ Email service is now working!');
    console.log('You can test password reset emails from the app.');
  } else {
    console.log('\n❌ No working configuration found.');
  }
}).catch(console.error);