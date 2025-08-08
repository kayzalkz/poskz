"use client"

import { useState } from 'react'
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Search, AlertTriangle, Package } from 'lucide-react'
import { useStore } from "@/lib/store"

export default function InventoryPage() {
  const { products, categories, brands, updateStock } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [stockChange, setStockChange] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = stockFilter === 'all' || 
                         (stockFilter === 'low' && product.stock <= product.minStock && product.stock > 0) ||
                         (stockFilter === 'out' && product.stock === 0)
    
    return matchesSearch && matchesFilter
  })

  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedProduct && stockChange !== 0) {
      updateStock(selectedProduct, stockChange)
      setSelectedProduct('')
      setStockChange(0)
      setIsDialogOpen(false)
    }
  }

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'Unknown'
  const getBrandName = (id: string) => brands.find(b => b.id === id)?.name || 'Unknown'

  const totalProducts = products.length
  const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0).length
  const outOfStockProducts = products.filter(p => p.stock === 0).length
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0)

  return (
    <MainLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Inventory Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <Package className="w-4 h-4 mr-2" />
                Update Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Stock</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleStockUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <select
                    id="product"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Current: {product.stock})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="stockChange">Stock Change</Label>
                  <Input
                    id="stockChange"
                    type="number"
                    value={stockChange}
                    onChange={(e) => setStockChange(parseInt(e.target.value) || 0)}
                    placeholder="Enter positive number to add, negative to subtract"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use positive numbers to add stock, negative numbers to subtract
                  </p>
                </div>

                {selectedProduct && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Stock Update Preview</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Current Stock:</span>
                        <span>{products.find(p => p.id === selectedProduct)?.stock || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Change:</span>
                        <span className={stockChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {stockChange >= 0 ? '+' : ''}{stockChange}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>New Stock:</span>
                        <span>{(products.find(p => p.id === selectedProduct)?.stock || 0) + stockChange}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                    Update Stock
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Inventory Summary */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">TOTAL PRODUCTS</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-500 mb-1">LOW STOCK</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-500 mb-1">OUT OF STOCK</p>
                  <p className="text-2xl font-bold text-gray-900">{outOfStockProducts}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-500 mb-1">TOTAL VALUE</p>
                  <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inventory Overview</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={stockFilter === 'all' ? 'default' : 'outline'}
                    onClick={() => setStockFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={stockFilter === 'low' ? 'default' : 'outline'}
                    onClick={() => setStockFilter('low')}
                  >
                    Low Stock
                  </Button>
                  <Button
                    size="sm"
                    variant={stockFilter === 'out' ? 'default' : 'outline'}
                    onClick={() => setStockFilter('out')}
                  >
                    Out of Stock
                  </Button>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min Stock</TableHead>
                  <TableHead>Unit Cost</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                    <TableCell>{getBrandName(product.brandId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {product.stock}
                        {product.stock <= product.minStock && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.minStock}</TableCell>
                    <TableCell>${product.cost.toFixed(2)}</TableCell>
                    <TableCell>${(product.stock * product.cost).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          product.stock === 0 ? "destructive" : 
                          product.stock <= product.minStock ? "secondary" : 
                          "default"
                        }
                      >
                        {product.stock === 0 ? 'Out of Stock' : 
                         product.stock <= product.minStock ? 'Low Stock' : 
                         'In Stock'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
