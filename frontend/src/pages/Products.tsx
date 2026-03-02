import React, { useEffect, useState } from 'react'
import api from '../api/client'
import { Product } from '../types'

const CATEGORIES = ['PET Bottles','Water Bottles','Oil Bottles','Pharma Bottles','Cosmetic Bottles','Plastic Containers','Custom Packaging']
const emptyForm = { name: '', category: 'PET Bottles', price: '', stock_quantity: '' }

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success'|'error'>('success')
  const [loading, setLoading] = useState(false)
  const [filterCat, setFilterCat] = useState('')

  const fetchProducts = () => api.get('/products').then(r => setProducts(r.data))
  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data))
  }, [])

  const showMsg = (m: string, t: 'success'|'error' = 'success') => { setMsg(m); setMsgType(t); setTimeout(() => setMsg(''), 3000) }

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true) }
  const openEdit = (p: Product) => {
    setForm({ name: p.name, category: p.category, price: String(p.price), stock_quantity: String(p.stock_quantity) })
    setEditId(p.product_id); setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    try {
      const data = { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) }
      if (editId) { await api.put(`/products/${editId}`, data); showMsg('Product updated!') }
      else { await api.post('/products', data); showMsg('Product added!') }
      setShowModal(false); fetchProducts()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      showMsg(e.response?.data?.message || 'Error', 'error')
    }
    setLoading(false)
  }

  const deleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`); fetchProducts(); showMsg('Product deleted')
  }

  const filtered = filterCat ? products.filter(p => p.category === filterCat) : products

  const stockColor = (qty: number) => qty < 200 ? 'text-red-600 font-bold' : qty < 500 ? 'text-yellow-600' : 'text-green-600'

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Product & Inventory</h2>
        <button type="button" onClick={openAdd} className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg">+ Add Product</button>
      </div>
      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msgType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}
      <div className="bg-white rounded-xl shadow">
        <div className="p-4 border-b border-gray-200 flex gap-3">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-sm text-gray-500 self-center">{filtered.length} products</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-600">Product</th>
                <th className="px-4 py-3 text-left text-gray-600">Category</th>
                <th className="px-4 py-3 text-left text-gray-600">Price (₹)</th>
                <th className="px-4 py-3 text-left text-gray-600">Stock</th>
                <th className="px-4 py-3 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.product_id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">{p.category}</span></td>
                  <td className="px-4 py-3">₹{p.price.toFixed(2)}</td>
                  <td className={`px-4 py-3 ${stockColor(p.stock_quantity)}`}>{p.stock_quantity.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button type="button" onClick={() => deleteProduct(p.product_id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="prod-name" className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
                <input id="prod-name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label htmlFor="prod-cat" className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select id="prod-cat" value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="prod-price" className="block text-xs font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input id="prod-price" required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
                <div>
                  <label htmlFor="prod-stock" className="block text-xs font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input id="prod-stock" required type="number" min="0" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading}
                  className="px-4 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg disabled:opacity-50">
                  {loading ? 'Saving...' : (editId ? 'Update' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
