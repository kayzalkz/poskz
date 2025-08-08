"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { ChevronRight, BarChart3, Package, Tag, Layers, ShoppingCart, TrendingUp, FileText, Users, Building, CreditCard, LogOut, Truck } from 'lucide-react'
import { useStore } from "@/lib/store"

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
]

const inventoryItems = [
  { name: 'Category', href: '/category', icon: Tag },
  { name: 'Brands', href: '/brands', icon: Layers },
  { name: 'Attributes', href: '/attributes', icon: Package },
  { name: 'Products', href: '/products', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Suppliers', href: '/suppliers', icon: Truck },
  { name: 'Sales', href: '/sales', icon: TrendingUp },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Credit/Debit', href: '/credit-debit', icon: CreditCard },
]

const reportItems = [
  { name: 'Reports', href: '/reports', icon: FileText },
]

const adminItems = [
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Company Profile', href: '/company-profile', icon: Building },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const NavItem = ({ item, isActive }: { item: any, isActive: boolean }) => (
    <Link href={item.href}>
      <div className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-colors ${
        isActive ? 'bg-emerald-600' : 'hover:bg-emerald-600'
      }`}>
        <div className="flex items-center gap-3">
          <item.icon className="w-5 h-5" />
          <span>{item.name}</span>
        </div>
        <ChevronRight className="w-4 h-4" />
      </div>
    </Link>
  )

  return (
    <div className="w-64 bg-emerald-500 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-lg font-bold tracking-wide">
          SALES &<br />
          INVENTORY
        </h1>
        {user && (
          <div className="mt-4 text-sm">
            <p className="text-emerald-200">Welcome,</p>
            <p className="font-medium">{user.fullName}</p>
          </div>
        )}
      </div>
      
      <nav className="px-4 space-y-1 flex-1">
        {navigationItems.map((item) => (
          <NavItem key={item.name} item={item} isActive={pathname === item.href} />
        ))}
        
        <div className="pt-6 pb-2">
          <p className="px-4 text-sm font-medium text-emerald-200 tracking-wide">
            INVENTORY MANAGEMENT
          </p>
        </div>
        
        {inventoryItems.map((item) => (
          <NavItem key={item.name} item={item} isActive={pathname === item.href} />
        ))}
        
        <div className="pt-6 pb-2">
          <p className="px-4 text-sm font-medium text-emerald-200 tracking-wide">
            REPORTS
          </p>
        </div>
        
        {reportItems.map((item) => (
          <NavItem key={item.name} item={item} isActive={pathname === item.href} />
        ))}
        
        {user?.role === 'admin' && (
          <>
            <div className="pt-6 pb-2">
              <p className="px-4 text-sm font-medium text-emerald-200 tracking-wide">
                ADMINISTRATION
              </p>
            </div>
            
            {adminItems.map((item) => (
              <NavItem key={item.name} item={item} isActive={pathname === item.href} />
            ))}
          </>
        )}
      </nav>
      
      <div className="p-4">
        <Button 
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}
