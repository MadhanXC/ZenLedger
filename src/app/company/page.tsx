
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Building2, Save, Loader2, FileCheck, Signature, Image as ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase"
import { doc } from "firebase/firestore"

export default function CompanyProfile() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    gstNumber: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankRoutingNumber: "",
    bankBranchName: "",
    logoUrl: "",
    logoSize: 128,
    defaultTerms: "",
    authorizedSignatoryName: "",
    authorizedSignatoryImageUrl: "",
    authorizedSignatoryImageSize: 80,
  })

  const [isSaving, setIsSaving] = useState(false)

  const profileRef = useMemoFirebase(() => {
    if (!user || !db) return null
    return doc(db, "users", user.uid, "companyProfile", "default")
  }, [db, user])

  const { data: profile, isLoading: isDocLoading } = useDoc(profileRef)

  useEffect(() => {
    const defaultBusinessTerms = `1. Payment Terms: Payment is due within 15 days from the date of invoice.
2. Late Payment: Interest at 18% p.a. will be charged for payments delayed beyond the due date.
3. Correspondence: Please quote the invoice/quote number on all correspondence.
4. Returns & Refunds: Goods once sold or services rendered are non-refundable.
5. Delivery: Any discrepancies in items or services must be reported within 48 hours of receipt.
6. Jurisdiction: All disputes are subject to local jurisdiction only.
7. Validity: This document is valid for 30 days from the date of issue unless otherwise specified.
8. Statutory Taxes: GST and other taxes are charged as per prevailing government norms.`

    if (profile) {
      setFormData({
        name: profile.name || "",
        address: profile.address || "",
        contactEmail: profile.contactEmail || "",
        contactPhone: profile.contactPhone || "",
        gstNumber: profile.gstNumber || "",
        bankName: profile.bankName || "",
        bankAccountName: profile.bankAccountName || "",
        bankAccountNumber: profile.bankAccountNumber || "",
        bankRoutingNumber: profile.bankRoutingNumber || "",
        bankBranchName: profile.bankBranchName || "",
        logoUrl: profile.logoUrl || "",
        logoSize: profile.logoSize || 128,
        defaultTerms: profile.defaultTerms || defaultBusinessTerms,
        authorizedSignatoryName: profile.authorizedSignatoryName || "",
        authorizedSignatoryImageUrl: profile.authorizedSignatoryImageUrl || "",
        authorizedSignatoryImageSize: profile.authorizedSignatoryImageSize || 80,
      })
    } else {
      setFormData(prev => ({
        ...prev,
        defaultTerms: defaultBusinessTerms
      }))
    }
  }, [profile])

  const handleSave = () => {
    if (!user || !db || !profileRef || isSaving) return
    
    if (!formData.name || !formData.address || !formData.contactEmail || !formData.contactPhone || !formData.gstNumber) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in all basic company information.",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    const dataToSave = {
      ...formData,
      id: "default",
    }

    setDocumentNonBlocking(profileRef, dataToSave, { merge: true })
    
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Success",
        description: "Company profile updated successfully.",
      })
    }, 800)
  }

  const isLoading = isUserLoading || isDocLoading

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="size-8 animate-spin text-accent" />
        <p className="text-muted-foreground text-sm">Loading your business profile...</p>
      </div>
    )
  }

  const isLogoSvg = formData.logoUrl?.trim().startsWith('<svg')
  const isSignSvg = formData.authorizedSignatoryImageUrl?.trim().startsWith('<svg')
  
  const initials = formData.name
    ? formData.name
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 3)
    : "CP"

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
          <p className="text-muted-foreground">Manage your business information for professional quotes and invoices.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-accent hover:bg-accent/90">
          {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-8 pb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-accent" /> Basic Information
            </CardTitle>
            <CardDescription>This information will appear on all your generated documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div 
                className="rounded-lg border bg-muted/20 overflow-hidden flex items-center justify-center shrink-0"
                style={{ width: formData.logoSize, height: formData.logoSize }}
              >
                {formData.logoUrl ? (
                  isLogoSvg ? (
                    <div 
                      className="w-full h-full p-2 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                      dangerouslySetInnerHTML={{ __html: formData.logoUrl }}
                    />
                  ) : (
                    <img src={formData.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center bg-accent/10 w-full h-full text-accent">
                    <span className="font-black" style={{ fontSize: formData.logoSize * 0.3 }}>{initials}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 w-full space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="logo-input">Company Logo (URL or SVG Tag)</Label>
                  <Textarea 
                    id="logo-input" 
                    placeholder="Paste an image URL or raw <svg> tag" 
                    className="min-h-[80px] font-mono text-xs"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Logo Display Size: {formData.logoSize}px</Label>
                  </div>
                  <Slider 
                    value={[formData.logoSize]} 
                    max={300} 
                    min={60} 
                    step={1} 
                    onValueChange={(val) => setFormData({ ...formData, logoSize: val[0] })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="company-name">Company Legal Name</Label>
                  <Input 
                    id="company-name" 
                    placeholder="Acme Dynamics Ltd." 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 border-t pt-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Business Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gst">GST Number</Label>
                <Input 
                  id="gst" 
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Registered Address</Label>
              <Textarea 
                id="address" 
                className="min-h-[100px] whitespace-pre-wrap" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="size-5 text-accent" /> Document Defaults
            </CardTitle>
            <CardDescription>Default terms and signatory for your documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="signatory">Authorized Signatory Name</Label>
                    <div className="relative">
                      <Signature className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input 
                        id="signatory" 
                        className="pl-9"
                        placeholder="e.g. Aswathy T M"
                        value={formData.authorizedSignatoryName}
                        onChange={(e) => setFormData({ ...formData, authorizedSignatoryName: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="sign-image">Signature Image (URL or SVG)</Label>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-3 size-4 text-muted-foreground" />
                      <Textarea 
                        id="sign-image" 
                        className="pl-9 min-h-[80px] font-mono text-xs"
                        placeholder="Signature URL or <svg>..."
                        value={formData.authorizedSignatoryImageUrl}
                        onChange={(e) => setFormData({ ...formData, authorizedSignatoryImageUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Signature Display Size: {formData.authorizedSignatoryImageSize}px</Label>
                    </div>
                    <Slider 
                      value={[formData.authorizedSignatoryImageSize]} 
                      max={200} 
                      min={40} 
                      step={1} 
                      onValueChange={(val) => setFormData({ ...formData, authorizedSignatoryImageSize: val[0] })}
                    />
                  </div>
                </div>

                <div className="rounded-lg border bg-slate-50 p-4 flex flex-col items-center justify-center min-h-[180px] gap-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Signature Preview</p>
                  <div 
                    className="flex items-center justify-center border-b border-slate-300 pb-2 mb-2"
                    style={{ height: formData.authorizedSignatoryImageSize, width: '100%' }}
                  >
                    {formData.authorizedSignatoryImageUrl ? (
                      isSignSvg ? (
                        <div 
                          className="w-full h-full p-1 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                          dangerouslySetInnerHTML={{ __html: formData.authorizedSignatoryImageUrl }}
                        />
                      ) : (
                        <img src={formData.authorizedSignatoryImageUrl} alt="Signature Preview" className="max-w-full max-h-full object-contain" />
                      )
                    ) : (
                      <div className="text-slate-300 italic text-xs">No signature image</div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900">{formData.authorizedSignatoryName || "Signatory Name"}</p>
                </div>
              </div>

              <div className="grid gap-2 border-t pt-6">
                <Label htmlFor="terms">Default Terms & Conditions</Label>
                <Textarea 
                  id="terms" 
                  placeholder="1. Payment is due within 15 days..." 
                  className="min-h-[250px] whitespace-pre-wrap text-sm"
                  value={formData.defaultTerms}
                  onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input id="bank-name" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-name">Account Holder Name</Label>
              <Input id="account-name" placeholder="E.g. Zenith Solutions Ltd" value={formData.bankAccountName} onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input id="account-number" value={formData.bankAccountNumber} onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ifsc">IFSC / Routing Code</Label>
              <Input id="ifsc" value={formData.bankRoutingNumber} onChange={(e) => setFormData({ ...formData, bankRoutingNumber: e.target.value })} />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="branch-name">Branch Name</Label>
              <Input id="branch-name" placeholder="E.g. MG Road, Bengaluru" value={formData.bankBranchName} onChange={(e) => setFormData({ ...formData, bankBranchName: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
