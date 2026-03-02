import React, { useEffect, useState } from 'react'
import api from '../api/client'
import { DashboardStats } from '../types'

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>

  const cards = [
    { label: 'Total Customers', value: stats?.total_customers ?? 0, icon: '👥', color: 'bg-blue-500' },
    { label: 'Total Orders', value: stats?.total_orders ?? 0, icon: '📋', color: 'bg-green-500' },
    { label: 'Total Revenue', value: `₹${(stats?.total_revenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, icon: '💰', color: 'bg-yellow-500' },
    { label: 'Low Stock Products', value: stats?.low_stock_products ?? 0, icon: '⚠️', color: 'bg-red-500' },
  ]

  const statusColors: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-blue-100 text-blue-700',
    Shipped: 'bg-purple-100 text-purple-700',
    Delivered: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow p-6 flex items-center">
            <div className={`${card.color} rounded-full w-12 h-12 flex items-center justify-center text-xl mr-4`}>{card.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">Order ID</th>
                <th className="px-4 py-3 text-left text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-gray-600">Amount</th>
                <th className="px-4 py-3 text-left text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recent_orders.map(order => (
                <tr key={order.order_id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono">#ORD{order.order_id.toString().padStart(4,'0')}</td>
                  <td className="px-4 py-3">{order.customer_name}</td>
                  <td className="px-4 py-3">{new Date(order.order_date).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 font-semibold">₹{order.total_amount.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
