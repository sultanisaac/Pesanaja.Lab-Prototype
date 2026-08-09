'use server'

import { sendEmail } from '@/lib/email';
import { getAdminNotificationTemplate, getVisitorAutoResponderTemplate } from '@/lib/emailTemplates';

export async function submitContactForm(prevState: unknown, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !phone || !message) {
    return { error: 'All fields are required.' };
  }


  try {
    // Send email to admin
    const adminHtml = getAdminNotificationTemplate(name, email, phone, message);
    const adminResult = await sendEmail({
      to: 'business@asimetrilab.com',
      subject: `New Contact Message from ${name}`,
      html: adminHtml,
    });

    // Send auto-responder to visitor
    const visitorHtml = getVisitorAutoResponderTemplate(name, message);
    await sendEmail({
      to: email,
      subject: `Hi ${name}, we're on it!`,
      html: visitorHtml,
    });

    if (adminResult.success) {
      return { success: true };
    } else {
      return { error: 'Failed to send email. Please try again later.' };
    }
  } catch {
    return { error: 'An unexpected error occurred.' };
  }
}
