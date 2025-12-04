import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client lazily
let twilioClient: twilio.Twilio | null = null;
function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

type MessageType = 'confirmation' | 'failure' | 'landlord_reminder';

interface SMSRequest {
  to: string; // Phone number in E.164 format (+1XXXXXXXXXX)
  type: MessageType;
  data: {
    customerName?: string;
    orderId?: string;
    serviceAddress?: string;
    moveInDate?: string;
    services?: string[];
    errorMessage?: string;
  };
}

// Format phone number to E.164
function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // If it's 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If it starts with 1 and is 11 digits, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // If already has country code, just add +
  if (digits.length > 10) {
    return `+${digits}`;
  }

  // Return as-is with + prefix
  return `+${digits}`;
}

// Generate message based on type - Practical UI: concise, front-load key info
function generateMessage(type: MessageType, data: SMSRequest['data']): string {
  const firstName = data.customerName?.split(' ')[0] || 'there';

  switch (type) {
    case 'confirmation':
      const serviceList = data.services?.join(', ') || 'your utilities';
      return `${firstName}, you're all set!

Order #${data.orderId}
${data.serviceAddress}
Starting ${formatDateShort(data.moveInDate)}
${serviceList}

Confirmation emails coming within 24 hours.

– 2TurnItOn`;

    case 'failure':
      return `${firstName}, we hit a snag with your utility setup.

Your info is saved. Try again at 2turniton.com or reply for help.

– 2TurnItOn`;

    case 'landlord_reminder':
      return `${firstName}, get your keys!

Your electricity account #: ${data.orderId}

Your leasing office needs this before you can move in. Just forward this text to them.

– 2TurnItOn`;

    default:
      return '';
  }
}

// Format date for SMS (shorter format)
function formatDateShort(dateStr?: string): string {
  if (!dateStr) return 'soon';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: SMSRequest = await request.json();
    const { to, type, data } = body;

    // Validate required fields
    if (!to || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: to, type' },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(to);

    // Validate phone format
    if (!/^\+\d{10,15}$/.test(formattedPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Generate message
    const messageBody = generateMessage(type, data);
    if (!messageBody) {
      return NextResponse.json(
        { error: 'Invalid message type' },
        { status: 400 }
      );
    }

    // Send SMS via Twilio
    const client = getTwilioClient();
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    const message = await client.messages.create({
      to: formattedPhone,
      messagingServiceSid,
      body: messageBody,
    });

    console.log('SMS sent successfully:', message.sid);

    return NextResponse.json({
      success: true,
      messageSid: message.sid,
    });
  } catch (error) {
    console.error('SMS API error:', error);

    // Handle Twilio-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const twilioError = error as { code: number; message: string };
      return NextResponse.json(
        { error: 'SMS failed', details: twilioError.message, code: twilioError.code },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
