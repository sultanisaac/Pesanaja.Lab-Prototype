export const getVisitorAutoResponderTemplate = (name: string, message: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We've got your message! - Pesanaja.Lab</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Manrope:wght@600;700&display=swap');
    </style>
    <style>
        body { margin: 0; padding: 0; background-color: #F8FAFB; font-family: 'Inter', Arial, Helvetica, sans-serif; color: #243746; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #F8FAFB; padding-bottom: 60px; }
        .main { background-color: #ffffff; margin: 40px auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: 'Inter', Arial, Helvetica, sans-serif; color: #243746; border-radius: 16px; border: 1px solid #E5ECF0; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02); }
        .header { padding: 40px 32px 20px; text-align: left; }
        .content { padding: 0 32px 32px; }
        h1 { font-family: 'Manrope', Arial, Helvetica, sans-serif; font-size: 24px; font-weight: 700; color: #243746; margin-bottom: 24px; line-height: 1.3; }
        p { font-size: 16px; line-height: 1.6; color: #243746; margin-bottom: 20px; }
        .message-box { background-color: #F8FAFB; border: 1px solid #E5ECF0; border-radius: 12px; padding: 24px; margin: 32px 0; }
        .message-box-title { font-size: 14px; font-weight: 600; color: #61707E; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .message-content { font-size: 15px; color: #243746; font-style: italic; margin: 0; white-space: pre-wrap; }
        .btn-primary { display: inline-block; background-color: #00B6C0; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; text-align: center; transition: background-color 0.3s ease; }
        .btn-primary:hover { background-color: #009CA5; }
        .footer { background-color: #F8FAFB; padding: 32px; text-align: center; border-top: 1px solid #E5ECF0; }
        .footer p { font-size: 14px; color: #61707E; margin: 0 0 12px 0; }
        .footer a { color: #00B6C0; text-decoration: none; font-weight: 600; }
        .divider { height: 1px; background-color: #E5ECF0; margin: 32px 0; border: none; }
        @media screen and (max-width: 600px) {
            .main { border-radius: 0; border-left: none; border-right: none; margin: 0 auto; }
            .header { padding: 32px 24px 16px; }
            .content { padding: 0 24px 24px; }
            h1 { font-size: 22px; }
        }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td class="header">
                    <div style="font-family: 'Manrope', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #00B6C0; letter-spacing: -0.5px;">
                        Pesanaja.Lab
                    </div>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h1>We've got your message!</h1>
                    <p>Hi ${name},</p>
                    <p>Thank you for contacting Pesanaja.Lab. We're reaching out to confirm that we've received your message, and our team is already looking into it.</p>
                    <p>We do our best to respond to all inquiries within <strong>1-2 business days</strong>. If your request is urgent, please hold tight, and we will get back to you as soon as possible.</p>
                    <p>In the meantime, you might find the answer you're looking for in our FAQ page:</p>
                    
                    <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation" style="margin: 24px 0;">
                        <tr>
                            <td align="left">
                                <a href="https://pesanajalab-prototype.vercel.app/faq" class="btn-primary" target="_blank">Visit FAQ Page</a>
                            </td>
                        </tr>
                    </table>

                    <hr class="divider">
                    
                    <div class="message-box">
                        <div class="message-box-title">Copy of your message</div>
                        <p class="message-content">"${message}"</p>
                    </div>
                    
                    <p>Best regards,<br><strong style="font-family: 'Manrope', Arial, sans-serif;">The Pesanaja.Lab Team</strong></p>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p>Need more help? Visit our website.</p>
                    <p><a href="https://pesanajalab-prototype.vercel.app" target="_blank">Pesanaja.Lab</a></p>
                    <p style="font-size: 12px; margin-top: 16px; color: #9CA3AF;">This is an automated message, please do not reply directly to this email.</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
`;

export const getAdminNotificationTemplate = (name: string, email: string, phone: string, message: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission - Pesanaja.Lab</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Manrope:wght@600;700&display=swap');
    </style>
    <style>
        body { margin: 0; padding: 0; background-color: #F8FAFB; font-family: 'Inter', Arial, Helvetica, sans-serif; color: #243746; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #F8FAFB; padding-bottom: 60px; }
        .main { background-color: #ffffff; margin: 40px auto; width: 100%; max-width: 600px; border-spacing: 0; font-family: 'Inter', Arial, Helvetica, sans-serif; color: #243746; border-radius: 16px; border: 1px solid #E5ECF0; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02); }
        .header { padding: 40px 32px 20px; text-align: left; }
        .content { padding: 0 32px 32px; }
        h1 { font-family: 'Manrope', Arial, Helvetica, sans-serif; font-size: 24px; font-weight: 700; color: #243746; margin-bottom: 24px; line-height: 1.3; }
        h2 { font-family: 'Manrope', Arial, Helvetica, sans-serif; font-size: 18px; font-weight: 700; color: #243746; margin-top: 32px; margin-bottom: 16px; line-height: 1.3; }
        p { font-size: 16px; line-height: 1.6; color: #243746; margin-bottom: 20px; }
        .data-section { background-color: #F8FAFB; border: 1px solid #E5ECF0; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
        .data-row { margin-bottom: 16px; }
        .data-row:last-child { margin-bottom: 0; }
        .data-label { font-size: 14px; font-weight: 600; color: #61707E; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; display: block; }
        .data-value { font-size: 16px; color: #243746; font-weight: 600; }
        .message-content { font-size: 15px; color: #243746; font-style: italic; margin-top: 8px; background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #E5ECF0; white-space: pre-wrap; }
        .footer { background-color: #F8FAFB; padding: 32px; text-align: center; border-top: 1px solid #E5ECF0; }
        .footer p { font-size: 14px; color: #61707E; margin: 0 0 12px 0; }
        .footer a { color: #00B6C0; text-decoration: none; font-weight: 600; }
        @media screen and (max-width: 600px) {
            .main { border-radius: 0; border-left: none; border-right: none; margin: 0 auto; }
            .header { padding: 32px 24px 16px; }
            .content { padding: 0 24px 24px; }
            h1 { font-size: 22px; }
            .data-section { padding: 16px; }
        }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td class="header">
                    <div style="font-family: 'Manrope', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #00B6C0; letter-spacing: -0.5px;">
                        Pesanaja.Lab
                    </div>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <h1>New Contact Form Submission</h1>
                    <p>Hello Pesanaja.Lab Admin,</p>
                    <p>You have received a new message from the contact form on Pesanaja.Lab. Here are the details:</p>
                    <h2>Sender Details:</h2>
                    
                    <div class="data-section">
                        <div class="data-row">
                            <span class="data-label">Name</span>
                            <span class="data-value">${name}</span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Email</span>
                            <span class="data-value"><a href="mailto:${email}" style="color: #00B6C0; text-decoration: none;">${email}</a></span>
                        </div>
                        <div class="data-row">
                            <span class="data-label">Phone</span>
                            <span class="data-value"><a href="tel:${phone}" style="color: #00B6C0; text-decoration: none;">${phone}</a></span>
                        </div>
                        <div class="data-row" style="margin-top: 24px;">
                            <span class="data-label">Message</span>
                            <div class="message-content">"${message}"</div>
                        </div>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p>View this submission in your admin dashboard.</p>
                    <p><a href="https://pesanajalab-prototype.vercel.app/dashboard/admin" target="_blank">Go to Admin Dashboard</a></p>
                    <p style="font-size: 12px; margin-top: 16px; color: #9CA3AF;">This is an automated system notification.</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
`;
