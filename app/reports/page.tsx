"use client"

import { useState } from 'react'
import ProtectedRoute from "@/components/auth/protected-route"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Calendar, TrendingUp, DollarSign, Package, Users } from 'lucide-react'
import { useStore } from "@/lib/store"

function ReportsContent() {
  const { sales, products, customers, suppliers } = useStore()
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [reportType, setReportType] = useState('daily')

  // Filter sales by date range
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.saleDate)
    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)
    return saleDate >= fromDate && saleDate <= toDate
  })

  // Calculate metrics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  const totalPaid = filteredSales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0)
  const totalOutstanding = totalRevenue - totalPaid
  const totalCost = filteredSales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId)
    return sum + ((product?.cost || 0) * sale.quantity)
  }, 0)
  const totalProfit = totalPaid - totalCost
  const profitMargin = totalPaid > 0 ? (totalProfit / totalPaid) * 100 : 0

  // Product performance
  const productSales = filteredSales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.productId)
    if (product) {
      if (!acc[product.id]) {
        acc[product.id] = {
          product,
          quantity: 0,
          revenue: 0,
          profit: 0
        }
      }
      acc[product.id].quantity += sale.quantity
      acc[product.id].revenue += sale.totalAmount || 0
      acc[product.id].profit += ((sale.unitPrice || 0) - (product.cost || 0)) * sale.quantity
    }
    return acc
  }, {} as any)

  const topProducts = Object.values(productSales)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10)

  // Stock movements
  const stockMovements = products.map(product => {
    const sold = filteredSales
      .filter(sale => sale.productId === product.id)
      .reduce((sum, sale) => sum + sale.quantity, 0)
    
    return {
      product,
      initialStock: product.stock + sold,
      sold,
      currentStock: product.stock,
      revenue: filteredSales
        .filter(sale => sale.productId === product.id)
        .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
    }
  }).filter(item => item.sold > 0)

  // Export functions
  const exportToTXT = (data: any[], filename: string) => {
    let content = `${filename.toUpperCase()}\n`
    content += `Generated on: ${new Date().toLocaleString()}\n`
    content += `Date Range: ${dateFrom} to ${dateTo}\n`
    content += '='.repeat(50) + '\n\n'

    if (filename.includes('sales')) {
      content += `Total Revenue: ${totalRevenue.toLocaleString()} MMK\n`
      content += `Total Paid: ${totalPaid.toLocaleString()} MMK\n`
      content += `Outstanding: ${totalOutstanding.toLocaleString()} MMK\n`
      content += `Total Profit: ${totalProfit.toLocaleString()} MMK\n`
      content += `Profit Margin: ${profitMargin.toFixed(2)}%\n\n`

      data.forEach((sale: any) => {
        const product = products.find(p => p.id === sale.productId)
        content += `Sale ID: ${sale.id}\n`
        content += `Date: ${new Date(sale.saleDate).toLocaleDateString()}\n`
        content += `Customer: ${sale.customerName || 'Walk-in'}\n`
        content += `Product: ${product?.name || 'Unknown'}\n`
        content += `Quantity: ${sale.quantity}\n`
        content += `Total: ${(sale.totalAmount || 0).toLocaleString()} MMK\n`
        content += `Paid: ${(sale.paidAmount || 0).toLocaleString()} MMK\n`
        content += `Status: ${sale.paymentStatus || 'paid'}\n`
        content += '-'.repeat(30) + '\n'
      })
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${dateFrom}_to_${dateTo}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportToCSV = (data: any[], filename: string) => {
    let csv = ''
    
    if (filename.includes('sales')) {
      csv = 'Sale ID,Date,Customer,Product,Quantity,Unit Price,Total Amount,Paid Amount,Outstanding,Payment Method,Status\n'
      data.forEach((sale: any) => {
        const product = products.find(p => p.id === sale.productId)
        csv += `${sale.id},${new Date(sale.saleDate).toLocaleDateString()},"${sale.customerName || 'Walk-in'}","${product?.name || 'Unknown'}",${sale.quantity},${sale.unitPrice || 0},${sale.totalAmount || 0},${sale.paidAmount || 0},${(sale.totalAmount || 0) - (sale.paidAmount || 0)},${sale.paymentMethod || 'cash'},${sale.paymentStatus || 'paid'}\n`
      })
    } else if (filename.includes('stock')) {
      csv = 'Product,SKU,Initial Stock,Sold,Current Stock,Revenue\n'
      data.forEach((item: any) => {
        csv += `"${item.product.name}",${item.product.sku || ''},${item.initialStock},${item.sold},${item.currentStock},${item.revenue}\n`
      })
    } else if (filename.includes('profit')) {
      csv = 'Product,Quantity Sold,Revenue,Cost,Profit,Margin %\n'
      data.forEach((item: any) => {
        const margin = item.revenue > 0 ? ((item.profit / item.revenue) * 100).toFixed(2) : '0'
        csv += `"${item.product.name}",${item.quantity},${item.revenue},${item.revenue - item.profit},${item.profit},${margin}\n`
      })
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${dateFrom}_to_${dateTo}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Reports & Analytics</h1>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Date Range Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">TOTAL REVENUE</p>
                <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} MMK</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-500 mb-1">TOTAL PROFIT</p>
                <p className="text-2xl font-bold text-gray-900">{totalProfit.toLocaleString()} MMK</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-500 mb-1">PROFIT MARGIN</p>
                <p className="text-2xl font-bold text-gray-900">{profitMargin.toFixed(1)}%</p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-500 mb-1">OUTSTANDING</p>
                <p className="text-2xl font-bold text-gray-900">{totalOutstanding.toLocaleString()} MMK</p>
              </div>
              <Users className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="stock">Stock Report</TabsTrigger>
          <TabsTrigger value="profit">Profit & Loss</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sales Report ({dateFrom} to {dateTo})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToTXT(filteredSales, 'sales_report')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export TXT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(filteredSales, 'sales_report')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sale ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => {
                    const product = products.find(p => p.id === sale.productId)
                    const outstanding = (sale.totalAmount || 0) - (sale.paidAmount || 0)
                    
                    return (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.id}</TableCell>
                        <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                        <TableCell>{sale.customerName || 'Walk-in'}</TableCell>
                        <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                        <TableCell>{sale.quantity}</TableCell>
                        <TableCell>{(sale.totalAmount || 0).toLocaleString()} MMK</TableCell>
                        <TableCell>{(sale.paidAmount || 0).toLocaleString()} MMK</TableCell>
                        <TableCell className={outstanding > 0 ? 'text-red-600' : 'text-green-600'}>
                          {outstanding.toLocaleString()} MMK
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            (sale.paymentStatus || 'paid') === 'paid' ? 'default' : 
                            (sale.paymentStatus || 'paid') === 'partial' ? 'secondary' : 'destructive'
                          }>
                            {(sale.paymentStatus || 'paid').toUpperCase()}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Report */}
        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stock Movement Report ({dateFrom} to {dateTo})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToTXT(stockMovements, 'stock_report')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export TXT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(stockMovements, 'stock_report')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Initial Stock</TableHead>
                    <TableHead>Sold</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map((item) => (
                    <TableRow key={item.product.id}>
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell>{item.product.sku || 'N/A'}</TableCell>
                      <TableCell>{item.initialStock}</TableCell>
                      <TableCell>{item.sold}</TableCell>
                      <TableCell>{item.currentStock}</TableCell>
                      <TableCell>{item.revenue.toLocaleString()} MMK</TableCell>
                      <TableCell>
                        <Badge variant={item.currentStock < 10 ? 'destructive' : 'default'}>
                          {item.currentStock < 10 ? 'LOW STOCK' : 'IN STOCK'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit & Loss Report */}
        <TabsContent value="profit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profit & Loss Report ({dateFrom} to {dateTo})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToTXT(topProducts, 'profit_loss_report')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export TXT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(topProducts, 'profit_loss_report')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-xl font-bold">{totalRevenue.toLocaleString()} MMK</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Cost</p>
                    <p className="text-xl font-bold">{totalCost.toLocaleString()} MMK</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Profit</p>
                    <p className="text-xl font-bold text-green-600">{totalProfit.toLocaleString()} MMK</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Profit Margin</p>
                    <p className="text-xl font-bold">{profitMargin.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Margin %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((item: any) => {
                    const cost = item.revenue - item.profit
                    const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0
                    
                    return (
                      <TableRow key={item.product.id}>
                        <TableCell className="font-medium">{item.product.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.revenue.toLocaleString()} MMK</TableCell>
                        <TableCell>{cost.toLocaleString()} MMK</TableCell>
                        <TableCell className={item.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.profit.toLocaleString()} MMK
                        </TableCell>
                        <TableCell className={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {margin.toFixed(2)}%
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Performance */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Performing Products ({dateFrom} to {dateTo})</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToTXT(topProducts, 'product_performance')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export TXT
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(topProducts, 'product_performance')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity Sold</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Profit</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((item: any, index) => (
                    <TableRow key={item.product.id}>
                      <TableCell className="font-medium">#{index + 1}</TableCell>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.product.category || 'Uncategorized'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.revenue.toLocaleString()} MMK</TableCell>
                      <TableCell className={item.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {item.profit.toLocaleString()} MMK
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          index < 3 ? 'default' : 
                          index < 7 ? 'secondary' : 'outline'
                        }>
                          {index < 3 ? 'EXCELLENT' : index < 7 ? 'GOOD' : 'AVERAGE'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ReportsContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
