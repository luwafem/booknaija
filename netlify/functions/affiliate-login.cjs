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
    const { email, securityCode, securityQuestion, securityAnswer } = JSON.parse(event.body);
    
    if (!email || !securityCode || !securityQuestion || !securityAnswer) {
      return { statusCode: 400, body: JSON.stringify({ error: 'All security fields are required' }) };
    }

    // Look up affiliate by email
    const { data: affiliate, error: affErr } = await supabase
      .from('affiliates')
      .select('id, security_code, security_question_1, security_answer_1, security_question_2, security_answer_2')
      .eq('email', email)
      .single();

    if (affErr || !affiliate) {
      return { statusCode: 404, body: JSON.stringify({ error: 'No affiliate account found with this email.' }) };
    }

    // 1. Verify 4-digit code
    if (affiliate.security_code !== securityCode) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid security code.' }) };
    }

    // 2. Verify Security Question & Answer
    const normalizedAnswer = securityAnswer.toLowerCase().trim();
    let isAnswerCorrect = false;

    if (affiliate.security_question_1 === securityQuestion && affiliate.security_answer_1 === normalizedAnswer) {
      isAnswerCorrect = true;
    } else if (affiliate.security_question_2 === securityQuestion && affiliate.security_answer_2 === normalizedAnswer) {
      isAnswerCorrect = true;
    }

    if (!isAnswerCorrect) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Incorrect security question or answer.' }) };
    }

    // Success - Return the affiliate ID
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        affiliateId: affiliate.id
      })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};