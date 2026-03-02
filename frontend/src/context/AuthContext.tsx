import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'
import { User } from '../types'

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/me').then(r => setUser(r.data.user)).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const r = await api.post('/login', { email, password })
      if (r.data.success) { setUser(r.data.user); return true }
      return false
    } catch { return false }
  }

  const logout = async () => {
    await api.post('/logout').catch(() => {})
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
