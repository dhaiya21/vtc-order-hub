"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme-context"
import { Moon, Sun } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface DashboardHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function DashboardHeader({ title, description, children }: DashboardHeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-10 bg-background border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {children}
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
