"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthState, createDefaultAdmin, verifyPassword, hashPassword } from './auth'

// Add date conversion utilities at the top of the file after imports
const convertDatesToObjects = (obj: any): any => {
  if (obj === null || obj === undefined) return obj
  
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
    return new Date(obj)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertDatesToObjects)
  }
  
  if (typeof obj === 'object') {
    const converted: any = {}
    for (const key in obj) {
      if (key.includes('Date') || key.includes('At')) {
        converted[key] = new Date(obj[key])
      } else {
        converted[key] = convertDatesToObjects(obj[key])
      }
    }
    return converted
  }
  
  return obj
}

export interface Category {
  id: string
  name: string
  description: string
  createdAt: Date
}

export interface Brand {
  id: string
  name: string
  description: string
  createdAt: Date
}

export interface Attribute {
  id: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'select'
  options?: string[]
  createdAt: Date
}

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  creditBalance: number // Positive = customer owes us, Negative = we owe customer
  createdAt: Date
}

export interface Supplier {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  contactPerson?: string
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  cost: number
  sku: string
  categoryId: string
  brandId: string
  supplierId?: string
  stock: number
  minStock: number
  attributes: Record<string, any>
  createdAt: Date
}

export interface CompanyProfile {
  id: string
  name: string
  logo?: string
  address: string
  phone: string
  email: string
  website?: string
  taxId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Sale {
  id: string
  productId: string
  customerId?: string
  quantity: number
  unitPrice: number
  totalAmount: number
  paidAmount: number
  customerName: string
  customerPhone?: string
  paymentMethod: 'cash' | 'credit' | 'kbz_pay'
  paymentStatus: 'paid' | 'pending' | 'partial'
  kbzPayPhone?: string
  saleDate: Date
  createdAt: Date
  isPrinted: boolean
}

export interface CreditDebitRecord {
  id: string
  saleId: string
  customerId?: string
  customerName: string
  customerPhone?: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  dueDate?: Date
  status: 'pending' | 'partial' | 'cleared'
  payments: Payment[]
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  id: string
  amount: number
  paymentDate: Date
  paymentMethod: 'cash' | 'kbz_pay'
  kbzPayPhone?: string
  notes?: string
}

export interface StockMovement {
  id: string
  productId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason: string
  reference?: string // Sale ID, Purchase ID, etc.
  createdAt: Date
  createdBy: string
}

interface Store extends AuthState {
  // Company Profile
  companyProfile: CompanyProfile | null
  
  // Auth functions
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  
  // User management
  users: User[]
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  resetUserPassword: (id: string, newPassword: string) => Promise<void>
  changePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<boolean>
  
  // Company profile
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void
  
  // Customer management
  customers: Customer[]
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'creditBalance'>) => void
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  updateCustomerBalance: (id: string, amount: number) => void
  
  // Supplier management
  suppliers: Supplier[]
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => void
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void
  deleteSupplier: (id: string) => void
  
  // Stock movements
  stockMovements: StockMovement[]
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void
  
  // Existing store properties
  categories: Category[]
  brands: Brand[]
  attributes: Attribute[]
  products: Product[]
  sales: Sale[]
  creditDebitRecords: CreditDebitRecord[]
  
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  
  // Brand actions
  addBrand: (brand: Omit<Brand, 'id' | 'createdAt'>) => void
  updateBrand: (id: string, brand: Partial<Brand>) => void
  deleteBrand: (id: string) => void
  
  // Attribute actions
  addAttribute: (attribute: Omit<Attribute, 'id' | 'createdAt'>) => void
  updateAttribute: (id: string, attribute: Partial<Attribute>) => void
  deleteAttribute: (id: string) => void
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  updateStock: (id: string, quantity: number) => void
  
  // Sale actions
  addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'isPrinted'>) => string
  updateSale: (id: string, sale: Partial<Sale>) => void
  deleteSale: (id: string) => void
  markSaleAsPrinted: (id: string) => void
  
  // Credit/Debit actions
  addCreditDebitRecord: (record: Omit<CreditDebitRecord, 'id' | 'createdAt' | 'updatedAt'>) => void
  addPaymentToRecord: (recordId: string, payment: Omit<Payment, 'id'>) => void
  clearCreditDebitRecord: (recordId: string) => void
  
  // Initialize store
  initializeStore: () => Promise<void>
}

// Update the persist configuration to include date conversion
export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      isAuthenticated: false,
      
      // Company profile
      companyProfile: {
        id: 'company-001',
        name: 'My Company',
        address: 'Company Address',
        phone: '+95-9-123456789',
        email: 'info@company.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Users
      users: [],
      
      // Customers and Suppliers
      customers: [],
      suppliers: [],
      
      // Stock movements
      stockMovements: [],
      
      // Auth functions
      login: async (username: string, password: string) => {
        const { users } = get()
        const user = users.find(u => u.username === username && u.isActive)
        
        if (user && await verifyPassword(password, user.password)) {
          set({ 
            user: { ...user, lastLogin: new Date() }, 
            isAuthenticated: true 
          })
          return true
        }
        return false
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      
      // User management
      addUser: async (userData) => {
        const hashedPassword = await hashPassword(userData.password)
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          password: hashedPassword,
          createdAt: new Date()
        }
        set(state => ({ users: [...state.users, newUser] }))
      },
      
      updateUser: (id, userData) => {
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, ...userData } : u)
        }))
      },
      
      deleteUser: (id) => {
        set(state => ({
          users: state.users.filter(u => u.id !== id)
        }))
      },
      
      resetUserPassword: async (id, newPassword) => {
        const hashedPassword = await hashPassword(newPassword)
        set(state => ({
          users: state.users.map(u => 
            u.id === id ? { ...u, password: hashedPassword } : u
          )
        }))
      },
      
      changePassword: async (userId, oldPassword, newPassword) => {
        const { users } = get()
        const user = users.find(u => u.id === userId)
        
        if (user && await verifyPassword(oldPassword, user.password)) {
          const hashedPassword = await hashPassword(newPassword)
          set(state => ({
            users: state.users.map(u => 
              u.id === userId ? { ...u, password: hashedPassword } : u
            )
          }))
          return true
        }
        return false
      },
      
      // Company profile
      updateCompanyProfile: (profileData) => {
        set(state => ({
          companyProfile: state.companyProfile ? {
            ...state.companyProfile,
            ...profileData,
            updatedAt: new Date()
          } : null
        }))
      },
      
      // Customer management
      addCustomer: (customer) => set((state) => ({
        customers: [...state.customers, { 
          ...customer, 
          id: Date.now().toString(), 
          creditBalance: 0,
          createdAt: new Date() 
        }]
      })),
      
      updateCustomer: (id, customer) => set((state) => ({
        customers: state.customers.map(c => c.id === id ? { ...c, ...customer } : c)
      })),
      
      deleteCustomer: (id) => set((state) => ({
        customers: state.customers.filter(c => c.id !== id)
      })),
      
      updateCustomerBalance: (id, amount) => set((state) => ({
        customers: state.customers.map(c => 
          c.id === id ? { ...c, creditBalance: c.creditBalance + amount } : c
        )
      })),
      
      // Supplier management
      addSupplier: (supplier) => set((state) => ({
        suppliers: [...state.suppliers, { 
          ...supplier, 
          id: Date.now().toString(), 
          createdAt: new Date() 
        }]
      })),
      
      updateSupplier: (id, supplier) => set((state) => ({
        suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...supplier } : s)
      })),
      
      deleteSupplier: (id) => set((state) => ({
        suppliers: state.suppliers.filter(s => s.id !== id)
      })),
      
      // Stock movements
      addStockMovement: (movement) => set((state) => ({
        stockMovements: [...state.stockMovements, {
          ...movement,
          id: Date.now().toString(),
          createdAt: new Date()
        }]
      })),
      
      // Initialize with sample data
      categories: [
        { id: '1', name: 'Electronics', description: 'Electronic devices and accessories', createdAt: new Date() },
        { id: '2', name: 'Clothing', description: 'Apparel and fashion items', createdAt: new Date() },
        { id: '3', name: 'Books', description: 'Books and educational materials', createdAt: new Date() },
      ],
      brands: [
        { id: '1', name: 'Apple', description: 'Premium technology products', createdAt: new Date() },
        { id: '2', name: 'Samsung', description: 'Consumer electronics', createdAt: new Date() },
        { id: '3', name: 'Nike', description: 'Sports and lifestyle brand', createdAt: new Date() },
      ],
      attributes: [
        { id: '1', name: 'Color', type: 'select', options: ['Red', 'Blue', 'Green', 'Black', 'White'], createdAt: new Date() },
        { id: '2', name: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL'], createdAt: new Date() },
        { id: '3', name: 'Weight', type: 'number', createdAt: new Date() },
      ],
      products: [
        {
          id: '1',
          name: 'iPhone 15',
          description: 'Latest iPhone model',
          price: 1500000,
          cost: 1200000,
          sku: 'IPH15-001',
          categoryId: '1',
          brandId: '1',
          stock: 50,
          minStock: 10,
          attributes: { color: 'Black', weight: 171 },
          createdAt: new Date()
        },
        {
          id: '2',
          name: 'Samsung Galaxy S24',
          description: 'Premium Android smartphone',
          price: 1300000,
          cost: 1000000,
          sku: 'SGS24-001',
          categoryId: '1',
          brandId: '2',
          stock: 30,
          minStock: 5,
          attributes: { color: 'Blue', weight: 168 },
          createdAt: new Date()
        }
      ],
      sales: [],
      creditDebitRecords: [],

      // Category actions
      addCategory: (category) => set((state) => ({
        categories: [...state.categories, { ...category, id: Date.now().toString(), createdAt: new Date() }]
      })),
      updateCategory: (id, category) => set((state) => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...category } : c)
      })),
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(c => c.id !== id)
      })),

      // Brand actions
      addBrand: (brand) => set((state) => ({
        brands: [...state.brands, { ...brand, id: Date.now().toString(), createdAt: new Date() }]
      })),
      updateBrand: (id, brand) => set((state) => ({
        brands: state.brands.map(b => b.id === id ? { ...b, ...brand } : b)
      })),
      deleteBrand: (id) => set((state) => ({
        brands: state.brands.filter(b => b.id !== id)
      })),

      // Attribute actions
      addAttribute: (attribute) => set((state) => ({
        attributes: [...state.attributes, { ...attribute, id: Date.now().toString(), createdAt: new Date() }]
      })),
      updateAttribute: (id, attribute) => set((state) => ({
        attributes: state.attributes.map(a => a.id === id ? { ...a, ...attribute } : a)
      })),
      deleteAttribute: (id) => set((state) => ({
        attributes: state.attributes.filter(a => a.id !== id)
      })),

      // Product actions
      addProduct: (product) => set((state) => ({
        products: [...state.products, { ...product, id: Date.now().toString(), createdAt: new Date() }]
      })),
      updateProduct: (id, product) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...product } : p)
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      updateStock: (id, quantity) => set((state) => {
        const { user, addStockMovement } = get()
        addStockMovement({
          productId: id,
          type: quantity > 0 ? 'in' : 'out',
          quantity: Math.abs(quantity),
          reason: 'Manual adjustment',
          createdBy: user?.id || 'system'
        })
        
        return {
          products: state.products.map(p => p.id === id ? { ...p, stock: p.stock + quantity } : p)
        }
      }),

      // Sale actions
      addSale: (sale) => {
        const saleId = Date.now().toString()
        const newSale: Sale = {
          ...sale,
          id: saleId,
          paidAmount: sale.paidAmount || 0, // Ensure paidAmount is always a number
          createdAt: new Date(),
          isPrinted: false
        }
        
        set((state) => {
          const product = state.products.find(p => p.id === sale.productId)
          if (product && product.stock >= sale.quantity) {
            const updatedProducts = state.products.map(p => 
              p.id === sale.productId ? { ...p, stock: p.stock - sale.quantity } : p
            )
            
            // Add stock movement
            const { user, addStockMovement } = get()
            addStockMovement({
              productId: sale.productId,
              type: 'out',
              quantity: sale.quantity,
              reason: 'Sale',
              reference: saleId,
              createdBy: user?.id || 'system'
            })
            
            // Update customer balance if applicable
            if (sale.customerId && (sale.paidAmount || 0) < sale.totalAmount) {
              const balanceChange = sale.totalAmount - (sale.paidAmount || 0)
              get().updateCustomerBalance(sale.customerId, balanceChange)
            }
            
            // Create credit/debit record if payment method is credit or partial payment
            let updatedCreditDebitRecords = state.creditDebitRecords
            if (sale.paymentMethod === 'credit' || (sale.paidAmount || 0) < sale.totalAmount) {
              const paidAmount = sale.paidAmount || 0
              const creditRecord: CreditDebitRecord = {
                id: `credit-${saleId}`,
                saleId: saleId,
                customerId: sale.customerId,
                customerName: sale.customerName,
                customerPhone: sale.customerPhone,
                totalAmount: sale.totalAmount,
                paidAmount: paidAmount,
                remainingAmount: sale.totalAmount - paidAmount,
                status: paidAmount === 0 ? 'pending' : 
                        paidAmount < sale.totalAmount ? 'partial' : 'cleared',
                payments: paidAmount > 0 ? [{
                  id: Date.now().toString(),
                  amount: paidAmount,
                  paymentDate: new Date(),
                  paymentMethod: sale.paymentMethod === 'credit' ? 'cash' : sale.paymentMethod,
                  kbzPayPhone: sale.kbzPayPhone
                }] : [],
                createdAt: new Date(),
                updatedAt: new Date()
              }
              updatedCreditDebitRecords = [...state.creditDebitRecords, creditRecord]
            }
            
            return {
              sales: [...state.sales, newSale],
              products: updatedProducts,
              creditDebitRecords: updatedCreditDebitRecords
            }
          }
          return state
        })
        
        return saleId
      },
      
      updateSale: (id, saleData) => set((state) => ({
        sales: state.sales.map(s => s.id === id ? { ...s, ...saleData } : s)
      })),
      
      deleteSale: (id) => set((state) => ({
        sales: state.sales.filter(s => s.id !== id)
      })),
      
      markSaleAsPrinted: (id) => set((state) => ({
        sales: state.sales.map(s => s.id === id ? { ...s, isPrinted: true } : s)
      })),
      
      // Credit/Debit actions
      addCreditDebitRecord: (record) => set((state) => ({
        creditDebitRecords: [...state.creditDebitRecords, {
          ...record,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date()
        }]
      })),
      
      addPaymentToRecord: (recordId, payment) => set((state) => {
        const updatedRecords = state.creditDebitRecords.map(record => {
          if (record.id === recordId) {
            const newPayment: Payment = {
              ...payment,
              id: Date.now().toString()
            }
            const updatedPaidAmount = record.paidAmount + payment.amount
            const updatedRemainingAmount = record.totalAmount - updatedPaidAmount
            const updatedStatus = updatedRemainingAmount <= 0 ? 'cleared' : 
                                updatedPaidAmount > 0 ? 'partial' : 'pending'
            
            // Update corresponding sale status
            const sale = state.sales.find(s => s.id === record.saleId)
            if (sale) {
              get().updateSale(sale.id, {
                paidAmount: updatedPaidAmount,
                paymentStatus: updatedStatus
              })
            }
            
            // Update customer balance
            if (record.customerId) {
              get().updateCustomerBalance(record.customerId, -payment.amount)
            }
            
            return {
              ...record,
              payments: [...record.payments, newPayment],
              paidAmount: updatedPaidAmount,
              remainingAmount: updatedRemainingAmount,
              status: updatedStatus,
              updatedAt: new Date()
            }
          }
          return record
        })
        
        return { creditDebitRecords: updatedRecords }
      }),
      
      clearCreditDebitRecord: (recordId) => set((state) => {
        const record = state.creditDebitRecords.find(r => r.id === recordId)
        if (record) {
          // Update corresponding sale status
          const sale = state.sales.find(s => s.id === record.saleId)
          if (sale) {
            get().updateSale(sale.id, {
              paidAmount: record.totalAmount,
              paymentStatus: 'paid'
            })
          }
          
          // Update customer balance
          if (record.customerId) {
            get().updateCustomerBalance(record.customerId, -record.remainingAmount)
          }
        }
        
        return {
          creditDebitRecords: state.creditDebitRecords.map(record =>
            record.id === recordId ? {
              ...record,
              status: 'cleared' as const,
              paidAmount: record.totalAmount,
              remainingAmount: 0,
              updatedAt: new Date()
            } : record
          )
        }
      }),
      
      // Initialize store
      initializeStore: async () => {
        const { users } = get()
        if (users.length === 0) {
          const defaultAdmin = await createDefaultAdmin()
          set({ users: [defaultAdmin] })
        }
      }
    }),
    {
      name: 'inventory-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects and ensure paidAmount exists
          state.categories = state.categories.map(convertDatesToObjects)
          state.brands = state.brands.map(convertDatesToObjects)
          state.attributes = state.attributes.map(convertDatesToObjects)
          state.products = state.products.map(convertDatesToObjects)
          state.sales = state.sales.map((sale: any) => ({
            ...convertDatesToObjects(sale),
            paidAmount: sale.paidAmount || 0 // Ensure paidAmount is always a number
          }))
          state.creditDebitRecords = state.creditDebitRecords.map(convertDatesToObjects)
          state.users = state.users.map(convertDatesToObjects)
          state.customers = state.customers?.map(convertDatesToObjects) || []
          state.suppliers = state.suppliers?.map(convertDatesToObjects) || []
          state.stockMovements = state.stockMovements?.map(convertDatesToObjects) || []
          if (state.companyProfile) {
            state.companyProfile = convertDatesToObjects(state.companyProfile)
          }
        }
      }
    }
  )
)
