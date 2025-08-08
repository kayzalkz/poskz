"use client"

import { useState } from 'react'
import ProtectedRoute from "@/components/auth/protected-route"
import MainLayout from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building, Save, Upload } from 'lucide-react'
import { useStore } from "@/lib/store"

function CompanyProfileContent() {
  const { companyProfile, updateCompanyProfile } = useStore()
  const [formData, setFormData] = useState({
    name: companyProfile?.name || '',
    address: companyProfile?.address || '',
    phone: companyProfile?.phone || '',
    email: companyProfile?.email || '',
    website: companyProfile?.website || '',
    taxId: companyProfile?.taxId || '',
    logo: companyProfile?.logo || ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      updateCompanyProfile(formData)
      alert('Company profile updated successfully!')
    } catch (error) {
      alert('Error updating company profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setFormData({ ...formData, logo: result })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Company Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Company Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              {formData.logo ? (
                <img 
                  src={formData.logo || "/placeholder.svg"} 
                  alt="Company Logo" 
                  className="w-32 h-32 mx-auto object-contain border rounded-lg"
                />
              ) : (
                <div className="w-32 h-32 mx-auto bg-gray-100 border rounded-lg flex items-center justify-center">
                  <Building className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Logo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Information Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://www.example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="taxId">Tax ID / Business Registration Number</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Company Profile Preview */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Profile Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {formData.logo && (
              <img 
                src={formData.logo || "/placeholder.svg"} 
                alt="Company Logo" 
                className="w-20 h-20 object-contain border rounded-lg"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{formData.name || 'Company Name'}</h2>
              <div className="space-y-1 text-gray-600">
                <p>{formData.address || 'Company Address'}</p>
                <p>Phone: {formData.phone || 'Phone Number'}</p>
                <p>Email: {formData.email || 'Email Address'}</p>
                {formData.website && <p>Website: {formData.website}</p>}
                {formData.taxId && <p>Tax ID: {formData.taxId}</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CompanyProfilePage() {
  return (
    <ProtectedRoute requireAdmin>
      <MainLayout>
        <CompanyProfileContent />
      </MainLayout>
    </ProtectedRoute>
  )
}
