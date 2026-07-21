// netlify/functions/admin-verify.cjs
const { verifyAdmin } = require('./_utils/admin-utils.cjs');

exports.handler = async (event) => {
  console.log('🔐 Admin verify invoked');
  
  try {
    // Verify the admin token from the request cookies
    const auth = verifyAdmin(event);
    
    if (!auth.valid) {
      console.warn('❌ Admin verification failed:', auth.error);
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          error: auth.error || 'Unauthorized',
          valid: false,
        }),
      };
    }

    console.log('✅ Admin verified successfully:', auth.decoded?.role || 'admin');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        valid: true,
        role: auth.decoded?.role || 'admin',
      }),
    };
  } catch (err) {
    console.error('🔥 Admin verify error:', err.message);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        valid: false,
      }),
    };
  }
};