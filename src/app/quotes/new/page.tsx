"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  FileSignature,
  Calculator,
  Eye,
  FileText,
  Search,
  MessageSquare,
  Loader2,
  UserPlus,
  Users,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
  setDocumentNonBlocking,
  useDoc,
} from "@/firebase";
import { collection, query, orderBy, doc, getDocs } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function ManageQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const duplicateId = searchParams.get("duplicate");

  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isSaving, setIsSaving] = useState(false);
  const [isOneTimeClient, setIsOneTimeClient] = useState(false);
  const [isGstEnabled, setIsGstEnabled] = useState(true);
  const [globalGstRate, setGlobalGstRate] = useState(18);
  const [clientId, setClientId] = useState("");
  const [oneTimeClientName, setOneTimeClientName] = useState("");
  const [oneTimeClientAddress, setOneTimeClientAddress] = useState("");

  const [quoteNumber, setQuoteNumber] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState([
    { id: "1", description: "", quantity: 1, unitPrice: 0, unit: "Project" },
  ]);

  const clientsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "users", user.uid, "clients"), orderBy("name"));
  }, [db, user]);

  const catalogQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "users", user.uid, "productServices"),
      orderBy("name"),
    );
  }, [db, user]);

  const { data: clients } = useCollection(clientsQuery);
  const { data: catalogItems } = useCollection(catalogQuery);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid, "companyProfile", "default");
  }, [db, user]);

  const { data: companyProfile } = useDoc(profileRef);

  const existingQuoteRef = useMemoFirebase(() => {
    if (!db || !user || !editId) return null;
    return doc(db, "users", user.uid, "quotes", editId);
  }, [db, user, editId]);
  const { data: existingQuote, isLoading: isQuoteLoading } =
    useDoc(existingQuoteRef);

  const duplicateQuoteRef = useMemoFirebase(() => {
    if (!db || !user || !duplicateId) return null;
    return doc(db, "users", user.uid, "quotes", duplicateId);
  }, [db, user, duplicateId]);
  const { data: duplicateQuote, isLoading: isDuplicateLoading } =
    useDoc(duplicateQuoteRef);

  useEffect(() => {
    if (!editId && user && db && !quoteNumber) {
      const fetchCount = async () => {
        const q = query(collection(db, "users", user.uid, "quotes"));
        const snap = await getDocs(q);
        const nextNum = (snap.size + 1).toString().padStart(3, "0");
        setQuoteNumber(`QT-${nextNum}`);
      };
      fetchCount();
    }
  }, [user, db, editId, quoteNumber]);

  useEffect(() => {
    if (existingQuote) {
      setClientId(existingQuote.clientId || "");
      setIsOneTimeClient(
        !existingQuote.clientId || existingQuote.clientId === "one-time",
      );
      setOneTimeClientName(existingQuote.oneTimeClientName || "");
      setOneTimeClientAddress(existingQuote.oneTimeClientAddress || "");
      setQuoteNumber(existingQuote.quoteNumber || "");
      setIssueDate(
        existingQuote.issueDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
      );
      setValidUntil(
        existingQuote.validUntilDate?.split("T")[0] ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
      );
      setNotes(existingQuote.notes || "");
      setIsGstEnabled(
        existingQuote.totalGSTAmount > 0 ||
          existingQuote.isGstEnabled !== false,
      );

      if (
        existingQuote.totalAmount > 0 &&
        (existingQuote.totalGSTAmount || 0) > 0
      ) {
        setGlobalGstRate(
          Math.round(
            ((existingQuote.totalGSTAmount || 0) / existingQuote.totalAmount) *
              100,
          ),
        );
      }

      const loadLineItems = async () => {
        if (!user || !db || !editId) return;
        try {
          const linesRef = collection(
            db,
            "users",
            user.uid,
            "quotes",
            editId,
            "lineItems",
          );
          const q = query(linesRef, orderBy("order"));
          const snap = await getDocs(q);
          const lines = snap.docs.map((d) => ({
            ...(d.data() as any),
            id: d.id,
          }));
          if (lines.length > 0) {
            setLineItems(lines);
          }
        } catch (err) {
          console.error("Error loading line items:", err);
        }
      };
      loadLineItems();
    }
  }, [existingQuote, db, user, editId]);

  useEffect(() => {
    if (duplicateQuote && !editId) {
      setClientId(duplicateQuote.clientId || "");
      setIsOneTimeClient(
        !duplicateQuote.clientId || duplicateQuote.clientId === "one-time",
      );
      setOneTimeClientName(duplicateQuote.oneTimeClientName || "");
      setOneTimeClientAddress(duplicateQuote.oneTimeClientAddress || "");
      setIssueDate(
        duplicateQuote.issueDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
      );
      setValidUntil(
        duplicateQuote.validUntilDate?.split("T")[0] ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
      );
      setNotes(duplicateQuote.notes || "");
      setIsGstEnabled(
        duplicateQuote.totalGSTAmount > 0 ||
          duplicateQuote.isGstEnabled !== false,
      );
      if (
        duplicateQuote.totalAmount > 0 &&
        (duplicateQuote.totalGSTAmount || 0) > 0
      ) {
        setGlobalGstRate(
          Math.round(
            ((duplicateQuote.totalGSTAmount || 0) /
              duplicateQuote.totalAmount) *
              100,
          ),
        );
      }

      const loadLineItems = async () => {
        if (!user || !db || !duplicateId) return;
        try {
          const linesRef = collection(
            db,
            "users",
            user.uid,
            "quotes",
            duplicateId,
            "lineItems",
          );
          const q = query(linesRef, orderBy("order"));
          const snap = await getDocs(q);
          const lines = snap.docs.map((d) => ({
            ...(d.data() as any),
            id: d.id,
          }));
          if (lines.length > 0) {
            setLineItems(lines);
          }
        } catch (err) {
          console.error("Error loading duplicate quote line items:", err);
        }
      };
      loadLineItems();
    }
  }, [duplicateQuote, db, user, duplicateId, editId]);

  const selectedClient = useMemo(() => {
    if (isOneTimeClient) {
      return { name: oneTimeClientName, address: oneTimeClientAddress };
    }
    return clients?.find((c) => c.id === clientId);
  }, [
    clients,
    clientId,
    isOneTimeClient,
    oneTimeClientName,
    oneTimeClientAddress,
  ]);

  const totals = useMemo(() => {
    let subtotal = 0;
    lineItems.forEach((item) => {
      const qty = parseFloat(item.quantity?.toString()) || 0;
      const price = parseFloat(item.unitPrice?.toString()) || 0;
      subtotal += qty * price;
    });
    const totalGst = isGstEnabled ? subtotal * (globalGstRate / 100) : 0;
    return { subtotal, totalGst, total: subtotal + totalGst };
  }, [lineItems, isGstEnabled, globalGstRate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Math.random().toString(36).substring(2, 9),
        description: "",
        quantity: 1,
        unitPrice: 0,
        unit: "Project",
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleCatalogSelect = (itemId: string, lineId: string) => {
    const item = catalogItems?.find((i) => i.id === itemId);
    if (item) {
      setLineItems((prev) =>
        prev.map((li) =>
          li.id === lineId
            ? {
                ...li,
                description: `${item.name}\n${item.description || ""}`,
                unitPrice: item.unitPrice,
                unit: item.unit || "Project",
              }
            : li,
        ),
      );
    }
  };

  const handleSave = () => {
    if (!user || !db || isSaving) return;

    if (!isOneTimeClient && !clientId) {
      toast({
        title: "Error",
        description: "Please select a client or use one-time entry.",
        variant: "destructive",
      });
      return;
    }
    if (isOneTimeClient && !oneTimeClientName) {
      toast({
        title: "Error",
        description: "Please enter client name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const quoteId =
      editId || doc(collection(db, "users", user.uid, "quotes")).id;
    const quoteRef = doc(db, "users", user.uid, "quotes", quoteId);

    const newQuote = {
      id: quoteId,
      clientId: isOneTimeClient ? "one-time" : clientId,
      oneTimeClientName: isOneTimeClient ? oneTimeClientName : null,
      oneTimeClientAddress: isOneTimeClient ? oneTimeClientAddress : null,
      companyProfileId: "default",
      quoteNumber,
      issueDate: new Date(issueDate).toISOString(),
      validUntilDate: new Date(validUntil).toISOString(),
      status: editId ? existingQuote?.status || "Draft" : "Draft",
      totalAmount: totals.subtotal,
      totalGSTAmount: totals.totalGst,
      isGstEnabled,
      notes,
      termsConditions: companyProfile?.defaultTerms || "",
      authorizedSignatory: companyProfile?.authorizedSignatoryName || "",
      createdAt: existingQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDocumentNonBlocking(quoteRef, newQuote, { merge: true });

    lineItems.forEach((item, index) => {
      const lineItemRef = doc(
        db,
        "users",
        user.uid,
        "quotes",
        quoteId,
        "lineItems",
        item.id,
      );
      const lineItemData = {
        id: item.id,
        quoteId: quoteId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unit: item.unit || "Project",
        totalLineItemAmount: (item.quantity || 0) * (item.unitPrice || 0),
        order: index,
      };
      setDocumentNonBlocking(lineItemRef, lineItemData, { merge: true });
    });

    toast({
      title: "Success",
      description: editId ? "Quote updated." : "Quote created.",
    });
    setTimeout(() => {
      setIsSaving(false);
      router.push("/quotes");
    }, 1000);
  };

  const logoSize = companyProfile?.logoSize || 128;
  const isSvg = companyProfile?.logoUrl?.trim().startsWith("<svg");
  const initials = companyProfile?.name
    ? companyProfile.name
        .split(/\s+/)
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 3)
    : "CP";

  const isSignSvg = companyProfile?.authorizedSignatoryImageUrl
    ?.trim()
    .startsWith("<svg");
  const signSize = companyProfile?.authorizedSignatoryImageSize || 80;

  if ((editId && isQuoteLoading) || (duplicateId && isDuplicateLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="size-8 animate-spin text-accent" />
        <p className="text-muted-foreground text-sm">Loading quote data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
              {editId ? "Edit Quote" : "Quote Maker"}
            </h1>
            <p className="hidden sm:block text-muted-foreground text-sm">
              Draft professional estimates with real-time preview.
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-accent hover:bg-accent/90 w-full sm:w-auto"
        >
          {isSaving ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Save className="size-4 mr-2" />
          )}
          {editId ? "Update Quote" : "Save Quote"}
        </Button>
      </div>

      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full sm:w-auto">
          <TabsTrigger value="editor" className="flex-1 sm:flex-none gap-2">
            <FileText className="size-4" /> Edit Details
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1 sm:flex-none gap-2">
            <Eye className="size-4" /> Document Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileSignature className="size-5 text-accent" /> Document
                    Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
                  <div className="grid gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/20 rounded-lg border border-dashed gap-4">
                      <div className="flex items-center gap-3">
                        {isOneTimeClient ? (
                          <UserPlus className="size-5 text-accent" />
                        ) : (
                          <Users className="size-5 text-accent" />
                        )}
                        <div>
                          <p className="text-sm font-semibold">
                            {isOneTimeClient
                              ? "One-time Client Entry"
                              : "Registered Client Selection"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Toggle to manual entry if client is not in database.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="one-time-toggle" className="text-xs">
                          One-time Client?
                        </Label>
                        <Switch
                          id="one-time-toggle"
                          checked={isOneTimeClient}
                          onCheckedChange={setIsOneTimeClient}
                        />
                      </div>
                    </div>

                    {isOneTimeClient ? (
                      <div className="grid gap-4 p-4 border rounded-lg">
                        <div className="grid gap-2">
                          <Label>Client Name</Label>
                          <Input
                            placeholder="E.g. Mr. Smith / Acme Corp"
                            value={oneTimeClientName || ""}
                            onChange={(e) =>
                              setOneTimeClientName(e.target.value)
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Billing Address</Label>
                          <Textarea
                            placeholder="Full address details..."
                            value={oneTimeClientAddress || ""}
                            onChange={(e) =>
                              setOneTimeClientAddress(e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        <Label htmlFor="client">Select Registered Client</Label>
                        <Select
                          value={clientId || ""}
                          onValueChange={setClientId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a client..." />
                          </SelectTrigger>
                          <SelectContent>
                            {clients?.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quote-number">Quote Number</Label>
                        <Input
                          id="quote-number"
                          value={quoteNumber || ""}
                          onChange={(e) => setQuoteNumber(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="issue-date">Issue Date</Label>
                        <Input
                          id="issue-date"
                          type="date"
                          value={issueDate || ""}
                          onChange={(e) => setIssueDate(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="valid-until">Valid Until</Label>
                        <Input
                          id="valid-until"
                          type="date"
                          value={validUntil || ""}
                          onChange={(e) => setValidUntil(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-bold uppercase text-muted-foreground tracking-wider">
                        Line Items
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-accent border-accent/20"
                        onClick={addLineItem}
                      >
                        <Plus className="size-3 mr-1" /> Add New Row
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {lineItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg bg-muted/10">
                          <p className="text-xs text-muted-foreground italic mb-2">
                            No items added to this quote.
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={addLineItem}
                            className="h-8 text-[10px] font-bold"
                          >
                            <Plus className="size-3 mr-1" /> Start Adding
                          </Button>
                        </div>
                      ) : (
                        lineItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-12 gap-2 sm:gap-4 items-start bg-muted/20 p-3 sm:p-4 rounded-lg border border-dashed relative"
                          >
                            <div className="col-span-12 flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                                Item #{index + 1}
                              </span>
                            </div>
                            <div className="col-span-12 md:col-span-5 grid gap-1.5">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                                Description
                              </Label>
                              <div className="flex gap-1">
                                <Select
                                  onValueChange={(val) =>
                                    handleCatalogSelect(val, item.id)
                                  }
                                >
                                  <SelectTrigger className="w-[40px] px-0 justify-center h-10 shrink-0">
                                    <Search className="size-4" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {catalogItems?.map((ci) => (
                                      <SelectItem key={ci.id} value={ci.id}>
                                        {ci.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Textarea
                                  placeholder="Service details..."
                                  value={item.description || ""}
                                  onChange={(e) =>
                                    updateLineItem(
                                      item.id,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 min-h-[80px] text-sm"
                                />
                              </div>
                            </div>
                            <div className="col-span-4 md:col-span-2 grid gap-1.5">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                                Unit
                              </Label>
                              <Input
                                placeholder="Unit"
                                value={item.unit || ""}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    "unit",
                                    e.target.value,
                                  )
                                }
                                className="text-xs px-2 h-10"
                              />
                            </div>
                            <div className="col-span-2 md:col-span-1 grid gap-1.5">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                                Qty
                              </Label>
                              <Input
                                type="number"
                                value={item.quantity || 0}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    "quantity",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="text-sm px-1 h-10"
                              />
                            </div>
                            <div className="col-span-3 md:col-span-2 grid gap-1.5">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                                Rate (₹)
                              </Label>
                              <Input
                                type="number"
                                value={item.unitPrice || 0}
                                onChange={(e) =>
                                  updateLineItem(
                                    item.id,
                                    "unitPrice",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="text-sm px-2 h-10"
                              />
                            </div>
                            <div className="col-span-3 md:col-span-2 grid gap-1.5">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                                Total
                              </Label>
                              <div className="h-10 flex items-center px-2 bg-background border rounded-md text-xs font-bold truncate">
                                {formatCurrency(
                                  (item.quantity || 0) * (item.unitPrice || 0),
                                )}
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 sm:static sm:col-span-1 sm:flex sm:justify-center sm:pt-6">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:bg-destructive/10"
                                onClick={() => removeLineItem(item.id)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="notes"
                        className="flex items-center gap-2"
                      >
                        <MessageSquare className="size-4 text-muted-foreground" />{" "}
                        Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any specific notes for this client..."
                        value={notes || ""}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="h-fit lg:sticky lg:top-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calculator className="size-5 text-accent" /> Quote
                      Summary
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="gst-toggle"
                        className="text-xs font-bold uppercase text-muted-foreground"
                      >
                        Enable GST
                      </Label>
                      <Switch
                        id="gst-toggle"
                        checked={isGstEnabled}
                        onCheckedChange={setIsGstEnabled}
                      />
                    </div>
                    {isGstEnabled && (
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="gst-rate-global"
                          className="text-[10px] uppercase font-bold"
                        >
                          GST Rate (%)
                        </Label>
                        <Input
                          id="gst-rate-global"
                          type="number"
                          value={globalGstRate || 0}
                          onChange={(e) =>
                            setGlobalGstRate(parseFloat(e.target.value) || 0)
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {isGstEnabled && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Estimated GST ({globalGstRate}%)
                      </span>
                      <span>{formatCurrency(totals.totalGst)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-xl">
                    <span>Grand Total</span>
                    <span className="text-accent">
                      {formatCurrency(totals.total)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-4 border-t">
                  <p className="text-[10px] text-muted-foreground text-center w-full">
                    Tax is applied on the document subtotal.
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <div className="overflow-x-auto pb-8 w-full">
            <Card className="min-w-[700px] max-w-[800px] mx-auto shadow-2xl overflow-hidden border-none bg-white text-slate-900">
              <div className="p-8 sm:p-12">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <div
                      className="mb-6 flex items-center justify-center border rounded-md overflow-hidden bg-slate-50"
                      style={{ width: logoSize, height: logoSize }}
                    >
                      {companyProfile?.logoUrl ? (
                        isSvg ? (
                          <div
                            className="w-full h-full p-2 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                            dangerouslySetInnerHTML={{
                              __html: companyProfile.logoUrl,
                            }}
                          />
                        ) : (
                          <img
                            src={companyProfile.logoUrl}
                            alt="Company Logo"
                            className="max-w-full max-h-full object-contain"
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-accent bg-accent/10">
                          <span
                            className="font-black"
                            style={{ fontSize: logoSize * 0.3 }}
                          >
                            {initials}
                          </span>
                        </div>
                      )}
                    </div>
                    <h2 className="text-4xl font-black mb-1 text-slate-900 uppercase">
                      QUOTE
                    </h2>
                    <p className="text-slate-400 font-mono text-xs tracking-wider">
                      {quoteNumber || ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-black">
                      {companyProfile?.name || "YOUR COMPANY NAME"}
                    </p>

                    <p className="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed max-w-[250px] ml-auto">
                      {companyProfile?.address || "Your Registered Address"}
                    </p>

                    {companyProfile?.gstNumber && (
                      <p className="text-sm text-slate-500 mt-2">
                        GSTIN: {companyProfile.gstNumber}
                      </p>
                    )}

                    {companyProfile?.contactPhone && (
                      <p className="text-sm text-slate-500">
                        Phone: {companyProfile.contactPhone}
                      </p>
                    )}

                    {companyProfile?.contactEmail && (
                      <p className="text-sm text-slate-500">
                        Email: {companyProfile.contactEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">
                      Quote For
                    </p>
                    <p className="font-bold text-lg text-slate-900">
                      {selectedClient?.name || "[Select Client]"}
                    </p>
                    <p className="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed max-w-[300px]">
                      {selectedClient?.address ||
                        "Client Address details will appear here."}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Issue Date
                        </p>
                        <p className="font-medium text-slate-700">
                          {issueDate || ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Valid Until
                        </p>
                        <p className="font-medium text-slate-700">
                          {validUntil || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 overflow-hidden mb-8 shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-left">
                        <th className="p-4 text-center text-slate-900 font-bold uppercase text-[10px] tracking-widest w-12">
                          #
                        </th>
                        <th className="p-4 text-slate-900 font-bold uppercase text-[10px] tracking-widest">
                          Description
                        </th>
                        <th className="p-4 text-center text-slate-900 font-bold uppercase text-[10px] tracking-widest">
                          Unit
                        </th>
                        <th className="p-4 text-center text-slate-900 font-bold uppercase text-[10px] tracking-widest">
                          Qty
                        </th>
                        <th className="p-4 text-right text-slate-900 font-bold uppercase text-[10px] tracking-widest">
                          Rate
                        </th>
                        <th className="p-4 text-right text-slate-900 font-bold uppercase text-[10px] tracking-widest">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-12 text-center text-muted-foreground italic"
                          >
                            No items listed.
                          </td>
                        </tr>
                      ) : (
                        lineItems.map((item, i) => (
                          <tr
                            key={item.id}
                            className={
                              i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                            }
                          >
                            <td className="p-4 text-center text-slate-900 font-mono text-xs">
                              {i + 1}
                            </td>
                            <td className="p-4 text-slate-700 whitespace-pre-wrap text-left font-medium">
                              {item.description || "—"}
                            </td>
                            <td className="p-4 text-center text-slate-700 uppercase text-[10px] font-bold">
                              {item.unit || ""}
                            </td>
                            <td className="p-4 text-center text-slate-700">
                              {item.quantity || 0}
                            </td>
                            <td className="p-4 text-right text-slate-700">
                              {formatCurrency(item.unitPrice || 0)}
                            </td>
                            <td className="p-4 text-right font-black text-slate-900">
                              {formatCurrency(
                                (item.quantity || 0) * (item.unitPrice || 0),
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-10 mb-12">
                  <div className="flex-1 text-left max-w-[400px] space-y-6">
                    {notes && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                          Notes
                        </p>
                        <p className="text-xs text-slate-600 whitespace-pre-wrap italic">
                          {notes}
                        </p>
                      </div>
                    )}

                    {companyProfile?.bankAccountNumber && (
                      <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-1.5">
                          <Landmark className="size-3" /> Bank Details
                        </p>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[10px]">
                          <div className="space-y-1">
                            <p>
                              <span className="text-slate-400">Bank:</span>{" "}
                              {companyProfile.bankName}
                            </p>
                            <p>
                              <span className="text-slate-400">A/C Name:</span>{" "}
                              {companyProfile.bankAccountName ||
                                companyProfile.name}
                            </p>
                            <p>
                              <span className="text-slate-400">Account:</span>{" "}
                              {companyProfile.bankAccountNumber}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p>
                              <span className="text-slate-400">
                                IFSC/Routing:
                              </span>{" "}
                              {companyProfile.bankRoutingNumber}
                            </p>
                            <p>
                              <span className="text-slate-400">Branch:</span>{" "}
                              {companyProfile.bankBranchName || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {companyProfile?.defaultTerms && (
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                          Terms & Conditions
                        </p>
                        <p className="text-[9px] text-slate-400 whitespace-pre-wrap leading-relaxed border-t pt-2">
                          {companyProfile.defaultTerms}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="w-full sm:w-64 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Subtotal</span>
                        <span className="text-slate-900 font-medium">
                          {formatCurrency(totals.subtotal)}
                        </span>
                      </div>
                      {isGstEnabled && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">
                            GST ({globalGstRate}%)
                          </span>
                          <span className="text-slate-900 font-medium">
                            {formatCurrency(totals.totalGst)}
                          </span>
                        </div>
                      )}
                    </div>
                    <Separator className="bg-slate-200" />
                    <div className="flex justify-between font-bold text-xl py-2">
                      <span className="text-slate-900 text-xs uppercase font-black tracking-widest text-slate-300">
                        Total Amount
                      </span>
                      <span className="text-accent text-3xl font-black">
                        {formatCurrency(totals.total)}
                      </span>
                    </div>

                    {(companyProfile?.authorizedSignatoryName ||
                      companyProfile?.authorizedSignatoryImageUrl) && (
                      <div className="mt-12 text-center bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <div className="flex flex-col items-center justify-center border-b border-slate-200 pb-3 mb-3">
                          {companyProfile?.authorizedSignatoryImageUrl ? (
                            <div
                              className="flex items-center justify-center"
                              style={{ height: signSize }}
                            >
                              {isSignSvg ? (
                                <div
                                  className="w-full h-full p-1 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      companyProfile.authorizedSignatoryImageUrl,
                                  }}
                                />
                              ) : (
                                <img
                                  src={
                                    companyProfile.authorizedSignatoryImageUrl
                                  }
                                  alt="Authorized Signature"
                                  className="max-w-full max-h-full object-contain"
                                />
                              )}
                            </div>
                          ) : (
                            <div className="h-16" />
                          )}
                        </div>
                        <p className="text-sm font-black text-slate-900 mb-1">
                          {companyProfile.authorizedSignatoryName || ""}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Authorized Signatory
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-24 pt-8 border-t border-slate-200 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold opacity-30">
                    Thank you for your business
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ManageQuotePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-accent" />
        </div>
      }
    >
      <ManageQuoteContent />
    </Suspense>
  );
}
