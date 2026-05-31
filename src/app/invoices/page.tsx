"use client";

import { useState } from "react";
import {
  Receipt,
  Search,
  Download,
  MoreVertical,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Check,
  Trash2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCollection,
  useUser,
  useMemoFirebase,
  useFirestore,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { exportToCSV } from "@/lib/csv-export";
import { useToast } from "@/hooks/use-toast";

export default function InvoicesPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");

  const invoicesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "invoices"),
      orderBy("issueDate", "desc"),
    );
  }, [db, user]);

  const clientsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "clients"));
  }, [db, user]);

  const { data: invoices, isLoading } = useCollection(invoicesQuery);
  const { data: clients } = useCollection(clientsQuery);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const getClientName = (inv: any) => {
    if (inv.clientId === "one-time") {
      return inv.oneTimeClientName || "One-time Client";
    }
    return (
      clients?.find((c) => c.id === inv.clientId)?.name || "Unknown Client"
    );
  };

  const handleUpdateStatus = (invoiceId: string, status: string) => {
    if (!db || !user) return;
    const invoiceRef = doc(db, "users", user.uid, "invoices", invoiceId);
    updateDocumentNonBlocking(invoiceRef, {
      paymentStatus: status,
      updatedAt: new Date().toISOString(),
    });
    toast({
      title: "Status Updated",
      description: `Invoice set to ${status}`,
    });
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (!user || !db) return;
    const invoiceRef = doc(db, "users", user.uid, "invoices", invoiceId);
    deleteDocumentNonBlocking(invoiceRef);
    toast({ title: "Deleted", description: "Invoice removed successfully." });
  };

  const handleExportCSV = () => {
    if (!invoices) return;
    const exportData = invoices.map((inv) => ({
      "Invoice Number": inv.invoiceNumber,
      Client: getClientName(inv),
      "Client Address":
        inv.clientId === "one-time"
          ? inv.oneTimeClientAddress || ""
          : clients?.find((c) => c.id === inv.clientId)?.address || "",
      "Issue Date": new Date(inv.issueDate).toLocaleDateString("en-IN"),
      "Due Date": new Date(inv.dueDate).toLocaleDateString("en-IN"),
      Subtotal: inv.totalAmount,
      "GST Amount": inv.totalGSTAmount || 0,
      "Total Amount": inv.totalAmount + (inv.totalGSTAmount || 0),
      "Payment Status": inv.paymentStatus,
      Notes: inv.notes || "",
      Terms: inv.termsConditions || "",
    }));
    exportToCSV(exportData, "Invoices_Export");
  };

  const filteredInvoices =
    invoices?.filter(
      (inv) =>
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName(inv).toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const calculateSum = (status: string) => {
    return (
      invoices
        ?.filter((i) => i.paymentStatus === status)
        .reduce(
          (acc, i) => acc + (i.totalAmount + (i.totalGSTAmount || 0)),
          0,
        ) || 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage billings, payments, and track receivables.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="size-4 mr-2" /> Export CSV
          </Button>
          <Button asChild className="bg-accent hover:bg-accent/90">
            <Link href="/invoices/new">
              <Receipt className="size-4 mr-2" /> New Invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Pending
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(calculateSum("Pending"))}
            </p>
          </div>
          <Clock className="size-8 text-accent opacity-50" />
        </div>
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Overdue
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(calculateSum("Overdue"))}
            </p>
          </div>
          <AlertTriangle className="size-8 text-destructive opacity-50" />
        </div>
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Paid
            </p>
            <p className="text-2xl font-bold">
              {formatCurrency(calculateSum("Paid"))}
            </p>
          </div>
          <CheckCircle className="size-8 text-emerald-500 opacity-50" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number or client..."
            className="pl-9 bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <div className="font-mono text-xs font-semibold">
                      {inv.invoiceNumber}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getClientName(inv)}
                  </TableCell>
                  <TableCell>
                    {new Date(inv.issueDate).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(
                      inv.totalAmount + (inv.totalGSTAmount || 0),
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.paymentStatus === "Paid"
                          ? "default"
                          : inv.paymentStatus === "Overdue"
                            ? "destructive"
                            : "secondary"
                      }
                      className="rounded-full px-3"
                    >
                      {inv.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        asChild
                        title="View"
                      >
                        <Link href={`/invoices/${inv.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() =>
                          router.push(`/invoices/new?edit=${inv.id}`)
                        }
                        title="Edit"
                      >
                        <Edit className="size-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently remove
                              invoice <strong>{inv.invoiceNumber}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteInvoice(inv.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/invoices/new?duplicate=${inv.id}`}
                              className="flex items-center"
                            >
                              <Copy className="size-4 mr-2" /> Duplicate Invoice
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/invoices/${inv.id}`}
                              className="flex items-center"
                            >
                              <Download className="size-4 mr-2" /> Download PDF
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Check className="size-4 mr-2" /> Update Status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(inv.id, "Paid")
                                }
                              >
                                Mark as Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(inv.id, "Pending")
                                }
                              >
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(inv.id, "Overdue")
                                }
                              >
                                Mark as Overdue
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
