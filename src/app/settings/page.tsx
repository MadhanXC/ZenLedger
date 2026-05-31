"use client"

import { useState, useEffect } from "react"
import { 
  Globe, 
  Hash, 
  LogOut, 
  Save, 
  Loader2,
  Palette,
  Check,
  LayoutDashboard,
  Layout,
  Receipt,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from "@/firebase"
import { doc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { cn } from "@/lib/utils"
import { hexToHslValues } from "@/lib/utils"

const THEME_OPTIONS = [
  { id: 'default', name: 'Emerald Slate (Default)', primary: '#334155', accent: '#10b981', background: '#f8fafc' },
  { id: 'blue', name: 'Ocean Blue', primary: '#0f172a', accent: '#3b82f6', background: '#f8fafc' },
  { id: 'purple', name: 'Royal Purple', primary: '#1e1b4b', accent: '#8b5cf6', background: '#f8fafc' },
  { id: 'orange', name: 'Sunset Orange', primary: '#431407', accent: '#f97316', background: '#f8fafc' },
  { id: 'emerald', name: 'Emerald City', primary: '#064e3b', accent: '#059669', background: '#f8fafc' },
  { id: 'rose', name: 'Rose Petal', primary: '#4c0519', accent: '#e11d48', background: '#f8fafc' },
  { id: 'amber', name: 'Golden Amber', primary: '#451a03', accent: '#d97706', background: '#f8fafc' },
  { id: 'midnight', name: 'Midnight Sky', primary: '#020617', accent: '#1e293b', background: '#f8fafc' },
  { id: 'indigo', name: 'Indigo Night', primary: '#1e1b4b', accent: '#6366f1', background: '#f8fafc' },
  { id: 'teal', name: 'Teal & Mint', primary: '#134e4a', accent: '#0d9488', background: '#f8fafc' },
  { id: 'slate', name: 'Slate & Silver', primary: '#334155', accent: '#64748b', background: '#f8fafc' },
  { id: 'forest', name: 'Deep Forest', primary: '#14532d', accent: '#22c55e', background: '#f8fafc' },
  { id: 'crimson', name: 'Crimson Red', primary: '#7f1d1d', accent: '#dc2626', background: '#f8fafc' },
  { id: 'custom', name: 'Custom Branding', primary: '#000000', accent: '#cccccc', background: '#ffffff' },
]

export default function SettingsPage() {
  const { user } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()

  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    defaultTaxRate: "18",
    quotePrefix: "QT-",
    invoicePrefix: "INV-",
    theme: "default",
    customColors: {
      background: "#f8fafc",
      primary: "#0f172a",
      accent: "#10b981"
    }
  })

  const settingsRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "settings", "app")
  }, [db, user])

  const { data: settings, isLoading } = useDoc(settingsRef)

  useEffect(() => {
    if (settings) {
      setFormData({
        currency: settings.currency || "INR",
        dateFormat: settings.dateFormat || "DD/MM/YYYY",
        defaultTaxRate: settings.defaultTaxRate || "18",
        quotePrefix: settings.quotePrefix || "QT-",
        invoicePrefix: settings.invoicePrefix || "INV-",
        theme: settings.theme || "default",
        customColors: settings.customColors || {
          background: "#f8fafc",
          primary: "#0f172a",
          accent: "#10b981"
        }
      })
    }
  }, [settings])

  const handleSave = () => {
    if (!user || !db || !settingsRef || isSaving) return

    setIsSaving(true)
    setDocumentNonBlocking(settingsRef, {
      ...formData,
      id: "app",
      updatedAt: new Date().toISOString()
    }, { merge: true })

    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings Saved",
        description: "Your application preferences and theme have been updated."
      })
    }, 800)
  }

  const handleSignOut = () => {
    if (auth) {
      signOut(auth)
      toast({ title: "Signed Out", description: "You have been successfully logged out." })
    }
  }

  const getPreviewColors = () => {
    if (formData.theme === 'custom') {
      return {
        primary: formData.customColors.primary,
        accent: formData.customColors.accent,
        background: formData.customColors.background
      }
    }
    const theme = THEME_OPTIONS.find(t => t.id === formData.theme) || THEME_OPTIONS[0]
    return {
      primary: theme.primary,
      accent: theme.accent,
      background: theme.background
    }
  }

  const previewColors = getPreviewColors()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="size-8 animate-spin text-accent" />
        <p className="text-muted-foreground text-sm">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Settings</h1>
          <p className="text-muted-foreground">Configure global preferences, system behavior, and branding.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSignOut} className="text-destructive border-destructive/20 hover:bg-destructive/10">
            <LogOut className="size-4 mr-2" /> Logout
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-accent hover:bg-accent/90">
            {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="size-5 text-accent" /> Theme Selection
              </CardTitle>
              <CardDescription>Select a professional preset or customize your business colors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFormData({ ...formData, theme: t.id })}
                    className={cn(
                      "relative flex flex-col p-3 rounded-lg border-2 text-left transition-all hover:border-accent/50",
                      formData.theme === t.id ? "border-accent bg-accent/5" : "border-muted"
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{t.name}</span>
                      {formData.theme === t.id && <Check className="size-3 text-accent" />}
                    </div>
                    <div className="flex gap-1.5">
                      <div className="size-4 rounded-full border shadow-sm" style={{ backgroundColor: t.primary }}></div>
                      <div className="size-4 rounded-full border shadow-sm" style={{ backgroundColor: t.accent }}></div>
                      <div className="size-4 rounded-full border shadow-sm bg-white"></div>
                    </div>
                  </button>
                ))}
              </div>

              {formData.theme === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-xl bg-muted/20 border-dashed">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Primary (Sidebar/UI Base)</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="color" 
                        className="size-8 p-1 cursor-pointer" 
                        value={formData.customColors.primary} 
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          customColors: { ...formData.customColors, primary: e.target.value } 
                        })}
                      />
                      <Input 
                        className="h-8 font-mono text-[10px]" 
                        value={formData.customColors.primary} 
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          customColors: { ...formData.customColors, primary: e.target.value } 
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Accent (Buttons/Highlights)</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="color" 
                        className="size-8 p-1 cursor-pointer" 
                        value={formData.customColors.accent} 
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          customColors: { ...formData.customColors, accent: e.target.value } 
                        })}
                      />
                      <Input 
                        className="h-8 font-mono text-[10px]" 
                        value={formData.customColors.accent} 
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          customColors: { ...formData.customColors, accent: e.target.value } 
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Background</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="color" 
                        className="size-8 p-1 cursor-pointer" 
                        value={formData.customColors.background} 
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          customColors: { ...formData.customColors, background: e.target.value } 
                        })}
                      />
                      <Input 
                        className="h-8 font-mono text-[10px]" 
                        value={formData.customColors.background} 
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          customColors: { ...formData.customColors, background: e.target.value } 
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="size-5 text-accent" /> Regional & Localization
              </CardTitle>
              <CardDescription>Manage how dates and currency are displayed across the app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Base Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(val) => setFormData({ ...formData, currency: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="EUR">Euro (€)</SelectItem>
                      <SelectItem value="GBP">British Pound (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Date Format</Label>
                  <Select 
                    value={formData.dateFormat} 
                    onValueChange={(val) => setFormData({ ...formData, dateFormat: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2023)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2023)</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2023-12-31)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="size-5 text-accent" /> Document Numbering
              </CardTitle>
              <CardDescription>Customize the prefixes used for auto-generating document numbers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Quote Prefix</Label>
                  <Input 
                    placeholder="QT-" 
                    value={formData.quotePrefix}
                    onChange={(e) => setFormData({ ...formData, quotePrefix: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Example: {formData.quotePrefix}001</p>
                </div>
                <div className="grid gap-2">
                  <Label>Invoice Prefix</Label>
                  <Input 
                    placeholder="INV-" 
                    value={formData.invoicePrefix}
                    onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Example: {formData.invoicePrefix}001</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6 border-2 border-accent/20 overflow-hidden shadow-xl">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="size-4 text-accent" /> Live Theme Preview
              </CardTitle>
              <CardDescription className="text-[10px]">How the selected theme will appear globally.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                className="p-6 space-y-6 min-h-[450px]"
                style={{ backgroundColor: previewColors.background }}
              >
                {/* Mock Sidebar and Content */}
                <div className="rounded-xl border shadow-lg overflow-hidden flex bg-white h-72">
                  {/* Mock Sidebar */}
                  <div 
                    className="w-16 flex flex-col items-center py-4 gap-4"
                    style={{ backgroundColor: previewColors.primary }}
                  >
                    <div className="size-8 rounded-full bg-white/20"></div>
                    <div className="size-4 rounded bg-white/10"></div>
                    <div className="size-4 rounded bg-white/10"></div>
                    <div className="size-4 rounded bg-white/10"></div>
                  </div>
                  
                  {/* Mock Content */}
                  <div className="flex-1 p-4 space-y-4 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-slate-200 rounded"></div>
                      <div 
                        className="h-6 w-16 rounded shadow-sm"
                        style={{ backgroundColor: previewColors.accent }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 bg-slate-50 border rounded p-2">
                        <div className="h-1.5 w-10 bg-slate-200 rounded mb-2"></div>
                        <div className="h-3 w-16 bg-slate-400 rounded"></div>
                      </div>
                      <div className="h-12 bg-slate-50 border rounded p-2">
                        <div className="h-1.5 w-10 bg-slate-200 rounded mb-2"></div>
                        <div className="h-3 w-16 bg-slate-400 rounded"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-100 rounded"></div>
                      <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                    </div>

                    <div className="pt-2">
                       <div 
                        className="h-8 w-full rounded flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: previewColors.accent }}
                       >
                         ACTION BUTTON
                       </div>
                    </div>
                  </div>
                </div>

                {/* Mock Components */}
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div 
                      className="px-2 py-1 rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: previewColors.accent }}
                    >
                      Active Status
                    </div>
                    <div className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                      Secondary
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg border bg-white shadow-sm flex items-center gap-3">
                    <div 
                      className="size-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: previewColors.primary }}
                    >
                      <LayoutDashboard className="size-5" />
                    </div>
                    <div>
                      <div className="h-2.5 w-20 bg-slate-200 rounded mb-1.5"></div>
                      <div className="h-2 w-32 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[10px] text-muted-foreground italic font-medium">This is a simulated preview</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
