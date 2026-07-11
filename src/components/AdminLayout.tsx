import { NavLink, Outlet } from 'react-router-dom'

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`

function AdminLayout() {
  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-6 flex gap-2 border-b border-slate-200 pb-4">
        <NavLink to="/admin/pedidos" className={tabClass}>
          Pedidos
        </NavLink>
        <NavLink to="/admin/preparacion" className={tabClass}>
          Preparación
        </NavLink>
        <NavLink to="/admin/productos" className={tabClass}>
          Productos
        </NavLink>
        <NavLink to="/admin/clientes" className={tabClass}>
          Clientes
        </NavLink>
        <NavLink to="/admin/configuracion" className={tabClass}>
          Configuración
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}

export default AdminLayout
