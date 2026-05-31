"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Receipt,
  Download,
  FileDown,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCollection,
  useUser,
  useMemoFirebase,
  useFirestore,
  deleteDocumentNonBlocking,
} from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { exportToCSV } from "@/lib/csv-export";

export default function QuotesPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");

  const quotesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "quotes"),
      orderBy("issueDate", "desc"),
    );
  }, [db, user]);

  const clientsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "clients"));
  }, [db, user]);

  const { data: quotes, isLoading } = useCollection(quotesQuery);
  const { data: clients } = useCollection(clientsQuery);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle2 className="size-3 mr-1" />;
      case "Sent":
        return <Clock className="size-3 mr-1" />;
      case "Draft":
        return <FileDown className="size-3 mr-1" />;
      case "Rejected":
        return <AlertCircle className="size-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default";
      case "Sent":
        return "secondary";
      case "Draft":
        return "outline";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getClientName = (quote: any) => {
    if (quote.clientId === "one-time") {
      return quote.oneTimeClientName || "One-time Client";
    }
    return (
      clients?.find((c) => c.id === quote.clientId)?.name || "Unknown Client"
    );
  };

  const handleExportCSV = () => {
    if (!quotes) return;
    const exportData = quotes.map((quote) => ({
      "Quote Number": quote.quoteNumber,
      Client: getClientName(quote),
      "Client Address":
        quote.clientId === "one-time"
          ? quote.oneTimeClientAddress || ""
          : clients?.find((c) => c.id === quote.clientId)?.address || "",
      "Issue Date": new Date(quote.issueDate).toLocaleDateString("en-IN"),
      "Valid Until": new Date(quote.validUntilDate).toLocaleDateString("en-IN"),
      Subtotal: quote.totalAmount,
      "GST Amount": quote.totalGSTAmount || 0,
      "Total Amount": quote.totalAmount + (quote.totalGSTAmount || 0),
      Status: quote.status,
      Notes: quote.notes || "",
      Terms: quote.termsConditions || "",
    }));
    exportToCSV(exportData, "Quotes_Export");
  };

  const handleDeleteQuote = (quoteId: string) => {
    if (!user || !db) return;
    const quoteRef = doc(db, "users", user.uid, "quotes", quoteId);
    deleteDocumentNonBlocking(quoteRef);
    toast({ title: "Deleted", description: "Quote removed successfully." });
  };

  const filteredQuotes =
    quotes?.filter(
      (quote) =>
        quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName(quote).toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quotes & Estimates
          </h1>
          <p className="text-muted-foreground">
            Generate and track professional proposals for your clients.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="size-4 mr-2" /> Export CSV
          </Button>
          <Button asChild className="bg-accent hover:bg-accent/90">
            <Link href="/quotes/new">
              <Plus className="size-4 mr-2" /> Create New Quote
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by quote number or client..."
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
              <TableHead className="w-[150px]">Quote #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
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
                  Loading quotes...
                </TableCell>
              </TableRow>
            ) : filteredQuotes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No quotes found.
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-mono text-xs font-semibold">
                    <Link
                      href={`/quotes/${quote.id}`}
                      className="text-accent hover:underline"
                    >
                      {quote.quoteNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getClientName(quote)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(quote.issueDate).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(
                      quote.totalAmount + (quote.totalGSTAmount || 0),
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusVariant(quote.status) as any}
                      className="flex items-center w-fit"
                    >
                      {getStatusIcon(quote.status)}
                      {quote.status}
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
                        <Link href={`/quotes/${quote.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() =>
                          router.push(`/quotes/new?edit=${quote.id}`)
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
                            <AlertDialogTitle>Delete Quote?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will permanently delete quote{" "}
                              <strong>{quote.quoteNumber}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteQuote(quote.id)}
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
                          <DropdownMenuLabel>Manage Document</DropdownMenuLabel>
                          <DropdownMenuItem
                            asChild
                            className="text-accent font-semibold"
                          >
                            <Link href={`/quotes/new?duplicate=${quote.id}`}>
                              <Copy className="size-4 mr-2" /> Duplicate Quote
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            asChild
                            className="text-accent font-semibold"
                          >
                            <Link href={`/invoices/new?fromQuote=${quote.id}`}>
                              <Receipt className="size-4 mr-2" /> Convert to
                              Invoice
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/quotes/${quote.id}`}>
                              <Download className="size-4 mr-2" /> Download PDF
                            </Link>
                          </DropdownMenuItem>
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
