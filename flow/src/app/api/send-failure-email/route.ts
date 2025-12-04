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
          <td style="padding: 12px 0; border-bottom: 1px solid ${colors.light};">
            <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: ${colors.darkest};">${label}</p>
            <p style="margin: 0; font-size: 16px; color: ${colors.dark};">${service.provider} – ${service.plan}</p>
          </td>
        </tr>
      `;
    }).join('');

    // Generate services text
    const servicesText = services.map(service => {
      const label = serviceLabels[service.type] || service.type;
      return `${label}\n  ${service.provider} – ${service.plan}`;
    }).join('\n\n');

    // Create the email HTML - Practical UI compliant
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We hit a snag</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.lightest}; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${colors.lightest};">
    <tr>
      <td align="center" style="padding: 48px 16px;">

        <!-- Main Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background: ${colors.white}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(52, 58, 64, 0.07);">

          <!-- Header -->
          <tr>
            <td style="background: ${colors.coral}; padding: 48px 32px; text-align: center;">
              <div style="width: 64px; height: 64px; background: ${colors.white}; border-radius: 50%; margin: 0 auto 24px; line-height: 64px; text-align: center;">
                <span style="font-size: 32px; color: ${colors.coral};">!</span>
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${colors.white}; letter-spacing: -0.02em;">
                We hit a snag
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 18px; color: rgba(255,255,255,0.9);">
                Your order needs attention
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
                We ran into an issue while processing your utility setup. Don't worry — your information is saved and we're here to help.
              </p>

              <!-- Order Details Card -->
              <div style="background: ${colors.lightest}; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: ${colors.dark}; text-transform: uppercase; letter-spacing: 0.05em;">Service address</p>
                <p style="margin: 0 0 16px 0; font-size: 18px; color: ${colors.darkest};">${serviceAddress}</p>

                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: ${colors.dark}; text-transform: uppercase; letter-spacing: 0.05em;">Move-in date</p>
                <p style="margin: 0; font-size: 18px; color: ${colors.darkest};">${formattedDate}</p>
              </div>

              <!-- Services -->
              <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: ${colors.darkest};">
                Services requested
              </h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                ${servicesHtml}
              </table>

              <!-- What to do next - Practical UI: coral callout for action items -->
              <div style="background: ${colors.coralLight}; border-left: 4px solid ${colors.coral}; border-radius: 0 8px 8px 0; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: ${colors.darkest};">
                  What you can do
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top; width: 32px;">
                      <div style="width: 24px; height: 24px; background: ${colors.coral}; border-radius: 50%; color: ${colors.white}; text-align: center; line-height: 24px; font-size: 14px; font-weight: 700;">1</div>
                    </td>
                    <td style="padding: 8px 0 8px 12px; font-size: 16px; line-height: 1.5; color: ${colors.darkest};">
                      <strong>Try again</strong> – Go back to <a href="https://2tion-flow.netlify.app" style="color: ${colors.coral}; text-decoration: none; font-weight: 600;">2TurnItOn</a> and submit your order again
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <div style="width: 24px; height: 24px; background: ${colors.coral}; border-radius: 50%; color: ${colors.white}; text-align: center; line-height: 24px; font-size: 14px; font-weight: 700;">2</div>
                    </td>
                    <td style="padding: 8px 0 8px 12px; font-size: 16px; line-height: 1.5; color: ${colors.darkest};">
                      <strong>Check your info</strong> – Make sure your address and details are correct
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; vertical-align: top;">
                      <div style="width: 24px; height: 24px; background: ${colors.coral}; border-radius: 50%; color: ${colors.white}; text-align: center; line-height: 24px; font-size: 14px; font-weight: 700;">3</div>
                    </td>
                    <td style="padding: 8px 0 8px 12px; font-size: 16px; line-height: 1.5; color: ${colors.darkest};">
                      <strong>Contact us</strong> – If the problem persists, we'll help you sort it out
                    </td>
                  </tr>
                </table>
              </div>

              ${errorMessage ? `
              <div style="background: ${colors.lightest}; border-radius: 8px; padding: 16px; margin-bottom: 32px;">
                <p style="margin: 0; font-size: 14px; color: ${colors.dark};">
                  <strong style="color: ${colors.darkest};">Technical details:</strong> ${errorMessage}
                </p>
              </div>
              ` : ''}

              <!-- Support CTA -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="mailto:support@2tion.com?subject=Order%20Issue%20-%20${encodeURIComponent(serviceAddress)}"
                   style="display: inline-block; background: ${colors.teal}; color: ${colors.white}; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 18px; font-weight: 700;">
                  Contact support
                </a>
              </div>

              <!-- Support -->
              <div style="padding-top: 24px; border-top: 1px solid ${colors.light}; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 16px; color: ${colors.dark};">
                  We're here to make sure your utilities are set up on time
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
    const emailText = `We hit a snag

Hi ${customerName.split(' ')[0]},

We ran into an issue while processing your utility setup. Don't worry — your information is saved and we're here to help.

YOUR ORDER DETAILS
Service address: ${serviceAddress}
Move-in date: ${formattedDate}

SERVICES REQUESTED
${servicesText}

WHAT YOU CAN DO
1. Try again – Go back to https://2tion-flow.netlify.app and submit your order again
2. Check your info – Make sure your address and details are correct
3. Contact us – If the problem persists, we'll help you sort it out
${errorMessage ? `\nTechnical details: ${errorMessage}` : ''}

Questions? Contact support@2tion.com

© ${new Date().getFullYear()} 2TurnItOn
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
