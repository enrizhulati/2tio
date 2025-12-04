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

// Practical UI Design Tokens
const colors = {
  coral: '#FF6F61',
  coralLight: '#FFF0EE',
  teal: '#20C997',
  tealLight: '#E6F9F3',
  darkest: '#343A40',
  dark: '#6C757D',
  medium: '#ADB5BD',
  light: '#DEE2E6',
  lightest: '#F8F9FA',
  white: '#FFFFFF',
  success: '#2F9E44',
  warning: '#E67700',
};

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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Service type labels
    const serviceLabels: Record<string, string> = {
      water: 'Water',
      electricity: 'Electricity',
      internet: 'Internet',
    };

    // Generate services HTML - Practical UI: clear hierarchy, proper spacing
    const servicesHtml = services.map(service => {
      const label = serviceLabels[service.type] || service.type;
      return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid ${colors.light};">
            <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: ${colors.darkest};">${label}</p>
            <p style="margin: 0; font-size: 16px; color: ${colors.dark};">${service.provider} – ${service.plan}</p>
            ${service.rate ? `<p style="margin: 4px 0 0 0; font-size: 16px; color: ${colors.teal};">${service.rate}</p>` : ''}
          </td>
        </tr>
      `;
    }).join('');

    // Generate services text for plain text version
    const servicesText = services.map(service => {
      const label = serviceLabels[service.type] || service.type;
      return `${label}\n  ${service.provider} – ${service.plan}${service.rate ? `\n  ${service.rate}` : ''}`;
    }).join('\n\n');

    // Apartment renter tip section - Practical UI: use coral for important callout
    const apartmentTipHtml = isApartmentRenter ? `
      <div style="background: ${colors.coralLight}; border-left: 4px solid ${colors.coral}; border-radius: 0 8px 8px 0; padding: 24px; margin: 32px 0;">
        <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: ${colors.darkest};">
          Get your keys
        </p>
        <p style="margin: 0; font-size: 16px; line-height: 1.5; color: ${colors.dark};">
          In Texas, your leasing office needs your electricity account number before you can pick up your keys. Your account number is <strong style="color: ${colors.darkest};">${orderId}</strong>. Email this to your leasing office from your confirmation page.
        </p>
      </div>
    ` : '';

    const apartmentTipText = isApartmentRenter ? `
GET YOUR KEYS
In Texas, your leasing office needs your electricity account number before you can pick up your keys.
Your account number: ${orderId}
Email this to your leasing office from your confirmation page.
` : '';

    // Create the email HTML - Practical UI compliant
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your utilities are confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.lightest}; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${colors.lightest};">
    <tr>
      <td align="center" style="padding: 48px 16px;">

        <!-- Main Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background: ${colors.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(52, 58, 64, 0.07);">

          <!-- Header -->
          <tr>
            <td style="background: ${colors.teal}; padding: 48px 32px; text-align: center;">
              <div style="width: 64px; height: 64px; background: ${colors.white}; border-radius: 50%; margin: 0 auto 24px; line-height: 64px; text-align: center;">
                <span style="font-size: 32px; color: ${colors.teal};">✓</span>
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${colors.white}; letter-spacing: -0.02em;">
                You're all set
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 18px; color: rgba(255,255,255,0.9);">
                Your utilities are being set up
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">

              <p style="margin: 0 0 24px 0; font-size: 18px; line-height: 1.5; color: ${colors.darkest};">
                Hi ${customerName.split(' ')[0]},
              </p>

              <p style="margin: 0 0 32px 0; font-size: 18px; line-height: 1.5; color: ${colors.dark};">
                We've submitted your utility setup requests. Here's your order summary.
              </p>

              <!-- Order Details Card -->
              <div style="background: ${colors.lightest}; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: ${colors.dark}; text-transform: uppercase; letter-spacing: 0.05em;">Order number</p>
                      <p style="margin: 0; font-size: 22px; font-weight: 700; color: ${colors.darkest};">${orderId}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 16px;">
                      <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: ${colors.dark}; text-transform: uppercase; letter-spacing: 0.05em;">Service address</p>
                      <p style="margin: 0; font-size: 18px; color: ${colors.darkest};">${serviceAddress}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top: 16px;">
                      <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: ${colors.dark}; text-transform: uppercase; letter-spacing: 0.05em;">Service start date</p>
                      <p style="margin: 0; font-size: 18px; color: ${colors.darkest};">${formattedDate}</p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Services -->
              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: ${colors.darkest};">
                Your services
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                ${servicesHtml}
              </table>

              ${apartmentTipHtml}

              <!-- What's Next -->
              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: ${colors.darkest};">
                What happens next
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 12px 0; vertical-align: top; width: 32px;">
                    <div style="width: 28px; height: 28px; background: ${colors.teal}; border-radius: 50%; color: ${colors.white}; text-align: center; line-height: 28px; font-size: 14px; font-weight: 700;">1</div>
                  </td>
                  <td style="padding: 12px 0 12px 16px; font-size: 18px; line-height: 1.5; color: ${colors.darkest};">
                    We submit your information to each provider
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <div style="width: 28px; height: 28px; background: ${colors.teal}; border-radius: 50%; color: ${colors.white}; text-align: center; line-height: 28px; font-size: 14px; font-weight: 700;">2</div>
                  </td>
                  <td style="padding: 12px 0 12px 16px; font-size: 18px; line-height: 1.5; color: ${colors.darkest};">
                    You'll receive confirmation emails within 24 hours
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <div style="width: 28px; height: 28px; background: ${colors.teal}; border-radius: 50%; color: ${colors.white}; text-align: center; line-height: 28px; font-size: 14px; font-weight: 700;">3</div>
                  </td>
                  <td style="padding: 12px 0 12px 16px; font-size: 18px; line-height: 1.5; color: ${colors.darkest};">
                    Your utilities will be active on your move-in date
                  </td>
                </tr>
              </table>

              <!-- Support -->
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid ${colors.light}; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 16px; color: ${colors.dark};">
                  Questions? We're here to help
                </p>
                <a href="mailto:support@2tion.com" style="color: ${colors.teal}; font-size: 18px; font-weight: 700; text-decoration: none;">
                  support@2tion.com
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: ${colors.lightest}; padding: 24px 32px; text-align: center; border-top: 1px solid ${colors.light};">
              <p style="margin: 0; font-size: 14px; color: ${colors.dark};">
                © ${new Date().getFullYear()} 2TurnItOn
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

    // Plain text version - Practical UI: front-load important info, be concise
    const emailText = `You're all set

Hi ${customerName.split(' ')[0]},

We've submitted your utility setup requests.

ORDER DETAILS
Order number: ${orderId}
Service address: ${serviceAddress}
Service start: ${formattedDate}

YOUR SERVICES
${servicesText}
${apartmentTipText}

WHAT HAPPENS NEXT
1. We submit your information to each provider
2. You'll receive confirmation emails within 24 hours
3. Your utilities will be active on your move-in date

Questions? Contact support@2tion.com

© ${new Date().getFullYear()} 2TurnItOn
`;

    // Send the email using Resend
    const { data, error } = await getResend().emails.send({
      from: '2TurnItOn <onboarding@resend.dev>',
      to: customerEmail,
      subject: `Order confirmed – ${orderId}`,
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
