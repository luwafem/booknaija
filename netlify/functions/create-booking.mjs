import { google } from 'googleapis';

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { slug, reference, calendarId } = body;
    
    console.log('📥 Received:', { slug, reference, calendarId });

    // ✅ Validate required fields
    if (!reference) {
      console.error('❌ Missing reference');
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing payment reference' }) };
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error('❌ PAYSTACK_SECRET_KEY not set');
      return { statusCode: 400, body: JSON.stringify({ error: 'Payment not configured' }) };
    }

    console.log('🔑 Verifying reference:', reference);
    
    const verify = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    
    const vd = await verify.json();
    console.log('💳 Paystack response:', JSON.stringify(vd));

    if (!vd.status) {
      console.error('❌ Paystack API error:', vd.message);
      return { statusCode: 400, body: JSON.stringify({ error: `Paystack error: ${vd.message}` }) };
    }

    if (vd.data.status !== 'success') {
      console.error('❌ Payment not successful:', vd.data.status);
      return { statusCode: 400, body: JSON.stringify({ error: `Payment status: ${vd.data.status}` }) };
    }

    const m = vd.data.metadata || {};
    const isProduct = m.type === 'product';

    console.log('📦 Metadata:', JSON.stringify(m));

    if (!isProduct) {
      const date = m.date;
      const time = m.time;
      
      if (!date || !time) {
        console.error('❌ Missing date/time in metadata');
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing booking date/time' }) };
      }

      const [h, min] = time.split(':').map(Number);
      const endMin = h * 60 + min + 60; 
      const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

      const googleClientEmail = process.env.GOOGLE_CLIENT_EMAIL;
      let privateKey = process.env.GOOGLE_PRIVATE_KEY;

      if (privateKey) {
        privateKey = privateKey.replace(/^"|"$/g, '');
        privateKey = privateKey.replace(/\\n/g, '\n');
        
        if (!privateKey.includes('-----BEGIN PRIVATE KEY-----\n')) {
          privateKey = privateKey.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n');
        }
        if (!privateKey.includes('\n-----END PRIVATE KEY-----')) {
          privateKey = privateKey.replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
        }
      }

      if (googleClientEmail && privateKey && calendarId) {
        try {
          const auth = new google.auth.GoogleAuth({
            credentials: { client_email: googleClientEmail, private_key: privateKey },
            scopes: ['https://www.googleapis.com/auth/calendar.events'],
          });
          
          const calendar = google.calendar({ version: 'v3', auth });
          const serviceName = m.serviceName || m.serviceId || 'Booking';
          
          await calendar.events.insert({
            calendarId: calendarId, 
            requestBody: {
              summary: `${serviceName} — ${m.customerName || 'Client'}`,
              description: `Phone: ${m.customerPhone}\nEmail: ${vd.data.customer.email}\nRef: ${reference}`,
              start: { dateTime: `${date}T${time}:00`, timeZone: 'Africa/Lagos' },
              end: { dateTime: `${date}T${endTime}:00`, timeZone: 'Africa/Lagos' },
            },
          });
          console.log('📅 Calendar event created');
        } catch (calErr) {
          console.error('⚠️ Calendar error (non-fatal):', calErr.message);
          // Don't fail the whole booking if calendar fails
        }
      }
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        success: true, 
        booking: {
          date: m.date,
          time: m.time,
          serviceName: m.serviceName || m.serviceId,
          type: m.type || 'service',
          amount: vd.data.amount,
          email: vd.data.customer.email,
        } 
      }) 
    };
  } catch (err) {
    console.error("🔥 Booking error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};