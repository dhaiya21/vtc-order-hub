import React, { useEffect, useState } from 'react'
import api from '../api/client'
import { DashboardStats, Order } from '../types'

interface CustomerStat {
  name: string;
  company: string;
  total: number;
  orders: number;
}

const Reports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    api.get('/dashboard').then(r => setStats(r.data))
    api.get('/orders').then(r => setOrders(r.data))
  }, [])

  const statusCount = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topCustomers = [...orders].reduce((acc, o) => {
    const key = o.customer_name
    if (!acc[key]) acc[key] = { name: key, company: o.company_name, total: 0, orders: 0 }
    acc[key].total += o.total_amount
    acc[key].orders += 1
    return acc
  }, {} as Record<string, CustomerStat>)

  const topList = Object.values(topCustomers).sort((a, b) => b.total - a.total).slice(0, 10)

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports & Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Status Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(statusCount).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${(count / orders.length) * 100}%` }}></div>
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Customers</span>
              <span className="font-bold">{stats?.total_customers}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Orders</span>
              <span className="font-bold">{stats?.total_orders}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-bold text-yellow-600">₹{(stats?.total_revenue ?? 0).toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Low Stock Products</span>
              <span className="font-bold text-red-600">{stats?.low_stock_products}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Customers by Revenue</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600">#</th>
                <th className="px-4 py-2 text-left text-gray-600">Customer</th>
                <th className="px-4 py-2 text-left text-gray-600">Company</th>
                <th className="px-4 py-2 text-left text-gray-600">Orders</th>
                <th className="px-4 py-2 text-left text-gray-600">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topList.map((c, i) => (
                <tr key={c.name} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-500">{i+1}</td>
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2 text-gray-600">{c.company}</td>
                  <td className="px-4 py-2">{c.orders}</td>
                  <td className="px-4 py-2 font-semibold text-green-600">₹{c.total.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports
