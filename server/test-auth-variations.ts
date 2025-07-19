import nodemailer from 'nodemailer';

async function testDifferentAuthMethods() {
  console.log('Testing different authentication methods...');
  
  const baseConfig = {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // Use STARTTLS
    connectionTimeout: 30000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    debug: false, // Reduce debug output
    logger: false
  };
  
  const authVariations = [
    {
      name: 'Current credentials (admin@storyweb.in)',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      }
    },
    {
      name: 'Just email domain (storyweb.in)',
      auth: {
        user: process.env.EMAIL_USERNAME?.replace('@storyweb.in', ''),
        pass: process.env.EMAIL_PASSWORD,
      }
    },
    {
      name: 'Alternative email format',
      auth: {
        user: 'admin',
        pass: process.env.EMAIL_PASSWORD,
      }
    }
  ];
  
  for (const variation of authVariations) {
    console.log(`\n🔍 Testing: ${variation.name}`);
    console.log(`   Username: ${variation.auth.user}`);
    console.log(`   Password: ${variation.auth.pass ? 'SET' : 'NOT SET'}`);
    
    try {
      const transporter = nodemailer.createTransport({
        ...baseConfig,
        auth: variation.auth,
        tls: {
          rejectUnauthorized: false,
        }
      });
      
      await transporter.verify();
      console.log(`   ✅ SUCCESS: Authentication worked!`);
      
      // Try to send test email
      console.log(`   📧 Sending test email to sruthi2206@gmail.com...`);
      
      const result = await transporter.sendMail({
        from: `"Scattered Lights Test" <${variation.auth.user}@storyweb.in>`,
        to: 'sruthi2206@gmail.com',
        subject: 'SMTP Test - Scattered Lights',
        html: `
          <h2>SMTP Test Successful!</h2>
          <p>This email was sent using:</p>
          <ul>
            <li><strong>Method:</strong> ${variation.name}</li>
            <li><strong>Username:</strong> ${variation.auth.user}</li>
            <li><strong>Server:</strong> ${baseConfig.host}:${baseConfig.port}</li>
            <li><strong>Time:</strong> ${new Date().toISOString()}</li>
          </ul>
          <p>Email service is now working correctly!</p>
        `,
        text: `SMTP Test Successful!\n\nMethod: ${variation.name}\nUsername: ${variation.auth.user}\nServer: ${baseConfig.host}:${baseConfig.port}\nTime: ${new Date().toISOString()}\n\nEmail service is now working correctly!`
      });
      
      console.log(`   ✅ EMAIL SENT: ${result.messageId}`);
      console.log(`   🎉 WORKING CONFIGURATION FOUND!`);
      break; // Stop testing once we find a working configuration
      
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }
  }
  
  console.log('\nAuthentication testing completed.');
}

testDifferentAuthMethods().catch(console.error);