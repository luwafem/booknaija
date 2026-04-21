// MUST use 'import' because package.json has "type": "module"
import { google } from 'googleapis';

export const handler = async (event) => {
  try {
    const { slug, reference, calendarId } = JSON.parse(event.body);
    
    const envKey = `PAYSTACK_SECRET_${slug.replace(/-/g, '_').toUpperCase()}`;
    const secretKey = process.env[envKey];

    if (!secretKey) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid business' }) };

    const verify = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const vd = await verify.json();
    if (!vd.status || vd.data.status !== 'success')
      return { statusCode: 400, body: JSON.stringify({ error: 'Payment not verified' }) };

    const m = vd.data.metadata;
    const isProduct = m.type === 'product';

    // Only add to Google Calendar if it's a SERVICE
    if (!isProduct) {
      const date = m.date;
      const time = m.time;
      const [h, min] = (time || '10:00').split(':').map(Number);
      const endMin = h * 60 + min + 60; 
      const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

      const googleClientEmail = process.env.GOOGLE_CLIENT_EMAIL;
      
      // --- FIX IS HERE ---
      // 1. Get the raw string
      let rawKey = process.env.GOOGLE_PRIVATE_KEY;
      
      if (rawKey) {
        // 2. Replace literal "\n" (backslash-n) with real newlines
        rawKey = rawKey.replace(/\\n/g, '\n');
        
        // 3. Remove accidental quotes at the very start or very end
        rawKey = rawKey.replace(/^"|"$/g, '');
      }

      if (googleClientEmail && rawKey && calendarId) {
        const auth = new google.auth.GoogleAuth({
          credentials: { client_email: googleClientEmail, private_key: rawKey },
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
          type: m.type || 'service'
        } 
      }) 
    };
  } catch (err) {
    console.error("Booking error:", err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};