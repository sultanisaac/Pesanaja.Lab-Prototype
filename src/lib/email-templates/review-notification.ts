export function getReviewNotificationHtml(params: {
  ownerName: string;
  businessName: string;
  customerName: string;
  serviceName: string;
  rating: number;
  reviewComment: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PesanAja Lab - New Review</title>
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
                                <div style="display: inline-block; background-color: #FEF3C7; padding: 12px; border-radius: 50%;">
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                </div>
                            </div>
                            
                            <p style="margin-top: 0; margin-bottom: 24px; color: #0F172A; font-weight: 700; font-size: 18px;">
                                Hi ${params.ownerName},
                            </p>
                            
                            <p style="margin-top: 0; margin-bottom: 24px;">
                                You just received a new customer review for <strong>${params.businessName}</strong> on <strong style="color: #0F172A;">Pesanaja.Lab</strong>.
                            </p>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #F8FAFC; border-radius: 6px; border-left: 4px solid #2563EB;">
                                <tr>
                                    <td style="padding: 20px 24px; font-size: 15px; color: #334155; line-height: 1.6;">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td colspan="2" style="padding-bottom: 16px;">
                                                    <span style="color: #64748B; font-weight: 600; display: block; margin-bottom: 4px;">Feedback:</span>
                                                    <span style="font-style: italic; color: #0F172A;">"${params.reviewComment}"</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="100" style="padding-bottom: 8px; color: #64748B;"><strong>Customer:</strong></td>
                                                <td style="padding-bottom: 8px; font-weight: 600; color: #0F172A;">${params.customerName}</td>
                                            </tr>
                                            <tr>
                                                <td width="100" style="padding-bottom: 8px; color: #64748B;"><strong>Service:</strong></td>
                                                <td style="padding-bottom: 8px; font-weight: 600; color: #0F172A;">${params.serviceName}</td>
                                            </tr>
                                            <tr>
                                                <td width="100" style="color: #64748B;"><strong>Rating:</strong></td>
                                                <td style="font-weight: 600; color: #0F172A;">
                                                    <span style="color: #F59E0B; font-size: 18px; line-height: 1;">★</span> ${params.rating}/5 Stars
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin-top: 0; margin-bottom: 32px;">
                                To manage this review or view your overall rating, click the link below to access your Business Dashboard:
                            </p>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td align="center">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="center" style="border-radius: 6px; background-color: #2563EB;">
                                                    <a href="https://pesanajalab-prototype.vercel.app/dashboard/business/reviews" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; color: #FFFFFF; text-decoration: none; font-weight: 700; border-radius: 6px; border: 1px solid #2563EB;">
                                                        View Reviews
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin-top: 0; margin-bottom: 0;">
                                Best regards,<br>
                                <strong style="color: #0F172A;"><a href="https://pesanajalab-prototype.vercel.app" target="_blank" style="color: #0F172A; text-decoration: none;">The Pesanaja.Lab Team</a></strong>
                            </p>

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
</html>`;
}
