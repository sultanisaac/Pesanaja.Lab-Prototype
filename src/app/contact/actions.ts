'use server'

import { sendEmail } from '@/lib/email';

export async function submitContactForm(prevState: unknown, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !phone || !message) {
    return { error: 'All fields are required.' };
  }

  const htmlContent = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
  `;

  try {
    const result = await sendEmail({
      to: 'business@asimetrilab.com',
      subject: `New Contact Message from ${name}`,
      html: htmlContent,
    });

    if (result.success) {
      return { success: true };
    } else {
      return { error: 'Failed to send email. Please try again later.' };
    }
  } catch {
    return { error: 'An unexpected error occurred.' };
  }
}
