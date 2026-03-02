import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { Order } from '../types'

const STATUSES = ['Pending','Confirmed','Shipped','Delivered','Cancelled']

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const fetchOrders = useCallback(() => {
    setLoading(true)
    api.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const updateStatus = async (orderId: number, status: string) => {
    await api.put(`/orders/${orderId}`, { status })
    fetchOrders()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
        <button type="button" onClick={() => navigate('/create-order')} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg">+ Create Order</button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-gray-600">Order ID</th>
              <th className="px-4 py-3 text-left text-gray-600">Customer</th>
              <th className="px-4 py-3 text-left text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-gray-600">Items</th>
              <th className="px-4 py-3 text-left text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.order_id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium">#ORD{o.order_id.toString().padStart(4,'0')}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{o.customer_name}</div>
                  <div className="text-xs text-gray-500">{o.company_name}</div>
                </td>
                <td className="px-4 py-3">{new Date(o.order_date).toLocaleDateString('en-IN')}</td>
                <td className="px-4 py-3">{o.items.length} items</td>
                <td className="px-4 py-3 font-semibold">₹{o.total_amount.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                <td className="px-4 py-3">
                  <select value={o.status} onChange={e => updateStatus(o.order_id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border-none cursor-pointer ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button type="button" onClick={() => navigate(`/invoice/${o.order_id}`)}
                    className="text-blue-600 hover:text-blue-800 text-xs">View Invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center text-gray-500 py-8">No orders yet.</p>}
      </div>
    </div>
  )
}

export default Orders
