"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, BarChart3, Package, Tag, Layers, ShoppingCart, TrendingUp, FileText, Play } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"

const salesData = [
  { month: 'Jan', sales: 8000 },
  { month: 'Feb', sales: 10000 },
  { month: 'Mar', sales: 5000 },
  { month: 'Apr', sales: 15000 },
  { month: 'May', sales: 12000 },
  { month: 'Jun', sales: 20000 },
  { month: 'Jul', sales: 15000 },
  { month: 'Aug', sales: 25000 },
  { month: 'Sep', sales: 30000 },
  { month: 'Oct', sales: 20000 },
  { month: 'Nov', sales: 35000 },
]

export default function Component() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-emerald-500 text-white">
        <div className="p-6">
          <h1 className="text-lg font-bold tracking-wide">
            SALES &<br />
            INVENTORY
          </h1>
        </div>
        
        <nav className="px-4 space-y-1">
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-600 rounded-lg">
            <BarChart3 className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </div>
          
          <div className="pt-6 pb-2">
            <p className="px-4 text-sm font-medium text-emerald-200 tracking-wide">
              INVENTORY MANAGEMENT
            </p>
          </div>
          
          <div className="flex items-center justify-between px-4 py-3 hover:bg-emerald-600 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5" />
              <span>Category</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </div>
          
          <div className="flex items-center justify-between px-4 py-3 hover:bg-emerald-600 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5" />
              <span>Brands</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </div>
          
          <div className="flex items-center justify-between px-4 py-3 hover:bg-emerald-600 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5" />
              <span>Attributes</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </div>
          
          <div className="flex items-center justify-between px-4 py-3 hover:bg-emerald-600 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <span>Products</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </div>
          
          <div className="flex items-center justify-between px-4 py-3 hover:bg-emerald-600 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5" />
              <span>Sales</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </div>
          
          <div className="flex items-center justify-between px-4 py-3 hover:bg-emerald-600 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5" />
              <span>Inventory</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </div>
          
          <div className="pt-6 pb-2">
            <p className="px-4 text-sm font-medium text-emerald-200 tracking-wide">
              REPORTS
            </p>
          </div>
          
          <div className="flex items-center justify-between px-4 py-3 hover:bg-emerald-600 rounded-lg cursor-pointer">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" />
              <span>Reports</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </div>
        </nav>
        
        <div className="absolute bottom-6 left-4">
          <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md font-medium">
            MORE VIDEOS
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
          <Button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium">
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
                  <p className="text-2xl font-bold text-gray-900">$13,911.45</p>
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
                  <p className="text-2xl font-bold text-gray-900">6</p>
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
                  <p className="text-2xl font-bold text-gray-900">5</p>
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
                  <p className="text-2xl font-bold text-gray-900">5</p>
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
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    domain={[0, 40000]}
                    ticks={[10000, 20000, 30000, 40000]}
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
      </div>
    </div>
  )
}
