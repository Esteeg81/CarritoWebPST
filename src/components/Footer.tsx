import { useTheme } from '../hooks/useTheme'

const SOCIAL_LINKS = [
  { name: 'Instagram', url: 'https://www.instagram.com/pablo.steegapp' },
  { name: 'Facebook', url: 'https://facebook.com/carritoweb' },
]

function Footer() {
  const { settings } = useTheme()

  return (
    <footer
      className="mt-auto border-t border-slate-200 py-6"
      style={{ backgroundColor: settings.footerBg }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-sm text-slate-500 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Carrito Web</span>
        <div className="flex gap-4">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 hover:underline"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
