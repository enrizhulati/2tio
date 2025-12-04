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

interface LandlordEmailRequest {
  landlordEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  accountNumber: string;
  providerName: string;
  serviceAddress: string;
  serviceStartDate: string;
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
    const body: LandlordEmailRequest = await request.json();

    const {
      landlordEmail,
      customerName,
      customerEmail,
      customerPhone,
      accountNumber,
      providerName,
      serviceAddress,
      serviceStartDate,
    } = body;

    // Validate required fields
    if (!landlordEmail || !customerName || !accountNumber || !serviceAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(landlordEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Format the date nicely
    const formattedDate = new Date(serviceStartDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Create the email HTML - Practical UI compliant
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Electricity Account Confirmation</title>
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
                <span style="font-size: 32px; color: ${colors.teal};">⚡</span>
              </div>
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${colors.white}; letter-spacing: -0.02em;">
                Electricity Account Confirmation
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">

              <p style="margin: 0 0 24px 0; font-size: 18px; line-height: 1.5; color: ${colors.darkest};">
                Hi,
              </p>

              <p style="margin: 0 0 32px 0; font-size: 18px; line-height: 1.5; color: ${colors.dark};">
                I've set up my electricity service for my upcoming move-in. Below are my account details for your records.
              </p>

              <!-- Account Details Card - Practical UI: teal accent for key info -->
              <div style="background: ${colors.tealLight}; border-left: 4px solid ${colors.teal}; border-radius: 0 8px 8px 0; padding: 24px; margin-bottom: 32px;">
                <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: ${colors.dark}; text-transform: uppercase; letter-spacing: 0.05em;">
                  Electricity Account Number
                </p>
                <p style="margin: 0; font-size: 28px; font-weight: 700; color: ${colors.darkest}; letter-spacing: -0.02em;">
                  ${accountNumber}
                </p>
              </div>

              <!-- Details Table -->
              <div style="background: ${colors.lightest}; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid ${colors.light};">
                      <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: ${colors.dark}; text-transform: uppercase; letter-spacing: 0.05em;">Provider</p>
                      <p style="margin: 0; font-size: 18px; color: ${colors.darkest};">${providerName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid ${colors.light};">
                      <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: ${colors.dark}; text-transform: uppercase; letter-spacing: 0.05em;">Service address</p>
                      <p style="margin: 0; font-size: 18px; color: ${colors.darkest};">${serviceAddress}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid ${colors.light};">
                      <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: ${colors.dark}; text-transform: uppercase; letter-spacing: 0.05em;">Service start date</p>
                      <p style="margin: 0; font-size: 18px; color: ${colors.darkest};">${formattedDate}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: ${colors.dark}; text-transform: uppercase; letter-spacing: 0.05em;">Account holder</p>
                      <p style="margin: 0; font-size: 18px; color: ${colors.darkest};">${customerName}</p>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0 0 8px 0; font-size: 18px; line-height: 1.5; color: ${colors.dark};">
                Please let me know if you need any additional information.
              </p>

              <p style="margin: 0 0 32px 0; font-size: 18px; line-height: 1.5; color: ${colors.darkest};">
                Thanks,<br>
                <strong>${customerName}</strong><br>
                <span style="font-size: 16px; color: ${colors.dark};">${customerPhone}${customerEmail ? ` | ${customerEmail}` : ''}</span>
              </p>

              <!-- Footer note -->
              <div style="padding-top: 24px; border-top: 1px solid ${colors.light}; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: ${colors.dark};">
                  This email was sent via <a href="https://2turniton.com" style="color: ${colors.teal}; text-decoration: none; font-weight: 600;">2TurnItOn</a>
                </p>
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

    // Plain text version - Practical UI: front-load important info
    const emailText = `Electricity Account Confirmation

Hi,

I've set up my electricity service for my upcoming move-in. Below are my account details for your records.

ELECTRICITY ACCOUNT NUMBER
${accountNumber}

DETAILS
Provider: ${providerName}
Service address: ${serviceAddress}
Service start date: ${formattedDate}
Account holder: ${customerName}

Please let me know if you need any additional information.

Thanks,
${customerName}
${customerPhone}${customerEmail ? ` | ${customerEmail}` : ''}

---
This email was sent via 2TurnItOn (https://2turniton.com)
© ${new Date().getFullYear()} 2TurnItOn
`;

    // Send the email using Resend
    const { data, error } = await getResend().emails.send({
      from: '2TurnItOn <onboarding@resend.dev>',
      to: landlordEmail,
      replyTo: customerEmail,
      subject: `Electricity Account Confirmation – ${serviceAddress}`,
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

    console.log('Landlord email sent successfully:', data?.id);

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
