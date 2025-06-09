// Generate NEXTAUTH_SECRET
const crypto = require('crypto');

console.log('🔑 Generated NEXTAUTH_SECRET:');
console.log(crypto.randomBytes(32).toString('hex'));
console.log('\n📝 Copy this value to your Vercel environment variables');
