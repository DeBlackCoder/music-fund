import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@musicfund.com';

if (!RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not defined. Email functionality will be disabled.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (!resend) {
    console.log('Email not sent (Resend not configured):', { to, subject });
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

// Email Templates
export function welcomeEmail(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1DB954; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #1DB954; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MusicFund!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for joining MusicFund - the platform where music dreams come true!</p>
            <p>You can now:</p>
            <ul>
              <li>Discover amazing upcoming artists</li>
              <li>Support your favorite musicians</li>
              <li>Vote for songs you love</li>
              <li>Be part of their journey to success</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/discover" class="button">Start Exploring</a>
            <p>Best regards,<br>The MusicFund Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function campaignApprovedEmail(artistName: string, campaignTitle: string, campaignUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1DB954; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background: #1DB954; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Campaign Approved!</h1>
          </div>
          <div class="content">
            <h2>Hi ${artistName},</h2>
            <p>Great news! Your campaign "<strong>${campaignTitle}</strong>" has been approved and is now live!</p>
            <p>Your fans can now vote and support your music video production.</p>
            <a href="${campaignUrl}" class="button">View Campaign</a>
            <p>Share your campaign link with your fans and start raising funds!</p>
            <p>Best of luck,<br>The MusicFund Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function goalReachedEmail(artistName: string, campaignTitle: string, amount: number): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1DB954; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .amount { font-size: 32px; color: #1DB954; font-weight: bold; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 Goal Reached!</h1>
          </div>
          <div class="content">
            <h2>Congratulations ${artistName}!</h2>
            <p>Your campaign "<strong>${campaignTitle}</strong>" has reached its funding goal!</p>
            <div class="amount">₦${amount.toLocaleString()}</div>
            <p>You can now proceed with your music video production. Request a withdrawal from your dashboard to access your funds.</p>
            <p>Thank you for using MusicFund!</p>
            <p>Best regards,<br>The MusicFund Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function newVoteEmail(artistName: string, voterName: string, voteCount: number, amount: number, campaignTitle: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1DB954; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 New Vote Received!</h1>
          </div>
          <div class="content">
            <h2>Hi ${artistName},</h2>
            <p><strong>${voterName}</strong> just voted for your song "<strong>${campaignTitle}</strong>"!</p>
            <p><strong>${voteCount}</strong> votes • ₦${amount.toLocaleString()}</p>
            <p>Keep sharing your campaign to reach your goal faster!</p>
            <p>Best regards,<br>The MusicFund Team</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
