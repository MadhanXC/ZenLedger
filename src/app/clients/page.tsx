
"use client"

import { useState } from "react"
import { 
  Plus, 
  Search, 
  Filter,
  Loader2,
  Download,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { exportToCSV } from "@/lib/csv-export"

export default function ClientsPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [viewingClient, setViewingClient] = useState<any | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: ""
  })

  const clientsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "clients"), orderBy("name"))
  }, [db, user])

  const { data: clients, isLoading } = useCollection(clientsQuery)

  const handleExportCSV = () => {
    if (!clients) return
    const exportData = clients.map(c => ({
      "Company Name": c.name,
      "Contact Person": c.contactPerson || "",
      "Email": c.contactEmail,
      "Phone": c.contactPhone || "",
      "GSTIN": c.gstNumber || "",
      "Billing Address": c.address || ""
    }))
    exportToCSV(exportData, "Clients_Export")
  }

  const resetForm = () => {
    setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", gstNumber: "" })
    setEditingClientId(null)
  }

  const handleOpenDialog = (client?: any) => {
    if (client) {
      setEditingClientId(client.id)
      setFormData({
        name: client.name,
        contactPerson: client.contactPerson || "",
        email: client.contactEmail,
        phone: client.contactPhone || "",
        address: client.address || "",
        gstNumber: client.gstNumber || ""
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleViewDetails = (client: any) => {
    setViewingClient(client)
    setIsViewOpen(true)
  }

  const handleSave = () => {
    if (!user || !db || isSaving) return
    if (!formData.name || !formData.email) {
      toast({ title: "Error", description: "Name and Email are required.", variant: "destructive" })
      return
    }

    setIsSaving(true)
    const clientsRef = collection(db, "users", user.uid, "clients")
    const docId = editingClientId || doc(clientsRef).id
    const targetRef = doc(db, "users", user.uid, "clients", docId)
    
    const clientData = {
      id: docId,
      name: formData.name,
      contactPerson: formData.contactPerson,
      contactEmail: formData.email,
      contactPhone: formData.phone,
      address: formData.address,
      gstNumber: formData.gstNumber,
      updatedAt: new Date().toISOString()
    }

    setDocumentNonBlocking(targetRef, clientData, { merge: true })
    
    setTimeout(() => {
      setIsSaving(false)
      toast({ 
        title: "Success", 
        description: editingClientId ? "Client profile updated." : "Client added successfully." 
      })
      setIsDialogOpen(false)
      resetForm()
    }, 800)
  }

  const handleDeleteClient = (clientId: string) => {
    if (!user || !db) return
    const clientRef = doc(db, "users", user.uid, "clients", clientId)
    deleteDocumentNonBlocking(clientRef)
    toast({ title: "Deleted", description: "Client removed from database." })
  }

  const filteredClients = clients?.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your customer database and track their history.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="size-4 mr-2" /> Export CSV
          </Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => handleOpenDialog()}>
            <Plus className="size-4 mr-2" /> Add New Client
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search clients by name, contact or email..." 
            className="pl-9 bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="size-4" />
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Client</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading clients...</TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No clients found.</TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id} className="group">
                  <TableCell>
                    <div className="font-semibold">{client.name}</div>
                    <div className="text-xs text-muted-foreground">{client.contactEmail}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{client.contactPerson || "—"}</div>
                    <div className="text-xs text-muted-foreground">{client.contactPhone || "—"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-mono">{client.gstNumber || "—"}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => handleViewDetails(client)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenDialog(client)}>
                        <Edit2 className="size-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 text-destructive">
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Client Profile?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove "{client.name}"? This action cannot be undone and will remove them from your active client list.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteClient(client.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingClientId ? 'Edit Client Profile' : 'Add New Client'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client-name">Company Name</Label>
              <Input 
                id="client-name" 
                placeholder="Acme Inc." 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact-person">Contact Person</Label>
                <Input 
                  id="contact-person" 
                  placeholder="John Doe" 
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-email">Email Address</Label>
                <Input 
                  id="client-email" 
                  type="email" 
                  placeholder="john@acme.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client-phone">Phone Number</Label>
                <Input 
                  id="client-phone" 
                  placeholder="+91 98765 43210" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-gst">GST Number</Label>
                <Input 
                  id="client-gst" 
                  placeholder="27AAAAA0000A1Z5" 
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-address">Billing Address</Label>
              <Textarea 
                id="client-address" 
                placeholder="123 Street, City, State, ZIP" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button className="bg-accent" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
              {editingClientId ? 'Update Profile' : 'Create Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Client Information</DialogTitle>
          </DialogHeader>
          {viewingClient && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xl">
                  {viewingClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-none">{viewingClient.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{viewingClient.contactEmail}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Contact Person</Label>
                  <p className="text-sm font-medium">{viewingClient.contactPerson || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Phone</Label>
                  <p className="text-sm font-medium">{viewingClient.contactPhone || "—"}</p>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">GST Number</Label>
                <p className="text-sm font-mono">{viewingClient.gstNumber || "Not Provided"}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Billing Address</Label>
                <p className="text-sm text-slate-600 bg-muted/30 p-3 rounded-md italic leading-relaxed">
                  {viewingClient.address || "No address on file."}
                </p>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                  <CheckCircle2 className="size-3" /> Standard Billing Client
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={() => setIsViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
