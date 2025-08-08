"use client"

import bcrypt from 'bcryptjs'

export interface User {
  id: string
  username: string
  password: string
  role: 'admin' | 'user'
  fullName: string
  email?: string
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Hash password function
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Verify password function
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

// Default admin user
export const createDefaultAdmin = async (): Promise<User> => {
  const hashedPassword = await hashPassword('kayzal')
  return {
    id: 'admin-001',
    username: 'admin',
    password: hashedPassword,
    role: 'admin',
    fullName: 'System Administrator',
    email: 'admin@company.com',
    createdAt: new Date(),
    isActive: true
  }
}
