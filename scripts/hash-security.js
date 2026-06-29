// scripts/hash-security.js
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log('🔍 Fetching businesses with plaintext security data...');
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, security_code, security_answer_1, security_answer_2')
    .or('security_code.not.is.null,security_answer_1.not.is.null,security_answer_2.not.is.null');

  if (error) {
    console.error('❌ Error fetching businesses:', error.message);
    process.exit(1);
  }

  console.log(`📦 Found ${businesses.length} businesses to process.`);
  let updated = 0;

  for (const biz of businesses) {
    const updates = {};
    if (biz.security_code) {
      updates.security_code_hash = bcrypt.hashSync(biz.security_code, 10);
      updates.security_code = null; // clear plaintext (optional)
    }
    if (biz.security_answer_1) {
      updates.security_answer_1_hash = bcrypt.hashSync(biz.security_answer_1.toLowerCase().trim(), 10);
      updates.security_answer_1 = null;
    }
    if (biz.security_answer_2) {
      updates.security_answer_2_hash = bcrypt.hashSync(biz.security_answer_2.toLowerCase().trim(), 10);
      updates.security_answer_2 = null;
    }

    if (Object.keys(updates).length) {
      const { error: updateErr } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', biz.id);

      if (updateErr) {
        console.error(`❌ Failed to update business ${biz.id}:`, updateErr.message);
      } else {
        updated++;
        console.log(`✅ Updated business ${biz.id}`);
      }
    }
  }

  console.log(`✅ Migration complete! ${updated} businesses updated.`);
}

migrate();