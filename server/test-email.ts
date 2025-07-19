import { emailService } from './services/emailService';

async function testEmail() {
  console.log('Testing email service...');
  
  // Test connection first
  const connectionTest = await emailService.testConnection();
  console.log('Connection test result:', connectionTest);
  
  if (connectionTest) {
    console.log('Sending test password reset email...');
    const result = await emailService.sendPasswordResetEmail(
      'raamvishnu1@gmail.com',
      'test-token-12345',
      'TestUser'
    );
    console.log('Email send result:', result);
  }
}

testEmail().catch(console.error);