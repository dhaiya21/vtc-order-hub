import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import { Order } from '../types'

const Invoice: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/invoice/${orderId}`).then(r => setOrder(r.data)).finally(() => setLoading(false))
  }, [orderId])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div></div>
  if (!order) return <div className="text-center text-red-500 p-8">Invoice not found</div>

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const gst = subtotal * 0.18
  const grandTotal = subtotal + gst

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between mb-4 print:hidden">
          <button type="button" onClick={() => navigate(-1)} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">← Back</button>
          <button type="button" onClick={() => window.print()} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg text-sm">🖨 Print Invoice</button>
        </div>
        <div id="invoice" className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-black">VTC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Vikas Trading Co.</h1>
                <p className="text-sm text-gray-500">PET Bottle Manufacturing & Wholesale</p>
                <p className="text-xs text-gray-400">GST: 27AABCV1234F1Z5</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-yellow-600">INVOICE</h2>
              <p className="text-sm text-gray-600 mt-1">Order ID: <strong>#ORD{order.order_id.toString().padStart(4,'0')}</strong></p>
              <p className="text-sm text-gray-600">Date: <strong>{new Date(order.order_date).toLocaleDateString('en-IN', {day:'2-digit',month:'long',year:'numeric'})}</strong></p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>{order.status}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
              <p className="font-bold text-gray-800">{order.customer_name}</p>
              <p className="text-sm text-gray-600">{order.company_name}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">From</h3>
              <p className="font-bold text-gray-800">Vikas Trading Co.</p>
              <p className="text-sm text-gray-600">Industrial Area, Maharashtra</p>
              <p className="text-sm text-gray-600">Phone: +91 98765 43210</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-gray-500">{idx+1}</td>
                  <td className="px-4 py-3 font-medium">{item.product_name}</td>
                  <td className="px-4 py-3 text-right">₹{item.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-semibold">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
                <span className="text-gray-600">GST (18%)</span>
                <span>₹{gst.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
              </div>
              <div className="flex justify-between py-3 text-base font-bold">
                <span>Grand Total</span>
                <span className="text-yellow-600">₹{grandTotal.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t-2 border-gray-200 pt-6 text-center">
            <p className="text-sm text-gray-500">Thank you for your business!</p>
            <p className="text-xs text-gray-400 mt-1">Vikas Trading Co. · PET Bottle Manufacturing & Wholesale · Maharashtra, India</p>
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default Invoice
