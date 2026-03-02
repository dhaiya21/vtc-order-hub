import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/upload-customers', label: 'Upload Customers', icon: '📤' },
  { path: '/products', label: 'Products', icon: '📦' },
  { path: '/orders', label: 'Orders', icon: '📋' },
  { path: '/create-order', label: 'Create Order', icon: '➕' },
  { path: '/reports', label: 'Reports', icon: '📈' },
]

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="w-64 min-h-screen bg-black text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-lg font-bold text-yellow-400">VTC ORDER HUB</h1>
        <p className="text-xs text-gray-400 mt-1">Vikas Trading Co.</p>
        {user && <p className="text-xs text-green-400 mt-2">👤 {user.name} ({user.role})</p>}
      </div>
      <nav className="flex-1 py-4">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm transition-colors ${isActive ? 'bg-yellow-500 text-black font-semibold' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`
            }
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-800 rounded transition-colors"
        >
          <span className="mr-3">🚪</span> Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
