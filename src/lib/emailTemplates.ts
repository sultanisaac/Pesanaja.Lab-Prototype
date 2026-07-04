export function getAdminVerificationRequestEmailHtml(adminName: string, userName: string, businessName: string, userEmail: string) {
  const dateStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PesanAja Lab - Verification Request</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen py-10">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; width: 100%; font-family: 'Inter', Arial, sans-serif;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                        <td align="center" style="background-color: #1e3a8a; padding: 32px 24px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                                <a href="https://pesanajalab-prototype.vercel.app/" target="_blank" style="color: #ffffff; text-decoration: none;">Pesanaja.Lab</a>
                            </h1>
                            <p style="color: #93c5fd; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">
                                Admin Notification System
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 32px; color: #374151; font-size: 16px; line-height: 1.6;">
                            <p style="margin-top: 0; margin-bottom: 24px; color: #111827; font-weight: 500;">
                                Dear Admin ${adminName},
                            </p>
                            <p style="margin-top: 0; margin-bottom: 16px;">
                                You have a new pending business verification request that requires your attention.
                            </p>
                            <p style="margin-top: 0; margin-bottom: 24px;">
                                <strong style="color: #111827;">${userName}</strong> has requested to upgrade their account to a Business Owner to manage <strong style="color: #111827;">${businessName}</strong>.
                            </p>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 4px 4px 0; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 14px; font-weight: 700; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Application Summary
                                        </h3>
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 15px;">
                                            <tr>
                                                <td width="130" style="padding-bottom: 8px; color: #6b7280; font-weight: 500;">Business Name:</td>
                                                <td style="padding-bottom: 8px; color: #111827; font-weight: 600;">${businessName}</td>
                                            </tr>
                                            <tr>
                                                <td width="130" style="padding-bottom: 8px; color: #6b7280; font-weight: 500;">Email Address:</td>
                                                <td style="padding-bottom: 8px;">
                                                    <a href="mailto:${userEmail}" style="color: #2563eb; text-decoration: none;">${userEmail}</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="130" style="padding-bottom: 0; color: #6b7280; font-weight: 500;">Date Submitted:</td>
                                                <td style="padding-bottom: 0; color: #111827;">${dateStr}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin-top: 0; margin-bottom: 32px;">
                                Please log in to the admin dashboard to review their credentials and make a decision on their account status.
                            </p>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://pesanajalab-prototype.vercel.app/dashboard/admin" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                                            Go to Verification Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 32px 32px;">
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 24px 0;">
                            <p style="margin: 0; font-size: 13px; color: #6b7280; text-align: center; line-height: 1.5;">
                                Please do not reply to this email.<br>
                                For system support, contact the technical team.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `.trim();
}
