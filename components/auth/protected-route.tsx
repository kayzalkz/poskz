"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from "@/lib/store"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, user, initializeStore } = useStore()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      await initializeStore()
      
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      
      if (requireAdmin && user?.role !== 'admin') {
        router.push('/')
        return
      }
    }
    
    init()
  }, [isAuthenticated, user, router, requireAdmin, initializeStore])

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <div>Access denied</div>
  }

  return <>{children}</>
}
