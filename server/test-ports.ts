import nodemailer from 'nodemailer';

async function testDifferentPorts() {
  console.log('Testing different SMTP ports and configurations...');
  
  const username = process.env.EMAIL_USERNAME;
  const password = process.env.EMAIL_PASSWORD;
  
  const configurations = [
    {
      name: 'Port 25 (Standard SMTP)',
      host: 'email.storyweb.in',
      port: 25,
      secure: false,
      requireTLS: false,
      auth: { user: username, pass: password }
    },
    {
      name: 'Port 587 with STARTTLS (Current)',
      host: 'email.storyweb.in', 
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: username, pass: password }
    },
    {
      name: 'Port 465 (SSL)',
      host: 'email.storyweb.in',
      port: 465,
      secure: true,
      auth: { user: username, pass: password }
    },
    {
      name: 'Port 2525 (Alternative)',
      host: 'email.storyweb.in',
      port: 2525,
      secure: false,
      requireTLS: true,
      auth: { user: username, pass: password }
    }
  ];
  
  for (const config of configurations) {
    console.log(`\n🔍 Testing: ${config.name}`);
    console.log(`   Server: ${config.host}:${config.port}`);
    console.log(`   Secure: ${config.secure}`);
    console.log(`   Username: ${config.auth.user}`);
    
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        requireTLS: config.requireTLS,
        auth: config.auth,
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 20000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        debug: false,
        logger: false
      });
      
      console.log(`   🔌 Testing connection...`);
      await transporter.verify();
      console.log(`   ✅ CONNECTION SUCCESS!`);
      
      console.log(`   📧 Sending test email...`);
      const result = await transporter.sendMail({
        from: `"Scattered Lights" <${config.auth.user}>`,
        to: 'sruthi2206@gmail.com',
        subject: `SMTP Test Success - ${config.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎉 SMTP Configuration Working!</h2>
            <p>Great news! The email service is now working correctly.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>Working Configuration:</h3>
              <ul>
                <li><strong>Method:</strong> ${config.name}</li>
                <li><strong>Server:</strong> ${config.host}:${config.port}</li>
                <li><strong>Secure:</strong> ${config.secure}</li>
                <li><strong>Username:</strong> ${config.auth.user}</li>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
              </ul>
            </div>
            <p>The password reset emails and welcome emails will now work properly in the Scattered Lights application!</p>
          </div>
        `
      });
      
      console.log(`   ✅ EMAIL SENT SUCCESSFULLY!`);
      console.log(`   📬 Message ID: ${result.messageId}`);
      console.log(`   🎉 WORKING CONFIGURATION FOUND!`);
      
      // Save working configuration for use in the app
      console.log(`\n📝 Working SMTP Configuration:`);
      console.log(`   HOST: ${config.host}`);
      console.log(`   PORT: ${config.port}`);
      console.log(`   SECURE: ${config.secure}`);
      console.log(`   REQUIRE_TLS: ${config.requireTLS || false}`);
      
      return; // Stop testing once we find a working config
      
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
      if (error.code === 'EAUTH') {
        console.log(`   🔐 Authentication issue - check credentials`);
      } else if (error.code === 'ETIMEDOUT') {
        console.log(`   ⏰ Connection timeout - server may not support this port`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   🚫 Connection refused - port may be closed`);
      }
    }
  }
  
  console.log('\n❌ No working SMTP configuration found.');
  console.log('Please verify your email credentials and server settings.');
}

testDifferentPorts().catch(console.error);