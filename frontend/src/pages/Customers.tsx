import React, { useEffect, useState } from 'react'
import api from '../api/client'
import { Customer } from '../types'

const emptyForm = { customer_name: '', company_name: '', phone: '', email: '', address: '', gst_number: '' }

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success'|'error'>('success')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/customers', { params: { search } }).then(r => setCustomers(r.data))
  }, [search])

  const fetchCustomers = () => {
    api.get('/customers', { params: { search } }).then(r => setCustomers(r.data))
  }

  const showMsg = (m: string, t: 'success'|'error' = 'success') => {
    setMsg(m); setMsgType(t)
    setTimeout(() => setMsg(''), 3000)
  }

  const openAdd = () => {
    setForm(emptyForm); setEditId(null); setOtpSent(false); setOtp(''); setPhoneVerified(false); setShowModal(true)
  }

  const openEdit = (c: Customer) => {
    setForm({ customer_name: c.customer_name, company_name: c.company_name || '', phone: c.phone || '', email: c.email || '', address: c.address || '', gst_number: c.gst_number || '' })
    setEditId(c.id); setOtpSent(false); setOtp(''); setPhoneVerified(true); setShowModal(true)
  }

  const sendOtp = async () => {
    if (!form.phone) { showMsg('Enter phone first', 'error'); return }
    setLoading(true)
    try {
      const r = await api.post('/send_otp', { phone: form.phone })
      if (r.data.success) { setOtpSent(true); showMsg(`OTP sent! (Check console: ${r.data.otp})`) }
    } catch { showMsg('Failed to send OTP', 'error') }
    setLoading(false)
  }

  const verifyOtp = async () => {
    setLoading(true)
    try {
      const r = await api.post('/verify_otp', { phone: form.phone, otp })
      if (r.data.success) { setPhoneVerified(true); showMsg('Phone verified!') }
      else showMsg('Invalid OTP', 'error')
    } catch { showMsg('Verification failed', 'error') }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId && !phoneVerified) { showMsg('Verify phone first', 'error'); return }
    setLoading(true)
    try {
      if (editId) {
        await api.put(`/customers/${editId}`, form)
        showMsg('Customer updated!')
      } else {
        await api.post('/customers', { ...form, phone_verified: true })
        showMsg('Customer added!')
      }
      setShowModal(false); fetchCustomers()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      showMsg(e.response?.data?.message || 'Error', 'error')
    }
    setLoading(false)
  }

  const deleteCustomer = async (id: number) => {
    if (!confirm('Delete this customer?')) return
    await api.delete(`/customers/${id}`)
    fetchCustomers()
    showMsg('Customer deleted')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customer Master</h2>
        <button type="button" onClick={openAdd} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg">+ Add Customer</button>
      </div>
      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msgType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}
      <div className="bg-white rounded-xl shadow mb-4">
        <div className="p-4 border-b border-gray-200">
          <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-yellow-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-gray-600">Company</th>
                <th className="px-4 py-3 text-left text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left text-gray-600">Email</th>
                <th className="px-4 py-3 text-left text-gray-600">GST</th>
                <th className="px-4 py-3 text-left text-gray-600">Verified</th>
                <th className="px-4 py-3 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.customer_name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.company_name}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.gst_number}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${c.phone_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.phone_verified ? '✓ Verified' : '✗ Unverified'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => openEdit(c)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button type="button" onClick={() => deleteCustomer(c.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <p className="text-center text-gray-500 py-8">No customers found.</p>}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editId ? 'Edit Customer' : 'Add Customer'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cust-name" className="block text-xs font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input id="cust-name" required value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                  <label htmlFor="cust-company" className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                  <input id="cust-company" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
              </div>
              <div>
                <label htmlFor="cust-phone" className="block text-xs font-medium text-gray-700 mb-1">Phone *</label>
                <div className="flex gap-2">
                  <input id="cust-phone" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    disabled={editId !== null} />
                  {!editId && !phoneVerified && (
                    <button type="button" onClick={sendOtp} disabled={loading}
                      className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50">
                      Send OTP
                    </button>
                  )}
                  {phoneVerified && <span className="text-green-600 text-sm self-center">✓ Verified</span>}
                </div>
              </div>
              {otpSent && !phoneVerified && (
                <div>
                  <label htmlFor="cust-otp" className="block text-xs font-medium text-gray-700 mb-1">Enter OTP</label>
                  <div className="flex gap-2">
                    <input id="cust-otp" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit OTP"
                      className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                    <button type="button" onClick={verifyOtp} disabled={loading}
                      className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50">
                      Verify
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="cust-email" className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input id="cust-email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label htmlFor="cust-address" className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                <textarea id="cust-address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={2}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label htmlFor="cust-gst" className="block text-xs font-medium text-gray-700 mb-1">GST Number</label>
                <input id="cust-gst" value={form.gst_number} onChange={e => setForm({...form, gst_number: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg disabled:opacity-50">
                  {loading ? 'Saving...' : (editId ? 'Update' : 'Add Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
