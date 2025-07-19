import net from 'net';

function testConnection(host, port, timeout = 5000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`✓ Connected to ${host}:${port}`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`✗ Connection to ${host}:${port} timed out`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`✗ Connection to ${host}:${port} failed:`, err.message);
      resolve(false);
    });
    
    console.log(`Testing connection to ${host}:${port}...`);
    socket.connect(port, host);
  });
}

async function runTests() {
  console.log('Testing SMTP server connectivity...\n');
  
  const servers = [
    { host: 'email.storyweb.in', port: 587 },
    { host: 'email.storyweb.in', port: 25 },
    { host: 'email.storyweb.in', port: 465 },
    { host: 'smtp.gmail.com', port: 587 }, // Test Gmail as alternative
  ];
  
  for (const server of servers) {
    await testConnection(server.host, server.port);
  }
}

runTests();