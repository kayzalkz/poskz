"use client"

import { useState } from 'react'
import ProtectedRoute from "@/components/auth/protected-route"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, CreditCard, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useStore, CreditDebitRecord } from "@/lib/store"

function CreditDebitContent() {
  const { creditDebitRecords, addPaymentToRecord, clearCreditDebitRecord } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<CreditDebitRecord | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'partial' | 'cleared'>('all')
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'kbz_pay',
    kbzPayPhone: '',
    notes: ''
  })

  const filteredRecords = creditDebitRecords.filter(record => {
    const matchesSearch = record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedRecord && paymentData.amount > 0) {
      addPaymentToRecord(selectedRecord.id, {
        amount: paymentData.amount,
        paymentDate: new Date(),
        paymentMethod: paymentData.paymentMethod,
        kbzPayPhone: paymentData.kbzPayPhone,
        notes: paymentData.notes
      })
      
      resetPaymentForm()
      setIsDialogOpen(false)
      setSelectedRecord(null)

      // Refresh the page data to show updated status
      window.location.reload()
    }
  }

  const handleClearRecord = (recordId: string) => {
    if (confirm('Are you sure you want to mark this record as fully paid?')) {
      clearCreditDebitRecord(recordId)
      // Refresh to show updated status
      setTimeout(() => window.location.reload(), 100)
    }
  }

  const resetPaymentForm = () => {
    setPaymentData({
      amount: 0,
      paymentMethod: 'cash',
      kbzPayPhone: '',
      notes: ''
    })
  }

  const openPaymentDialog = (record: CreditDebitRecord) => {
    setSelectedRecord(record)
    setPaymentData({
      ...paymentData,
      amount: record.remainingAmount
    })
    setIsDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'cleared': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'partial': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-red-500" />
      
      case 'pending': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cleared': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'pending': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalPending = creditDebitRecords
    .filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.remainingAmount, 0)

  const totalPartial = creditDebitRecords
    .filter(r => r.status === 'partial')
    .reduce((sum, r) => sum + r.remainingAmount, 0)

  const totalOutstanding = totalPending + totalPartial

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Credit & Debit Management</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">TOTAL OUTSTANDING</p>
                <p className="text-2xl font-bold text-gray-900">{totalOutstanding.toLocaleString()} MMK</p>
              </div>
              <CreditCard className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-500 mb-1">PENDING</p>
                <p className="text-2xl font-bold text-gray-900">{totalPending.toLocaleString()} MMK</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-500 mb-1">PARTIAL</p>
                <p className="text-2xl font-bold text-gray-900">{totalPartial.toLocaleString()} MMK</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-500 mb-1">CLEARED</p>
                <p className="text-2xl font-bold text-gray-900">
                  {creditDebitRecords.filter(r => r.status === 'cleared').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Credit & Debit Records</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="cleared">Cleared</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search records..."
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
                <TableHead>Record ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">#{record.id}</TableCell>
                  <TableCell>
                    <div>
                      <div>{record.customerName}</div>
                      {record.customerPhone && (
                        <div className="text-sm text-gray-500">{record.customerPhone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{record.totalAmount.toLocaleString()} MMK</TableCell>
                  <TableCell>{record.paidAmount.toLocaleString()} MMK</TableCell>
                  <TableCell className="font-medium text-red-600">
                    {record.remainingAmount.toLocaleString()} MMK
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(record.createdAt instanceof Date ? record.createdAt : new Date(record.createdAt)).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {record.status !== 'cleared' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPaymentDialog(record)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Payment
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleClearRecord(record.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Clear
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Customer: {selectedRecord.customerName}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Amount:</span>
                  <span className="ml-2 font-medium">{selectedRecord.totalAmount.toLocaleString()} MMK</span>
                </div>
                <div>
                  <span className="text-gray-500">Paid Amount:</span>
                  <span className="ml-2 font-medium">{selectedRecord.paidAmount.toLocaleString()} MMK</span>
                </div>
                <div>
                  <span className="text-gray-500">Remaining:</span>
                  <span className="ml-2 font-medium text-red-600">{selectedRecord.remainingAmount.toLocaleString()} MMK</span>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max={selectedRecord?.remainingAmount || 0}
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentData.paymentMethod} onValueChange={(value: any) => setPaymentData({ ...paymentData, paymentMethod: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="kbz_pay">KBZ Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentData.paymentMethod === 'kbz_pay' && (
              <div>
                <Label htmlFor="kbzPayPhone">KBZ Pay Phone Number</Label>
                <Input
                  id="kbzPayPhone"
                  value={paymentData.kbzPayPhone}
                  onChange={(e) => setPaymentData({ ...paymentData, kbzPayPhone: e.target.value })}
                  placeholder="09xxxxxxxxx"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                placeholder="Payment notes..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                Add Payment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function CreditDebitPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <CreditDebitContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
