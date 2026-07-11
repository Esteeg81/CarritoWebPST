import { env } from './env.js'

export async function sendAdminWhatsApp(message: string): Promise<boolean> {
  if (!env.CALLMEBOT_API_KEY || !env.WHATSAPP_ADMIN_PHONE) {
    return false
  }

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(env.WHATSAPP_ADMIN_PHONE)}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(env.CALLMEBOT_API_KEY)}`

  try {
    await fetch(url)
    return true
  } catch (err) {
    console.error('Error enviando WhatsApp al admin:', err)
    return false
  }
}
