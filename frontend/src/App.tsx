import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import UploadCustomers from './pages/UploadCustomers'
import Products from './pages/Products'
import Orders from './pages/Orders'
import CreateOrder from './pages/CreateOrder'
import Reports from './pages/Reports'
import Invoice from './pages/Invoice'

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/invoice/:orderId" element={<PrivateRoute><Invoice /></PrivateRoute>} />
        <Route path="/*" element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/upload-customers" element={<UploadCustomers />} />
                <Route path="/products" element={<Products />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/create-order" element={<CreateOrder />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

export default App
