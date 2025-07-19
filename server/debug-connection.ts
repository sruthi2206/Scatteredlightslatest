import nodemailer from 'nodemailer';

async function debugSMTPConnection() {
  console.log('Final SMTP debugging - checking all possible configurations...');
  
  // Let's try to understand what "Use Secured Connection" and "Use authentication" means exactly
  const testConfigs = [
    {
      name: 'Port 587 STARTTLS (most common)',
      host: 'email.storyweb.in',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }
    },
    {
      name: 'Port 465 SSL',
      host: 'email.storyweb.in', 
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }
    },
    {
      name: 'Port 25 with STARTTLS',
      host: 'email.storyweb.in',
      port: 25,
      secure: false,
      requireTLS: true,
      auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }
    }
  ];
  
  for (const config of testConfigs) {
    console.log(`\nTesting ${config.name}...`);
    
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        requireTLS: config.requireTLS,
        auth: config.auth,
        tls: { rejectUnauthorized: false },
        connectionTimeout: 15000, // Shorter timeout
        greetingTimeout: 10000,
        socketTimeout: 15000,
        debug: false,
        logger: false
      });
      
      await transporter.verify();
      console.log(`SUCCESS: ${config.name} is working!`);
      
      // Send test email immediately
      const result = await transporter.sendMail({
        from: config.auth.user,
        to: 'sruthi2206@gmail.com',
        subject: 'SMTP Test Success',
        text: `Email working with ${config.name} at ${new Date().toISOString()}`
      });
      
      console.log(`Email sent with message ID: ${result.messageId}`);
      return config;
      
    } catch (error) {
      console.log(`FAILED: ${error.message}`);
    }
  }
  
  console.log('\nAll configurations failed. Possible issues:');
  console.log('1. SMTP server may be blocking Replit IP range');
  console.log('2. Credentials might be incorrect');
  console.log('3. Server might be down temporarily');
  console.log('4. Firewall/security settings blocking connections');
  
  return null;
}

// Run debug
debugSMTPConnection().catch(console.error);