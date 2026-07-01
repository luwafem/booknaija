// scripts/validate-env.js
import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env file
const envPath = join(process.cwd(), '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
}

// ─── CONFIGURATION ───
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'PAYSTACK_SECRET_KEY',
  'JWT_SECRET',
];

const optionalVars = [
  'VITE_SENTRY_DSN',
  'VITE_SENTRY_ENABLED',
  'VITE_ENVIRONMENT',
  'SITE_URL',
  'GOOGLE_CLIENT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
];

// ─── VALIDATION ───
const missingRequired = requiredVars.filter(key => !process.env[key]);
const missingOptional = optionalVars.filter(key => !process.env[key]);

let hasError = false;

// Check required variables
if (missingRequired.length > 0) {
  console.error('❌ Missing REQUIRED environment variables:');
  missingRequired.forEach(key => console.error(`  - ${key}`));
  console.error('');
  console.error('These variables are essential for the application to function.');
  console.error('Please add them to your .env file or Netlify environment variables.');
  hasError = true;
} else {
  console.log('✅ All required environment variables are set.');
}

// Warn about optional variables
if (missingOptional.length > 0) {
  console.log('');
  console.log('⚠️ Optional environment variables not set (will use defaults):');
  missingOptional.forEach(key => console.log(`  - ${key}`));
}

// Check for .env file
if (!existsSync(envPath)) {
  console.log('');
  console.log('ℹ️ No .env file found. Create one from .env.example if available.');
}

// Exit with error if required vars are missing
if (hasError) {
  process.exit(1);
}

// ─── SUMMARY ───
console.log('');
console.log('📋 Environment summary:');
console.log(`  Environment: ${process.env.VITE_ENVIRONMENT || 'development'}`);
console.log(`  Supabase URL: ${process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
console.log(`  Sentry: ${process.env.VITE_SENTRY_DSN ? '✅ Enabled' : '⏸️ Disabled'}`);
console.log(`  Paystack: ${process.env.PAYSTACK_SECRET_KEY ? '✅ Set' : '❌ Missing'}`);

console.log('');
console.log('✅ Validation complete.');