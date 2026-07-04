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

export function getBusinessApprovedEmailHtml(userName: string, businessName: string) {
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
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; width: 100%; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                        <td align="center" style="background-color: #0F172A; padding: 32px 24px;">
                            <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                                <a href="https://pesanajalab-prototype.vercel.app/" target="_blank" style="color: #FFFFFF; text-decoration: none;">Pesanaja.Lab</a>
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 32px; color: #334155; font-size: 16px; line-height: 1.6;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <div style="display: inline-block; background-color: #ecfdf5; padding: 12px; border-radius: 50%;">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                    </svg>
                                </div>
                            </div>
                            <p style="margin-top: 0; margin-bottom: 24px; color: #0F172A; font-weight: 700; font-size: 18px;">
                                Dear ${userName},
                            </p>
                            <p style="margin-top: 0; margin-bottom: 16px;">
                                <strong style="color: #0F172A;">Congratulations!</strong> Your business verification request for <strong style="color: #0F172A;">${businessName}</strong> has been reviewed and approved by our team.
                            </p>
                            <p style="margin-top: 0; margin-bottom: 32px;">
                                To officially list your business on the Pesanaja.Lab platform and start accepting appointments, you just need to complete your account activation by setting up your subscription.
                            </p>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 6px; background-color: #2563EB;">
                                                    <a href="https://pesanajalab-prototype.vercel.app/dashboard/business/subscription" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: #FFFFFF; text-decoration: none; font-weight: 700; border-radius: 6px; border: 1px solid #2563EB;">
                                                        Activate My Business
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 32px 32px;">
                            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 0 0 24px 0;">
                            <p style="margin: 0; font-size: 14px; color: #64748B; text-align: center; line-height: 1.5;">
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

export function getNewBookingEmailHtml(ownerName: string, customerName: string, serviceName: string, appointmentDate: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PesanAja Lab - New Appointment Booking</title>
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
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; width: 100%; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <tr>
                        <td align="center" style="background-color: #0F172A; padding: 32px 24px;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                                <a href="https://pesanajalab-prototype.vercel.app/" target="_blank" style="color: #FFFFFF; text-decoration: none;">Pesanaja.Lab</a>
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 32px; color: #334155; font-size: 16px; line-height: 1.6;">
                            <div style="text-align: center; margin-bottom: 24px;">
                                <div style="display: inline-block; background-color: #EFF6FF; padding: 12px; border-radius: 50%;">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                </div>
                            </div>
                            <p style="margin-top: 0; margin-bottom: 24px; color: #0F172A; font-weight: 700; font-size: 18px;">
                                Dear ${ownerName},
                            </p>
                            <p style="margin-top: 0; margin-bottom: 24px;">
                                You have a new appointment booking! <strong style="color: #0F172A;">${customerName}</strong> has just scheduled a service with your business.
                            </p>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #F8FAFC; border-radius: 6px; border-left: 4px solid #2563EB;">
                                <tr>
                                    <td style="padding: 20px 24px; font-size: 15px; color: #334155; line-height: 1.6;">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td width="100" style="padding-bottom: 8px; color: #64748B;"><strong>Customer:</strong></td>
                                                <td style="padding-bottom: 8px; font-weight: 600; color: #0F172A;">${customerName}</td>
                                            </tr>
                                            <tr>
                                                <td width="100" style="padding-bottom: 8px; color: #64748B;"><strong>Service:</strong></td>
                                                <td style="padding-bottom: 8px; font-weight: 600; color: #0F172A;">${serviceName}</td>
                                            </tr>
                                            <tr>
                                                <td width="100" style="color: #64748B;"><strong>Date & Time:</strong></td>
                                                <td style="font-weight: 600; color: #0F172A;">${appointmentDate}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin-top: 0; margin-bottom: 32px;">
                                Please log in to your dashboard to review this booking and confirm the appointment.
                            </p>
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 6px; background-color: #2563EB;">
                                                    <a href="https://pesanajalab-prototype.vercel.app/dashboard/business/appointments" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: #FFFFFF; text-decoration: none; font-weight: 700; border-radius: 6px; border: 1px solid #2563EB;">
                                                        View Appointments
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 32px 32px 32px;">
                            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 0 0 24px 0;">
                            <p style="margin: 0; font-size: 14px; color: #64748B; text-align: center; line-height: 1.5;">
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

