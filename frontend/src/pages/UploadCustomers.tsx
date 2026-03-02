import React, { useState } from 'react'
import api from '../api/client'

const UploadCustomers: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success'|'error'>('success')
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) { setMsg('Please select a .xlsx file'); setMsgType('error'); return }
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const r = await api.post('/upload_customers', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setMsg(r.data.message); setMsgType('success')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setMsg(e.response?.data?.message || 'Upload failed'); setMsgType('error')
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Customers</h2>
      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msgType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}
      <div className="bg-white rounded-xl shadow p-6 max-w-lg">
        <p className="text-sm text-gray-600 mb-4">Upload an Excel (.xlsx) file with columns: customer_name, company_name, phone, email, address, gst_number</p>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
          <span className="text-4xl">📤</span>
          <p className="text-sm text-gray-500 mt-2">Select .xlsx file</p>
          <input type="file" accept=".xlsx" onChange={e => setFile(e.target.files?.[0] || null)}
            className="mt-3 text-sm" />
        </div>
        <button type="button" onClick={handleUpload} disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg transition-colors disabled:opacity-50">
          {loading ? 'Uploading...' : 'Upload Customers'}
        </button>
      </div>
    </div>
  )
}

export default UploadCustomers
