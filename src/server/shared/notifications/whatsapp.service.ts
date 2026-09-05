import { env } from '@/server/config/env';

export interface WhatsAppPayload {
  toPhone: string;
  message: string;
}

/**
 * Format Indian 10-digit mobile number into international E.164 format (+91...)
 */
export function formatToWhatsAppNumber(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  return rawPhone.startsWith('+') ? rawPhone : `+${digits}`;
}

/**
 * Core WhatsApp Dispatcher
 * Automatically routes to Twilio, Meta Cloud API, or Dev Simulation Console Logger
 */
export async function sendWhatsAppMessage({ toPhone, message }: WhatsAppPayload): Promise<{ success: boolean; provider: string; error?: string }> {
  const formattedPhone = formatToWhatsAppNumber(toPhone);

  // 1. If Twilio Credentials exist in environment
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const fromNumber = env.TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
        ? env.TWILIO_WHATSAPP_NUMBER
        : `whatsapp:${env.TWILIO_WHATSAPP_NUMBER}`;
      const toNumber = `whatsapp:${formattedPhone}`;

      const params = new URLSearchParams();
      params.append('From', fromNumber);
      params.append('To', toNumber);
      params.append('Body', message);

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
      const res = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.warn('[WHATSAPP_TWILIO_ERROR]', errJson);
        return { success: false, provider: 'twilio', error: JSON.stringify(errJson) };
      }

      return { success: true, provider: 'twilio' };
    } catch (err: any) {
      console.warn('[WHATSAPP_TWILIO_EXCEPTION]', err);
      return { success: false, provider: 'twilio', error: err.message };
    }
  }

  // 2. If Generic / Meta WhatsApp Webhook URL exists
  if (env.WHATSAPP_API_URL) {
    try {
      const res = await fetch(env.WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(env.WHATSAPP_API_KEY ? { Authorization: `Bearer ${env.WHATSAPP_API_KEY}` } : {}),
        },
        body: JSON.stringify({
          to: formattedPhone,
          message,
        }),
      });

      if (!res.ok) {
        return { success: false, provider: 'custom_api', error: `HTTP ${res.status}` };
      }
      return { success: true, provider: 'custom_api' };
    } catch (err: any) {
      return { success: false, provider: 'custom_api', error: err.message };
    }
  }

  // 3. Fallback / Development Mode: Rich Simulation Console Logger
  console.log('\n============================================================');
  console.log(`📱 [WHATSAPP NOTIFICATION SIMULATOR]`);
  console.log(`➡️ To: ${formattedPhone}`);
  console.log(`💬 Message:\n${message}`);
  console.log('============================================================\n');

  return { success: true, provider: 'dev_simulator' };
}

/* ========================================================================= */
/* HIGHER-LEVEL DOMAIN SPECIFIC WHATSAPP NOTIFICATIONS                       */
/* ========================================================================= */

/**
 * 1. Send Alert to Transporter when Admin assigns a Trip
 */
export async function notifyTransporterTripAssigned(params: {
  transporterPhone: string;
  transporterName: string;
  farmerName: string;
  farmerPhone?: string | null;
  pickupLocation: string;
  destinationLocation: string;
  materialName?: string | null;
  quantityKg?: number | null;
  tripNumber: string;
  tripId: string;
}) {
  const weightTonnes = params.quantityKg ? (params.quantityKg / 1000).toFixed(1) : 'Standard';
  const cropText = params.materialName ? ` (${params.materialName})` : '';
  const trackingLink = `${env.APP_BASE_URL}/transporter/requests`;

  const text = `🚚 *FarmEx Logistics: Naya Trip Request!*\n\nNamaste *${params.transporterName}* ji,\nAapko ek naya pickup request assign hua hai:\n\n` +
    `• *Trip No:* ${params.tripNumber}\n` +
    `• *Kisan:* ${params.farmerName} ${params.farmerPhone ? `(📞 ${params.farmerPhone})` : ''}\n` +
    `• *📍 Pickup:* ${params.pickupLocation}\n` +
    `• *🏢 Mandi / Drop:* ${params.destinationLocation}\n` +
    `• *⚖️ Maal:* ${weightTonnes} Tonnes${cropText}\n\n` +
    `👉 *Accept karne ke liye click karein:* ${trackingLink}\n\n` +
    `_FarmEx Logistics Support_`;

  return sendWhatsAppMessage({ toPhone: params.transporterPhone, message: text });
}

/**
 * 2. Send Alert to Farmer when Transporter is assigned
 */
export async function notifyFarmerTripAssigned(params: {
  farmerPhone: string;
  farmerName: string;
  transporterName: string;
  transporterPhone?: string | null;
  vehicleNumber?: string | null;
  pickupLocation: string;
  destinationLocation: string;
  tripNumber: string;
  tripId: string;
}) {
  const trackingLink = `${env.APP_BASE_URL}/tracking/${params.tripId}`;

  const text = `🌾 *FarmEx Booking Update: Transporter Assigned!*\n\nNamaste *${params.farmerName}* ji,\nAapke maal ke transport ke liye gadi assign ho gayi hai:\n\n` +
    `• *Trip No:* ${params.tripNumber}\n` +
    `• *🚚 Driver:* ${params.transporterName}\n` +
    `• *📞 Driver Mobile:* ${params.transporterPhone || 'Available on App'}\n` +
    (params.vehicleNumber ? `• *🚛 Gadi No:* ${params.vehicleNumber}\n` : '') +
    `• *📍 Route:* ${params.pickupLocation} ➔ ${params.destinationLocation}\n\n` +
    `📍 *Live Tracking Link:* ${trackingLink}\n\n` +
    `_Kisan Seva | FarmEx India_`;

  return sendWhatsAppMessage({ toPhone: params.farmerPhone, message: text });
}

/**
 * 3. Send Status Updates to Farmer during Trip (Pickup / In-Transit / Destination / Delivered)
 */
export async function notifyFarmerTripStatusUpdate(params: {
  farmerPhone: string;
  farmerName: string;
  transporterName: string;
  status: 'PICKUP' | 'IN_TRANSIT' | 'ON_DESTINATION' | 'DELIVERED';
  destinationLocation: string;
  tripNumber: string;
  tripId: string;
}) {
  const trackingLink = `${env.APP_BASE_URL}/tracking/${params.tripId}`;
  let statusMessage = '';

  switch (params.status) {
    case 'PICKUP':
      statusMessage = `🚚 *Gadi Pickup Location Par Pahunch Gayi Hai!*\nDriver *${params.transporterName}* aapke khet / location par maal load kar raha hai.`;
      break;
    case 'IN_TRANSIT':
      statusMessage = `🚛 *Maal Mandi Ke Liye Nikal Chuka Hai!*\nAapka kisan maal load hokar ${params.destinationLocation} Mandi ke liye ravaana ho chuka hai.`;
      break;
    case 'ON_DESTINATION':
      statusMessage = `🏢 *Gadi Mandi Pahunch Gayi Hai!*\nDriver ${params.destinationLocation} Mandi pahunch gaya hai aur unloading shuru ho rahi hai.`;
      break;
    case 'DELIVERED':
      statusMessage = `✅ *Trip Safaltapoorvak Complete & Delivered!*\nAapka maal Mandi me surakshit deliver ho chuka hai.\n\nFarmEx ka upyog karne ke liye aapka bohot-bohot Dhanyawad! 🙏`;
      break;
  }

  const text = `🌾 *FarmEx Live Trip Update!*\n\nNamaste *${params.farmerName}* ji,\n\n${statusMessage}\n\n` +
    `• *Trip No:* ${params.tripNumber}\n` +
    `📍 *Live Tracking Status:* ${trackingLink}\n\n` +
    `_FarmEx Support_`;

  return sendWhatsAppMessage({ toPhone: params.farmerPhone, message: text });
}

/**
 * 4. Send Thank You & Earnings Alert to Transporter on Completion
 */
export async function notifyTransporterTripCompleted(params: {
  transporterPhone: string;
  transporterName: string;
  tripNumber: string;
  destinationLocation: string;
}) {
  const text = `🎉 *FarmEx: Trip Successfully Completed!*\n\nNamaste *${params.transporterName}* ji,\n` +
    `Aapne Trip *${params.tripNumber}* (${params.destinationLocation}) safaltapoorvak complete kar di hai.\n\n` +
    `Aapki service ke liye bohot-bohot *Dhanyawad*! Aap agle trip requests lene ke liye tayyar hain.\n\n` +
    `👉 *Naye trips dekhein:* ${env.APP_BASE_URL}/transporter/requests\n\n` +
    `_FarmEx Partner Support_`;

  return sendWhatsAppMessage({ toPhone: params.transporterPhone, message: text });
}

/**
 * 5. Send Alert to Farmer for 'Ghar Se Beche' Sample Collection & Lab Report
 */
export async function notifyFarmerSampleUpdate(params: {
  farmerPhone: string;
  farmerName: string;
  enquiryNumber: string;
  enquiryId: string;
  materialName: string;
  sampleStatus: 'PENDING_COLLECTION' | 'COLLECTION_ASSIGNED' | 'SAMPLE_COLLECTED' | 'APPROVED' | 'REJECTED';
  preferredDate?: string;
  labRemarks?: string;
  quotedPricePerQtl?: number;
}) {
  let statusText = '';
  const detailLink = `${env.APP_BASE_URL}/farmer/enquiries`;

  switch (params.sampleStatus) {
    case 'COLLECTION_ASSIGNED':
      statusText = `🚚 *Sample Collection Scheduled!*\nFarmEx field agent aapke farm par sample lene aa raha hai.\n📅 Date: ${params.preferredDate || 'As scheduled'}`;
      break;
    case 'SAMPLE_COLLECTED':
      statusText = `🧪 *Sample Safalta Se Collect Hua!*\nAapka *${params.materialName}* ka sample collect karke Rewari Testing Lab bhej diya gaya hai.`;
      break;
    case 'APPROVED':
      statusText = `🎉 *Lab Report Pass & Price Approved!*\nAapke sample ki quality test pass ho gayi hai!\n` +
        (params.quotedPricePerQtl ? `💰 *Approved Rate:* ₹${params.quotedPricePerQtl}/Quintal\n` : '') +
        (params.labRemarks ? `📝 *Quality Remarks:* ${params.labRemarks}\n` : '') +
        `🚚 Gadi jald hi pickup ke liye assign ki ja rahi hai!`;
      break;
    case 'REJECTED':
      statusText = `⚠️ *Sample Quality Update: Rejected*\n` +
        (params.labRemarks ? `Reason: ${params.labRemarks}\n` : '') +
        `Hamaari team aapse jald hi call par sampark karegi.`;
      break;
    default:
      statusText = `🌾 Aapka 'Ghar Se Beche' request submit ho gaya hai. Jald hi agent assign hoga.`;
  }

  const text = `🌾 *FarmEx: Ghar Se Beche (Procurement) Update!*\n\nNamaste *${params.farmerName}* ji,\n\n${statusText}\n\n` +
    `• *Enquiry No:* ${params.enquiryNumber}\n` +
    `• *Fasal:* ${params.materialName}\n` +
    `👉 *Status dekhein:* ${detailLink}\n\n` +
    `_FarmEx Agri Support_`;

  return sendWhatsAppMessage({ toPhone: params.farmerPhone, message: text });
}
