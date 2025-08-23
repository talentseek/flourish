const { Webhook } = require('svix');
const crypto = require('crypto');

// Simulate a webhook payload
const mockPayload = {
  type: 'user.created',
  data: {
    id: 'user_test_123',
    email_addresses: [
      {
        email_address: 'test@example.com',
        id: 'email_test_123'
      }
    ],
    public_metadata: {
      role: 'USER'
    }
  }
};

// Create a mock webhook secret
const webhookSecret = 'whsec_test_secret';

// Create webhook instance
const wh = new Webhook(webhookSecret);

// Generate signature
const payload = JSON.stringify(mockPayload);
const timestamp = Math.floor(Date.now() / 1000);
const svix_id = crypto.randomUUID();

const signature = wh.sign(payload, {
  'svix-id': svix_id,
  'svix-timestamp': timestamp.toString(),
});

console.log('Mock webhook payload:');
console.log('Payload:', payload);
console.log('Headers:');
console.log('  svix-id:', svix_id);
console.log('  svix-timestamp:', timestamp);
console.log('  svix-signature:', signature);

console.log('\nTo test locally, you can:');
console.log('1. Use this payload in a tool like Postman');
console.log('2. Send POST request to: http://localhost:3000/api/clerk/webhook');
console.log('3. Include the headers above');
