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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Create the email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Electricity Account Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px;">

  <div style="background: linear-gradient(135deg, #20C997 0%, #1db88a 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">
      Electricity Account Confirmation
    </h1>
  </div>

  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #e9ecef; border-top: none;">

    <p style="font-size: 16px; margin-bottom: 24px;">
      Hi,
    </p>

    <p style="font-size: 16px; margin-bottom: 24px;">
      I've set up my electricity service for my upcoming move-in. Below are my account details for your records.
    </p>

    <div style="background: white; border: 2px solid #20C997; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #20C997; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; font-weight: 700;">
        Electricity Account Details
      </h2>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 14px; width: 140px;">Account Number</td>
          <td style="padding: 8px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">${accountNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 14px;">Provider</td>
          <td style="padding: 8px 0; font-size: 16px; color: #1a1a1a;">${providerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 14px;">Service Address</td>
          <td style="padding: 8px 0; font-size: 16px; color: #1a1a1a;">${serviceAddress}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 14px;">Service Start Date</td>
          <td style="padding: 8px 0; font-size: 16px; color: #1a1a1a;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666; font-size: 14px;">Account Holder</td>
          <td style="padding: 8px 0; font-size: 16px; color: #1a1a1a;">${customerName}</td>
        </tr>
      </table>
    </div>

    <p style="font-size: 16px; margin-bottom: 8px;">
      Please let me know if you need any additional information.
    </p>

    <p style="font-size: 16px; margin-bottom: 24px;">
      Thanks,<br>
      <strong>${customerName}</strong><br>
      <span style="color: #666;">${customerPhone}${customerEmail ? ` | ${customerEmail}` : ''}</span>
    </p>

    <div style="border-top: 1px solid #e9ecef; padding-top: 16px; margin-top: 24px;">
      <p style="font-size: 12px; color: #999; margin: 0; text-align: center;">
        This email was sent via <a href="https://2turniton.com" style="color: #20C997; text-decoration: none;">2TurnItOn</a> — the easiest way to set up utilities when moving.
      </p>
    </div>
  </div>

</body>
</html>
`;

    // Plain text version for email clients that don't support HTML
    const emailText = `
Electricity Account Confirmation

Hi,

I've set up my electricity service for my upcoming move-in. Below are my account details for your records.

ELECTRICITY ACCOUNT DETAILS
---------------------------
Account Number: ${accountNumber}
Provider: ${providerName}
Service Address: ${serviceAddress}
Service Start Date: ${formattedDate}
Account Holder: ${customerName}

Please let me know if you need any additional information.

Thanks,
${customerName}
${customerPhone}${customerEmail ? ` | ${customerEmail}` : ''}

---
This email was sent via 2TurnItOn (https://2turniton.com)
`;

    // Send the email using Resend
    // Using Resend's test sender for now. To use your own domain:
    // 1. Go to resend.com/domains and add your domain
    // 2. Add the DNS records they provide
    // 3. Change 'from' to your verified domain (e.g., notifications@2turniton.com)
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
