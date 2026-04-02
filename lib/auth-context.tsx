"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type UserRole = "admin" | "staff"

export interface User {
  id: string
  username: string
  role: UserRole
  name: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for the application
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: "admin123",
    user: {
      id: "1",
      username: "admin",
      role: "admin",
      name: "Vikas Kumar",
    },
  },
  staff: {
    password: "staff123",
    user: {
      id: "2",
      username: "staff",
      role: "staff",
      name: "Rahul Sharma",
    },
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("vtc_user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("vtc_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const userEntry = DEMO_USERS[username.toLowerCase()]
    if (userEntry && userEntry.password === password) {
      setUser(userEntry.user)
      localStorage.setItem("vtc_user", JSON.stringify(userEntry.user))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("vtc_user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
