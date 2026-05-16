const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { 
      affiliate_id, name, email, phone, subaccount_code,
      security_code, security_question_1, security_answer_1, 
      security_question_2, security_answer_2 
    } = JSON.parse(event.body);

    if (!affiliate_id || !subaccount_code || !security_code) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const { data, error } = await supabase
      .from('affiliates')
      .insert({
        id: affiliate_id,
        name: name,
        email: email,
        phone: phone,
        subaccount_code: subaccount_code,
        security_code: security_code,
        security_question_1: security_question_1,
        security_answer_1: (security_answer_1 || '').toLowerCase().trim(),
        security_question_2: security_question_2,
        security_answer_2: (security_answer_2 || '').toLowerCase().trim()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, id: data.id })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};