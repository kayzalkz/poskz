"use client"

import ProtectedRoute from "@/components/auth/protected-route"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Package, Tag, Layers } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { useStore } from "@/lib/store"
import { useMemo } from "react"

function DashboardContent() {
  const { products, sales, categories, brands } = useStore()

  const totalSales = useMemo(() => {
    return sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  }, [sales])

  const salesData = useMemo(() => {
    const monthlyData = sales.reduce((acc, sale) => {
      // Ensure saleDate is a Date object
      const saleDate = sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate)
      const month = saleDate.toLocaleDateString('en-US', { month: 'short' })
      acc[month] = (acc[month] || 0) + sale.totalAmount
      return acc
    }, {} as Record<string, number>)

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      sales: amount
    }))
  }, [sales])

  const generateReport = () => {
    const reportData = {
      totalSales,
      totalProducts: products.length,
      totalCategories: categories.length,
      totalBrands: brands.length,
      lowStockProducts: products.filter(p => p.stock <= p.minStock),
      topSellingProducts: sales.reduce((acc, sale) => {
        const product = products.find(p => p.id === sale.productId)
        if (product) {
          acc[product.name] = (acc[product.name] || 0) + sale.quantity
        }
        return acc
      }, {} as Record<string, number>)
    }

    const reportContent = `
SALES & INVENTORY REPORT
Generated on: ${new Date().toLocaleDateString()}

SUMMARY:
- Total Sales: ${totalSales.toLocaleString()} MMK
- Total Products: ${reportData.totalProducts}
- Total Categories: ${reportData.totalCategories}
- Total Brands: ${reportData.totalBrands}

LOW STOCK ALERTS:
${reportData.lowStockProducts.map(p => `- ${p.name}: ${p.stock} units (Min: ${p.minStock})`).join('\n')}

TOP SELLING PRODUCTS:
${Object.entries(reportData.topSellingProducts)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 5)
  .map(([name, qty]) => `- ${name}: ${qty} units sold`)
  .join('\n')}
    `

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
        <Button 
          onClick={generateReport}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium"
        >
          📊 Generate Report
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">TOTAL SALES</p>
                <p className="text-2xl font-bold text-gray-900">{totalSales.toLocaleString()} MMK</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-400">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-500 mb-1">PRODUCTS</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-500 mb-1">CATEGORIES</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-400">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-500 mb-1">BRANDS</p>
                <p className="text-2xl font-bold text-gray-900">{brands.length}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Overview Chart */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Sales Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => `${value.toLocaleString()} MMK`}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {products.filter(p => p.stock <= p.minStock).length > 0 && (
        <Card className="mt-6 border-l-4 border-l-red-400">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Low Stock Alerts</h3>
            <div className="space-y-2">
              {products
                .filter(p => p.stock <= p.minStock)
                .map(product => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-red-600">
                      {product.stock} units (Min: {product.minStock})
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <DashboardContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
