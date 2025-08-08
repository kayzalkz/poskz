"use client"

import { useState, useRef } from 'react'
import ProtectedRoute from "@/components/auth/protected-route"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Printer, Edit, Eye, DollarSign, TrendingUp, Package, Users } from 'lucide-react'
import { useStore } from "@/lib/store"

interface PrintableReceiptProps {
  sale: any
  product: any
  customer: any
}

const PrintableReceipt = ({ sale, product, customer }: PrintableReceiptProps) => {
  const separator = '================================'
  
  return (
    <div className="p-4 font-mono text-sm max-w-sm mx-auto bg-white">
      <div className="text-center mb-4">
        <h2 className="font-bold text-lg">SALES RECEIPT</h2>
        <p>{separator}</p>
        <p>Date: {(sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate)).toLocaleDateString()}</p>
        <p>Receipt #: {sale.id}</p>
        <p>{separator}</p>
      </div>
      
      <div className="mb-4">
        <p><strong>Customer:</strong> {customer?.name || sale.customerName || 'Walk-in Customer'}</p>
        {customer?.phone && <p><strong>Phone:</strong> {customer.phone}</p>}
        <p>{separator}</p>
      </div>
      
      <div className="mb-4">
        <p><strong>Product:</strong> {product?.name || 'Unknown Product'}</p>
        <p><strong>SKU:</strong> {product?.sku || 'N/A'}</p>
        <p><strong>Quantity:</strong> {sale.quantity}</p>
        <p><strong>Unit Price:</strong> {(sale.unitPrice || 0).toLocaleString()} MMK</p>
        <p>{separator}</p>
      </div>
      
      <div className="mb-4">
        <p><strong>Subtotal:</strong> {(sale.totalAmount || 0).toLocaleString()} MMK</p>
        <p><strong>Paid Amount:</strong> {(sale.paidAmount || 0).toLocaleString()} MMK</p>
        <p><strong>Outstanding:</strong> {((sale.totalAmount || 0) - (sale.paidAmount || 0)).toLocaleString()} MMK</p>
        <p><strong>Payment:</strong> {sale.paymentMethod || 'Cash'}</p>
        <p><strong>Status:</strong> {sale.paymentStatus || 'Paid'}</p>
        <p>{separator}</p>
      </div>
      
      <div className="text-center">
        <p>Thank you for your business!</p>
        <p>Visit us again soon</p>
      </div>
    </div>
  )
}

function SalesContent() {
  const { products, sales, customers, addSale, updateSale } = useStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    productId: '',
    customerId: 'walk-in',
    customerName: '',
    quantity: 1,
    unitPrice: 0,
    totalAmount: 0,
    paidAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    saleDate: new Date().toISOString().split('T')[0]
  })

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Sales Receipt</title>
              <style>
                body { font-family: monospace; font-size: 12px; margin: 0; padding: 20px; }
                .receipt { max-width: 400px; margin: 0 auto; }
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .font-bold { font-weight: bold; }
                .text-xl { font-size: 1.25rem; }
                .text-sm { font-size: 0.875rem; }
                .mb-1 { margin-bottom: 0.25rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .mb-4 { margin-bottom: 1rem; }
                .mt-8 { margin-top: 2rem; }
                .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
                .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
                .border-t { border-top: 1px solid #000; }
                .border-b { border-bottom: 1px solid #000; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const filteredSales = sales.filter(sale => {
    const product = products.find(p => p.id === sale.productId)
    const customer = customers.find(c => c.id === sale.customerId)
    const searchLower = searchTerm.toLowerCase()
    
    return (
      (product?.name || '').toLowerCase().includes(searchLower) ||
      (product?.sku || '').toLowerCase().includes(searchLower) ||
      (customer?.name || sale.customerName || '').toLowerCase().includes(searchLower) ||
      sale.id.toLowerCase().includes(searchLower)
    )
  })

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      const totalAmount = product.price * formData.quantity
      setFormData(prev => ({
        ...prev,
        productId,
        unitPrice: product.price,
        totalAmount,
        paidAmount: totalAmount // Default to full payment
      }))
    }
  }

  const handleQuantityChange = (quantity: number) => {
    const totalAmount = formData.unitPrice * quantity
    setFormData(prev => ({
      ...prev,
      quantity,
      totalAmount,
      paidAmount: prev.paidAmount || totalAmount // Keep existing paid amount or set to total
    }))
  }

  const handlePaidAmountChange = (paidAmount: number) => {
    const status = paidAmount >= formData.totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'pending'
    setFormData(prev => ({
      ...prev,
      paidAmount,
      paymentStatus: status
    }))
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    setFormData(prev => ({
      ...prev,
      customerId,
      customerName: customer?.name || ''
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const product = products.find(p => p.id === formData.productId)
    if (!product) return

    if (product.stock < formData.quantity) {
      alert('Insufficient stock!')
      return
    }

    const saleData = {
      ...formData,
      id: `SALE-${Date.now()}`,
      saleDate: new Date(formData.saleDate),
      createdAt: new Date()
    }

    if (selectedSale) {
      updateSale(selectedSale.id, saleData)
      setIsEditDialogOpen(false)
    } else {
      addSale(saleData)
      setIsAddDialogOpen(false)
    }

    // Reset form
    setFormData({
      productId: '',
      customerId: 'walk-in',
      customerName: '',
      quantity: 1,
      unitPrice: 0,
      totalAmount: 0,
      paidAmount: 0,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      saleDate: new Date().toISOString().split('T')[0]
    })
    setSelectedSale(null)
  }

  const handleEdit = (sale: any) => {
    setSelectedSale(sale)
    setFormData({
      productId: sale.productId,
      customerId: sale.customerId || 'walk-in',
      customerName: sale.customerName || '',
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalAmount: sale.totalAmount,
      paidAmount: sale.paidAmount || 0,
      paymentMethod: sale.paymentMethod || 'cash',
      paymentStatus: sale.paymentStatus || 'paid',
      saleDate: (sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate)).toISOString().split('T')[0]
    })
    setIsEditDialogOpen(true)
  }

  const handlePrintReceipt = (sale: any) => {
    setSelectedSale(sale)
    setTimeout(() => {
      handlePrint()
    }, 100)
  }

  // Calculate summary statistics
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  const totalPaid = sales.reduce((sum, sale) => sum + (sale.paidAmount || 0), 0)
  const totalOutstanding = totalRevenue - totalPaid
  const totalTransactions = sales.length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Sales Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Sale</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customer">Customer</Label>
                <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.customerId === 'walk-in' && (
                <div>
                  <Label htmlFor="customerName">Customer Name (Optional)</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="product">Product</Label>
                <Select value={formData.productId} onValueChange={handleProductChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.price.toLocaleString()} MMK (Stock: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="unitPrice">Unit Price (MMK)</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => {
                    const unitPrice = parseFloat(e.target.value) || 0
                    const totalAmount = unitPrice * formData.quantity
                    setFormData(prev => ({
                      ...prev,
                      unitPrice,
                      totalAmount,
                      paidAmount: prev.paidAmount || totalAmount
                    }))
                  }}
                  required
                />
              </div>

              <div>
                <Label htmlFor="totalAmount">Total Amount (MMK)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  readOnly
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="paidAmount">Paid Amount (MMK)</Label>
                <Input
                  id="paidAmount"
                  type="number"
                  min="0"
                  value={formData.paidAmount}
                  onChange={(e) => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Outstanding: {(formData.totalAmount - formData.paidAmount).toLocaleString()} MMK
                </p>
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="saleDate">Sale Date</Label>
                <Input
                  id="saleDate"
                  type="date"
                  value={formData.saleDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, saleDate: e.target.value }))}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                  Add Sale
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
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
                <p className="text-sm font-medium text-blue-500 mb-1">TOTAL PAID</p>
                <p className="text-2xl font-bold text-gray-900">{totalPaid.toLocaleString()} MMK</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
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
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">TRANSACTIONS</p>
                <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
              </div>
              <Package className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by product, SKU, customer, or sale ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => {
                const product = products.find(p => p.id === sale.productId)
                const customer = customers.find(c => c.id === sale.customerId)
                const paidAmount = sale.paidAmount || 0
                const outstanding = (sale.totalAmount || 0) - paidAmount
                
                return (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>{customer?.name || sale.customerName || 'Walk-in'}</TableCell>
                    <TableCell>{product?.name || 'Unknown Product'}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{(sale.unitPrice || 0).toLocaleString()} MMK</TableCell>
                    <TableCell>{(sale.totalAmount || 0).toLocaleString()} MMK</TableCell>
                    <TableCell>{paidAmount.toLocaleString()} MMK</TableCell>
                    <TableCell className={outstanding > 0 ? 'text-red-600' : 'text-green-600'}>
                      {outstanding.toLocaleString()} MMK
                    </TableCell>
                    <TableCell>{(sale.paymentMethod || 'Cash').replace(/^\w/, c => c.toUpperCase())}</TableCell>
                    <TableCell>
                      <Badge variant={
                        (sale.paymentStatus || 'paid') === 'paid' ? 'default' : 
                        (sale.paymentStatus || 'paid') === 'partial' ? 'secondary' : 'destructive'
                      }>
                        {(sale.paymentStatus || 'paid').replace(/^\w/, c => c.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(sale.saleDate instanceof Date ? sale.saleDate : new Date(sale.saleDate)).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintReceipt(sale)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(sale)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>View/Edit Sale</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customer">Customer</Label>
              <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.customerId === 'walk-in' && (
              <div>
                <Label htmlFor="customerName">Customer Name (Optional)</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Enter customer name"
                />
              </div>
            )}

            <div>
              <Label htmlFor="product">Product</Label>
              <Select value={formData.productId} onValueChange={handleProductChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.price.toLocaleString()} MMK (Stock: {product.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div>
              <Label htmlFor="unitPrice">Unit Price (MMK)</Label>
              <Input
                id="unitPrice"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => {
                  const unitPrice = parseFloat(e.target.value) || 0
                  const totalAmount = unitPrice * formData.quantity
                  setFormData(prev => ({
                    ...prev,
                    unitPrice,
                    totalAmount
                  }))
                }}
                required
              />
            </div>

            <div>
              <Label htmlFor="totalAmount">Total Amount (MMK)</Label>
              <Input
                id="totalAmount"
                type="number"
                value={formData.totalAmount}
                readOnly
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="paidAmount">Paid Amount (MMK)</Label>
              <Input
                id="paidAmount"
                type="number"
                min="0"
                value={formData.paidAmount}
                onChange={(e) => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Outstanding: {(formData.totalAmount - formData.paidAmount).toLocaleString()} MMK
              </p>
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="saleDate">Sale Date</Label>
              <Input
                id="saleDate"
                type="date"
                value={formData.saleDate}
                onChange={(e) => setFormData(prev => ({ ...prev, saleDate: e.target.value }))}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                Update Sale
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          {selectedSale && (
            <PrintableReceipt 
              sale={selectedSale}
              product={products.find(p => p.id === selectedSale.productId)}
              customer={customers.find(c => c.id === selectedSale.customerId)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function SalesPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <SalesContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
