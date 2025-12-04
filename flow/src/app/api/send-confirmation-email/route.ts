import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend lazily to avoid build-time errors when API key isn't set
let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface ServiceInfo {
  type: 'water' | 'electricity' | 'internet';
  provider: string;
  plan: string;
  rate?: string;
}

interface ConfirmationEmailRequest {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  orderId: string;
  serviceAddress: string;
  moveInDate: string;
  services: ServiceInfo[];
  isApartmentRenter?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmationEmailRequest = await request.json();

    const {
      customerEmail,
      customerName,
      customerPhone,
      orderId,
      serviceAddress,
      moveInDate,
      services,
      isApartmentRenter,
    } = body;

    // Validate required fields
    if (!customerEmail || !customerName || !orderId || !serviceAddress || !services?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format the date nicely
    const formattedDate = new Date(moveInDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Service type labels and icons (using emoji for email compatibility)
    const serviceLabels: Record<string, { label: string; emoji: string }> = {
      water: { label: 'Water', emoji: '💧' },
      electricity: { label: 'Electricity', emoji: '⚡' },
      internet: { label: 'Internet', emoji: '📶' },
    };

    // Generate services HTML
    const servicesHtml = services.map(service => {
      const { label, emoji } = serviceLabels[service.type] || { label: service.type, emoji: '📋' };
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e9ecef;">
            <div style="display: flex; align-items: center;">
              <span style="font-size: 20px; margin-right: 12px;">${emoji}</span>
              <div>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">${label}</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">${service.provider} - ${service.plan}</p>
                ${service.rate ? `<p style="margin: 2px 0 0 0; font-size: 14px; color: #20C997;">${service.rate}</p>` : ''}
              </div>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Generate services text for plain text version
    const servicesText = services.map(service => {
      const { label } = serviceLabels[service.type] || { label: service.type };
      return `- ${label}: ${service.provider} - ${service.plan}${service.rate ? ` (${service.rate})` : ''}`;
    }).join('\n');

    // Apartment renter tip section
    const apartmentTipHtml = isApartmentRenter ? `
      <div style="background: #FFF0EE; border: 2px solid #FF6F61; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">
          🔑 Don't forget: Get your keys!
        </p>
        <p style="margin: 0; font-size: 14px; color: #666;">
          In Texas, your leasing office needs your electricity account number before you can pick up your keys.
          Your account number is <strong>${orderId}</strong> — you can email this to your leasing office from your confirmation page.
        </p>
      </div>
    ` : '';

    const apartmentTipText = isApartmentRenter ? `
🔑 DON'T FORGET: GET YOUR KEYS!
In Texas, your leasing office needs your electricity account number before you can pick up your keys.
Your account number is ${orderId} — you can email this to your leasing office from your confirmation page.
` : '';

    // Create the email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your utilities are being set up!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

  <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #20C997 0%, #1db88a 100%); padding: 40px 30px; text-align: center;">
      <div style="width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">✓</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">
        You're all set!
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
        Your utilities are being set up
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">

      <p style="font-size: 16px; margin: 0 0 24px 0;">
        Hi ${customerName.split(' ')[0]},
      </p>

      <p style="font-size: 16px; margin: 0 0 24px 0;">
        Great news! We've submitted your utility setup requests. Here's a summary of your order:
      </p>

      <!-- Order Details Card -->
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e9ecef;">
          <div>
            <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</p>
            <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 700; color: #1a1a1a;">${orderId}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Service Start</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">${formattedDate}</p>
          </div>
        </div>

        <div>
          <p style="margin: 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Service Address</p>
          <p style="margin: 4px 0 0 0; font-size: 16px; color: #1a1a1a;">${serviceAddress}</p>
        </div>
      </div>

      <!-- Services -->
      <h2 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0;">
        Your Services
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        ${servicesHtml}
      </table>

      ${apartmentTipHtml}

      <!-- What's Next -->
      <div style="margin-top: 24px;">
        <h2 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0;">
          What happens next
        </h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; vertical-align: top; width: 30px;">
              <div style="width: 24px; height: 24px; background: #20C997; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700;">1</div>
            </td>
            <td style="padding: 8px 0 8px 12px; font-size: 14px; color: #1a1a1a;">
              We submit your information to each provider
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; vertical-align: top;">
              <div style="width: 24px; height: 24px; background: #20C997; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700;">2</div>
            </td>
            <td style="padding: 8px 0 8px 12px; font-size: 14px; color: #1a1a1a;">
              You'll receive confirmation emails from each provider within 24 hours
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; vertical-align: top;">
              <div style="width: 24px; height: 24px; background: #20C997; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-size: 12px; font-weight: 700;">3</div>
            </td>
            <td style="padding: 8px 0 8px 12px; font-size: 14px; color: #1a1a1a;">
              Your utilities will be active on your move-in date
            </td>
          </tr>
        </table>
      </div>

      <!-- Support -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e9ecef; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          Questions? We're here to help.
        </p>
        <a href="mailto:support@2tion.com" style="display: inline-block; margin-top: 8px; color: #20C997; font-size: 14px; font-weight: 600; text-decoration: none;">
          support@2tion.com
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="margin: 0; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} 2TurnItOn. The easiest way to set up utilities when moving.
      </p>
    </div>

  </div>

</body>
</html>
`;

    // Plain text version
    const emailText = `
YOU'RE ALL SET!
Your utilities are being set up

Hi ${customerName.split(' ')[0]},

Great news! We've submitted your utility setup requests. Here's a summary of your order:

ORDER DETAILS
-------------
Order Number: ${orderId}
Service Start: ${formattedDate}
Service Address: ${serviceAddress}

YOUR SERVICES
-------------
${servicesText}
${apartmentTipText}

WHAT HAPPENS NEXT
-----------------
1. We submit your information to each provider
2. You'll receive confirmation emails from each provider within 24 hours
3. Your utilities will be active on your move-in date

Questions? Contact us at support@2tion.com

---
© ${new Date().getFullYear()} 2TurnItOn
The easiest way to set up utilities when moving.
`;

    // Send the email using Resend
    // Using Resend's test sender for now. To use your own domain:
    // 1. Go to resend.com/domains and add your domain
    // 2. Add the DNS records they provide
    // 3. Change 'from' to your verified domain (e.g., notifications@2turniton.com)
    const { data, error } = await getResend().emails.send({
      from: '2TurnItOn <onboarding@resend.dev>',
      to: customerEmail,
      subject: `You're all set! Order #${orderId} confirmed`,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error.message },
        { status: 500 }
      );
    }

    console.log('Confirmation email sent successfully:', data?.id);

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
