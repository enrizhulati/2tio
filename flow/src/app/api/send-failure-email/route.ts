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
}

interface FailureEmailRequest {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  serviceAddress: string;
  moveInDate: string;
  services: ServiceInfo[];
  errorMessage?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FailureEmailRequest = await request.json();

    const {
      customerEmail,
      customerName,
      customerPhone,
      serviceAddress,
      moveInDate,
      services,
      errorMessage,
    } = body;

    // Validate required fields
    if (!customerEmail || !customerName || !serviceAddress) {
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

    // Service type labels
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
          <td style="padding: 8px 0;">
            <span style="font-size: 16px; margin-right: 8px;">${emoji}</span>
            <span style="font-size: 14px; color: #1a1a1a;">${label} - ${service.provider}</span>
          </td>
        </tr>
      `;
    }).join('');

    // Generate services text
    const servicesText = services.map(service => {
      const { label } = serviceLabels[service.type] || { label: service.type };
      return `- ${label}: ${service.provider} - ${service.plan}`;
    }).join('\n');

    // Create the email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We need your help to complete your order</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

  <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #FF6F61 0%, #E85A4F 100%); padding: 40px 30px; text-align: center;">
      <div style="width: 60px; height: 60px; background: white; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 28px;">⚠️</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
        We hit a snag
      </h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">
        Your order needs attention
      </p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">

      <p style="font-size: 16px; margin: 0 0 24px 0;">
        Hi ${customerName.split(' ')[0]},
      </p>

      <p style="font-size: 16px; margin: 0 0 24px 0;">
        We ran into an issue while processing your utility setup request. Don't worry — your information is saved and we're here to help you get set up.
      </p>

      <!-- What you were ordering -->
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px 0;">
          Your Order Details
        </h2>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #1a1a1a;">
          <strong>Address:</strong> ${serviceAddress}
        </p>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #1a1a1a;">
          <strong>Move-in Date:</strong> ${formattedDate}
        </p>
        <table style="width: 100%;">
          ${servicesHtml}
        </table>
      </div>

      <!-- What to do next -->
      <div style="background: #FFF0EE; border: 2px solid #FF6F61; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h2 style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin: 0 0 12px 0;">
          What you can do
        </h2>
        <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #1a1a1a;">
          <li style="margin-bottom: 8px;">
            <strong>Try again:</strong> Go back to <a href="https://2tion-flow.netlify.app" style="color: #FF6F61;">2TurnItOn</a> and submit your order again
          </li>
          <li style="margin-bottom: 8px;">
            <strong>Check your info:</strong> Make sure your address, ID, and other details are correct
          </li>
          <li>
            <strong>Contact us:</strong> If the problem persists, we'll help you sort it out
          </li>
        </ol>
      </div>

      ${errorMessage ? `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 12px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 12px; color: #666;">
          <strong>Technical details:</strong> ${errorMessage}
        </p>
      </div>
      ` : ''}

      <!-- Support CTA -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="mailto:support@2tion.com?subject=Order%20Issue%20-%20${encodeURIComponent(serviceAddress)}"
           style="display: inline-block; background: #20C997; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
          Contact Support
        </a>
      </div>

      <!-- Reassurance -->
      <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e9ecef;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          We're here to make sure your utilities are set up on time.<br>
          Don't hesitate to reach out!
        </p>
        <p style="margin: 12px 0 0 0;">
          <a href="mailto:support@2tion.com" style="color: #20C997; font-size: 14px; font-weight: 600; text-decoration: none;">
            support@2tion.com
          </a>
          <span style="color: #ccc; margin: 0 8px;">|</span>
          <a href="tel:+18005551234" style="color: #20C997; font-size: 14px; font-weight: 600; text-decoration: none;">
            (800) 555-1234
          </a>
        </p>
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
WE HIT A SNAG
Your order needs attention

Hi ${customerName.split(' ')[0]},

We ran into an issue while processing your utility setup request. Don't worry — your information is saved and we're here to help you get set up.

YOUR ORDER DETAILS
------------------
Address: ${serviceAddress}
Move-in Date: ${formattedDate}

Services:
${servicesText}

WHAT YOU CAN DO
---------------
1. Try again: Go back to https://2tion-flow.netlify.app and submit your order again
2. Check your info: Make sure your address, ID, and other details are correct
3. Contact us: If the problem persists, we'll help you sort it out
${errorMessage ? `\nTechnical details: ${errorMessage}` : ''}

We're here to make sure your utilities are set up on time.
Don't hesitate to reach out!

support@2tion.com | (800) 555-1234

---
© ${new Date().getFullYear()} 2TurnItOn
The easiest way to set up utilities when moving.
`;

    // Send the email using Resend
    const { data, error } = await getResend().emails.send({
      from: '2TurnItOn <onboarding@resend.dev>',
      to: customerEmail,
      subject: `Action needed: Your utility setup needs attention`,
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

    console.log('Failure email sent successfully:', data?.id);

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
