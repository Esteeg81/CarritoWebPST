import { Resend } from 'resend'
import { env } from './env.js'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export async function sendAdminNotification(subject: string, body: string) {
  if (!resend || !env.ADMIN_EMAIL) {
    return
  }

  try {
    await resend.emails.send({
      from: 'Carrito Web <onboarding@resend.dev>',
      to: env.ADMIN_EMAIL,
      subject,
      text: body,
    })
  } catch (err) {
    console.error('Error enviando mail al admin:', err)
  }
}
