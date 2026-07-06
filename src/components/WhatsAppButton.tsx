const WHATSAPP_NUMBER = '543425112970'
const WHATSAPP_MESSAGE = 'Hola! Tengo una consulta sobre Carrito Web.'

function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultanos por WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-600"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.386.7 4.61 1.902 6.48L4 29l7.72-1.867A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.8a9.75 9.75 0 0 1-4.976-1.36l-.357-.212-4.584 1.108 1.226-4.463-.233-.367A9.74 9.74 0 0 1 5.72 15c0-5.678 4.611-10.29 10.284-10.29 5.673 0 10.284 4.612 10.284 10.29 0 5.678-4.61 10.29-10.284 10.29Zm5.652-7.706c-.31-.155-1.833-.905-2.117-1.008-.284-.104-.491-.155-.698.155-.207.31-.802 1.008-.983 1.216-.181.207-.362.233-.672.078-.31-.155-1.31-.483-2.495-1.539-.922-.822-1.545-1.838-1.726-2.148-.181-.31-.02-.478.136-.632.14-.14.31-.362.465-.543.155-.181.207-.31.31-.517.104-.207.052-.388-.026-.543-.078-.155-.698-1.68-.957-2.3-.252-.604-.508-.522-.698-.532l-.595-.01c-.207 0-.543.078-.827.388-.284.31-1.086 1.06-1.086 2.585s1.112 3 1.267 3.208c.155.207 2.19 3.343 5.306 4.688.741.32 1.319.511 1.77.654.744.237 1.42.204 1.955.124.596-.089 1.833-.75 2.092-1.474.259-.724.259-1.345.181-1.474-.077-.13-.284-.207-.593-.362Z" />
      </svg>
    </a>
  )
}

export default WhatsAppButton
