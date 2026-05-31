"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft,
  Download,
  Edit,
  Check,
  Loader2,
  Landmark,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase"
import { doc, collection, query, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { generatePDF } from "@/lib/pdf-generator"

export default function InvoiceDetailPage({ params }: { params: Promise<{ invoiceId: string }> }) {
  const router = useRouter()
  const { invoiceId } = use(params)
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  const invoiceRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "invoices", invoiceId)
  }, [db, user, invoiceId])

  const lineItemsRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "invoices", invoiceId, "lineItems"), orderBy("order"))
  }, [db, user, invoiceId])

  const { data: invoice, isLoading: isInvoiceLoading } = useDoc(invoiceRef)
  const { data: lineItems, isLoading: isItemsLoading } = useCollection(lineItemsRef)

  const clientRef = useMemoFirebase(() => {
    if (!db || !user || !invoice || !invoice.clientId || invoice.clientId === "one-time") return null
    return doc(db, "users", user.uid, "clients", invoice.clientId)
  }, [db, user, invoice])

  const { data: client } = useDoc(clientRef)

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "companyProfile", "default")
  }, [db, user])

  const { data: companyProfile } = useDoc(profileRef)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  }

  const handleUpdateStatus = (status: string) => {
    if (!invoiceRef || !user) return
    updateDocumentNonBlocking(invoiceRef, { 
      paymentStatus: status,
      updatedAt: new Date().toISOString()
    })
    toast({
      title: "Status Updated",
      description: `Invoice set to ${status}`,
    })
  }

  const handleDownloadPdf = async () => {
    if (!invoice || !lineItems || !companyProfile) return;
    setIsGenerating(true);
    try {
      await generatePDF('invoice', invoice, lineItems, companyProfile, client);
      toast({ title: "Success", description: "Invoice downloaded" });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  }

  if (isInvoiceLoading || isItemsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Invoice not found or access denied.</p>
        <Button onClick={() => router.push("/invoices")}>Back to Invoices</Button>
      </div>
    )
  }

  const isSvg = companyProfile?.logoUrl?.trim().startsWith('<svg')
  const initials = companyProfile?.name
    ? companyProfile.name.split(/\s+/).filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 3)
    : "CP"
  const logoSize = (companyProfile?.logoSize || 128) * 0.8

  const clientName = invoice.clientId === "one-time" ? invoice.oneTimeClientName : client?.name
  const clientAddress = invoice.clientId === "one-time" ? invoice.oneTimeClientAddress : client?.address

  const isSignSvg = companyProfile?.authorizedSignatoryImageUrl?.trim().startsWith('<svg')
  const signSize = companyProfile?.authorizedSignatoryImageSize || 80

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/invoices")}>
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice Details</h1>
            <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Check className="size-4 mr-2" /> Status: {invoice.paymentStatus}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleUpdateStatus("Paid")}>Mark as Paid</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus("Pending")}>Mark as Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpdateStatus("Overdue")}>Mark as Overdue</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={() => router.push(`/invoices/new?edit=${invoice.id}`)}>
            <Edit className="size-4 mr-2" /> Edit
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="bg-accent text-white hover:bg-accent/90"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Download className="size-4 mr-2" />}
            Download PDF
          </Button>
        </div>
      </div>

      <div className="print-container">
        <Card className="print-card shadow-2xl border-none bg-white text-slate-900 overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col items-start">
                <div 
                  className="mb-4 flex items-center justify-center border rounded-md overflow-hidden bg-slate-50"
                  style={{ width: logoSize, height: logoSize }}
                >
                  {companyProfile?.logoUrl ? (
                    isSvg ? (
                      <div 
                        className="w-full h-full p-2 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                        dangerouslySetInnerHTML={{ __html: companyProfile.logoUrl }}
                      />
                    ) : (
                      <img src={companyProfile.logoUrl} alt="Company Logo" className="max-w-full max-h-full object-contain" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-accent bg-accent/10">
                      <span className="font-black" style={{ fontSize: logoSize * 0.3 }}>{initials}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-start text-left">
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">INVOICE</h2>
                  <p className="text-[11px] text-slate-900 font-bold mt-2 uppercase tracking-wider">{invoice.invoiceNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-black leading-tight mb-2">{companyProfile?.name || "YOUR COMPANY NAME"}</p>
                <p className="text-[10px] text-slate-500 whitespace-pre-wrap leading-relaxed max-w-[280px] ml-auto">
  {companyProfile?.address || "Your Registered Address"}
</p>

{companyProfile?.gstNumber && (
  <p className="text-[10px] text-slate-900 mt-2 font-mono font-bold uppercase tracking-wider">
    GSTIN: {companyProfile.gstNumber}
  </p>
)}

{companyProfile?.contactPhone && (
  <p className="text-[10px] text-slate-900 mt-1">
    Phone: {companyProfile.contactPhone}
  </p>
)}

{companyProfile?.contactEmail && (
  <p className="text-[10px] text-slate-900">
    Email: {companyProfile.contactEmail}
  </p>
)}
                  
                
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 mb-8 pt-4 border-t border-slate-900">
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-2">Billed To</p>
                <p className="font-bold text-base text-slate-900 mb-1">{clientName || "Client Name"}</p>
                <p className="text-[10px] text-slate-500 whitespace-pre-wrap leading-relaxed max-w-[320px]">{clientAddress || "Client Address"}</p>
              </div>
              <div className="text-right">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold"><span className="text-slate-400">Issue Date:</span> <span className="text-slate-900 ml-2">{new Date(invoice.issueDate).toLocaleDateString('en-IN')}</span></p>
                  <p className="text-[10px] uppercase font-bold"><span className="text-slate-400">Due Date:</span> <span className="text-rose-600 ml-2">{new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span></p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-900 overflow-hidden mb-8 shadow-sm">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-900 text-left">
                    <th className="p-3 text-center text-slate-900 font-bold uppercase text-[9px] tracking-widest w-12">#</th>
                    <th className="p-4 text-slate-900 font-bold uppercase text-[9px] tracking-widest">Description</th>
                    <th className="p-4 text-center text-slate-900 font-bold uppercase text-[9px] tracking-widest">Unit</th>
                    <th className="p-4 text-center text-slate-900 font-bold uppercase text-[9px] tracking-widest">Qty</th>
                    <th className="p-4 text-right text-slate-900 font-bold uppercase text-[9px] tracking-widest">Rate</th>
                    <th className="p-4 text-right text-slate-900 font-bold uppercase text-[9px] tracking-widest">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {lineItems?.map((item, i) => (
                    <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-3 text-center text-slate-900 font-mono font-bold">{i + 1}</td>
                      <td className="p-4 text-slate-700 text-left whitespace-pre-wrap font-medium">{item.description}</td>
                      <td className="p-4 text-center text-slate-700 uppercase text-[9px] font-bold">{item.unit}</td>
                      <td className="p-4 text-center text-slate-700">{item.quantity}</td>
                      <td className="p-4 text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-4 text-right font-bold text-slate-900">{formatCurrency(item.totalLineItemAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-8">
              {invoice.notes && (
                <div className="max-w-[500px]">
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                    <MessageSquare className="size-3" /> Notes
                  </p>
                  <p className="text-[10px] text-slate-600 whitespace-pre-wrap italic leading-relaxed">{invoice.notes}</p>
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1 text-left w-full">
                  {companyProfile?.bankAccountNumber && (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 w-full md:max-w-md">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
                        <Landmark className="size-3" /> Bank & Payment Details
                      </p>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[10px]">
                        <div className="space-y-1.5">
                          <p><span className="text-slate-400">Bank:</span> <span className="font-bold text-slate-900">{companyProfile.bankName}</span></p>
                          <p><span className="text-slate-400">A/C Name:</span> <span className="font-bold text-slate-900">{companyProfile.bankAccountName || companyProfile.name}</span></p>
                          <p><span className="text-slate-400">Account #:</span> <span className="font-mono font-bold text-slate-900">{companyProfile.bankAccountNumber}</span></p>
                        </div>
                        <div className="space-y-1.5">
                          <p><span className="text-slate-400">IFSC / Routing:</span> <span className="font-mono font-bold text-slate-900">{companyProfile.bankRoutingNumber}</span></p>
                          <p><span className="text-slate-400">Branch:</span> <span className="font-bold text-slate-900">{companyProfile.bankBranchName || "-"}</span></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-auto flex flex-col items-center">
                  <div className="text-right mb-6 w-full md:w-64">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-400 uppercase font-bold">Subtotal</span>
                      <span className="text-slate-900 font-bold">{formatCurrency(invoice.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] mb-2">
                      <span className="text-slate-400 uppercase font-bold">GST ({invoice.isGstEnabled ? (invoice.totalAmount > 0 ? Math.round((invoice.totalGSTAmount / invoice.totalAmount) * 100) : 18) : 0}%)</span>
                      <span className="text-slate-900 font-bold">{formatCurrency(invoice.totalGSTAmount)}</span>
                    </div>
                    <Separator className="bg-slate-900 mb-2" />
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-900 text-[10px] uppercase font-black tracking-widest">Total Payable</span>
                      <span className="text-accent text-2xl font-black">{formatCurrency(invoice.totalAmount + invoice.totalGSTAmount)}</span>
                    </div>
                  </div>

                  {(invoice.authorizedSignatory || companyProfile?.authorizedSignatoryName) && (
                    <div className="text-center flex flex-col items-center justify-center min-w-[200px]">
                      <div className="flex flex-col items-center justify-center border-b border-slate-300 pb-2 mb-2 w-full">
                        {companyProfile?.authorizedSignatoryImageUrl ? (
                          <div 
                            className="flex items-center justify-center"
                            style={{ height: signSize / 1.5 }}
                          >
                            {isSignSvg ? (
                              <div 
                                className="w-full h-full p-1 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                                dangerouslySetInnerHTML={{ __html: companyProfile.authorizedSignatoryImageUrl }}
                              />
                            ) : (
                              <img src={companyProfile.authorizedSignatoryImageUrl} alt="Authorized Signature" className="max-w-full max-h-full object-contain" />
                            )}
                          </div>
                        ) : (
                          <div className="h-8" />
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900 mb-0.5 text-center">{invoice.authorizedSignatory || companyProfile.authorizedSignatoryName}</p>
                      <p className="text-[9px] uppercase font-bold text-slate-400 text-center tracking-wider">Authorized Signatory</p>
                    </div>
                  )}
                </div>
              </div>

              {invoice.termsConditions && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-2">Terms & Conditions</p>
                  <p className="text-[8px] text-slate-500 whitespace-pre-wrap leading-relaxed">{invoice.termsConditions}</p>
                </div>
              )}
            </div>

            <div className="mt-20 pt-8 border-t border-slate-200 text-center">
              <p className="text-[10px] text-slate-300 font-black tracking-[0.5em] uppercase">Thank you for your business</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}