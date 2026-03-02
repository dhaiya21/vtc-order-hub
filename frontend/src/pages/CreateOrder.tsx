import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { Customer, Product } from '../types'

interface CartItem {
  product: Product;
  quantity: number;
}

const CreateOrder: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success'|'error'>('success')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/products').then(r => setProducts(r.data))
  }, [])

  useEffect(() => {
    if (customerSearch.length > 1) {
      api.get(`/get_customer/${customerSearch}`).then(r => setCustomers(r.data))
    } else {
      setCustomers([])
    }
  }, [customerSearch])

  const selectCustomer = (c: Customer) => {
    setSelectedCustomer(c); setCustomerSearch(c.customer_name); setCustomers([])
  }

  const addToCart = () => {
    if (!selectedProductId) return
    const product = products.find(p => p.product_id === parseInt(selectedProductId))
    if (!product) return
    const qty = parseInt(quantity)
    if (qty <= 0) return
    const existing = cart.find(i => i.product.product_id === product.product_id)
    if (existing) {
      setCart(cart.map(i => i.product.product_id === product.product_id ? {...i, quantity: i.quantity + qty} : i))
    } else {
      setCart([...cart, { product, quantity: qty }])
    }
    setSelectedProductId(''); setQuantity('1')
  }

  const removeFromCart = (pid: number) => setCart(cart.filter(i => i.product.product_id !== pid))

  const updateQty = (pid: number, qty: number) => {
    if (qty <= 0) { removeFromCart(pid); return }
    setCart(cart.map(i => i.product.product_id === pid ? {...i, quantity: qty} : i))
  }

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  const placeOrder = async () => {
    if (!selectedCustomer) { setMsg('Select a customer first'); setMsgType('error'); return }
    if (cart.length === 0) { setMsg('Add products to cart'); setMsgType('error'); return }
    setLoading(true)
    try {
      const r = await api.post('/create_order', {
        customer_id: selectedCustomer.id,
        items: cart.map(i => ({ product_id: i.product.product_id, quantity: i.quantity }))
      })
      if (r.data.success) {
        setMsg('Order placed successfully!')
        setMsgType('success')
        setTimeout(() => navigate(`/invoice/${r.data.order_id}`), 1000)
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setMsg(e.response?.data?.message || 'Error placing order'); setMsgType('error')
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Order</h2>
      {msg && <div className={`mb-4 p-3 rounded-lg text-sm ${msgType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Selection */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Step 1: Select Customer</h3>
            <div className="relative">
              <input
                type="text" placeholder="Search customer by name..." value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); if (!e.target.value) setSelectedCustomer(null) }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              {customers.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {customers.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="w-full text-left px-3 py-2 hover:bg-yellow-50 cursor-pointer text-sm border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium">{c.customer_name}</div>
                      <div className="text-xs text-gray-500">{c.company_name} · {c.phone}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedCustomer && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-gray-500">Name:</span> <strong>{selectedCustomer.customer_name}</strong></div>
                  <div><span className="text-gray-500">Company:</span> {selectedCustomer.company_name}</div>
                  <div><span className="text-gray-500">Phone:</span> {selectedCustomer.phone}</div>
                  <div><span className="text-gray-500">GST:</span> {selectedCustomer.gst_number}</div>
                  <div className="col-span-2"><span className="text-gray-500">Address:</span> {selectedCustomer.address}</div>
                </div>
              </div>
            )}
          </div>

          {/* Product Selection */}
          <div className="bg-white rounded-xl shadow p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Step 2: Add Products</h3>
            <div className="flex gap-3">
              <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.name} — ₹{p.price.toFixed(2)} (Stock: {p.stock_quantity})
                  </option>
                ))}
              </select>
              <input type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)}
                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              <button type="button" onClick={addToCart}
                className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg text-sm">
                Add
              </button>
            </div>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Step 3: Order Items</h3>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-600">Product</th>
                    <th className="px-3 py-2 text-left text-gray-600">Price</th>
                    <th className="px-3 py-2 text-left text-gray-600">Qty</th>
                    <th className="px-3 py-2 text-left text-gray-600">Subtotal</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.product.product_id} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-medium">{item.product.name}</td>
                      <td className="px-3 py-2">₹{item.product.price.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <input type="number" min="1" value={item.quantity}
                          onChange={e => updateQty(item.product.product_id, parseInt(e.target.value))}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-sm" />
                      </td>
                      <td className="px-3 py-2 font-semibold">₹{(item.product.price * item.quantity).toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => removeFromCart(item.product.product_id)} className="text-red-500 hover:text-red-700">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow p-4 h-fit">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer:</span>
              <span className="font-medium">{selectedCustomer?.customer_name || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Items:</span>
              <span>{cart.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Qty:</span>
              <span>{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-base font-bold">
              <span>Total Amount:</span>
              <span className="text-yellow-600">₹{total.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
            </div>
          </div>
          <button type="button" onClick={placeOrder} disabled={loading || !selectedCustomer || cart.length === 0}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Placing...' : '✓ Place Order & Generate Invoice'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateOrder
