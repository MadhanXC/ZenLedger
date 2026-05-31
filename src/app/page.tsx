"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Receipt,
  ArrowUpRight,
  Loader2,
  CalendarDays,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }

  // Queries
  const recentQuotesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "quotes"), orderBy("issueDate", "desc"), limit(6))
  }, [db, user])

  const allQuotesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "quotes"))
  }, [db, user])

  const invoicesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "invoices"))
  }, [db, user])

  const clientsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "clients"))
  }, [db, user])

  const { data: recentQuotes, isLoading: isQuotesLoading } = useCollection(recentQuotesQuery)
  const { data: allQuotes } = useCollection(allQuotesQuery)
  const { data: allInvoices, isLoading: isInvoicesLoading } = useCollection(invoicesQuery)
  const { data: allClients, isLoading: isClientsLoading } = useCollection(clientsQuery)

  // Metrics Calculations
  const metrics = useMemo(() => {
    const paidInvoices = allInvoices?.filter(inv => inv.paymentStatus === "Paid") || []
    const unpaidInvoices = allInvoices?.filter(inv => inv.paymentStatus !== "Paid") || []
    const pendingQuotes = allQuotes?.filter(q => q.status === "Draft" || q.status === "Sent") || []
    
    const totalRevenue = paidInvoices.reduce((acc, inv) => acc + (inv.totalAmount + (inv.totalGSTAmount || 0)), 0)
    const pendingRevenue = unpaidInvoices.reduce((acc, inv) => acc + (inv.totalAmount + (inv.totalGSTAmount || 0)), 0)
    
    return {
      totalRevenue,
      pendingRevenue,
      activeClients: allClients?.length || 0,
      pendingQuotesCount: pendingQuotes.length,
      unpaidInvoicesCount: unpaidInvoices.length
    }
  }, [allInvoices, allQuotes, allClients])

  // Chart Data Calculation (Last 6 months)
  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i)
      return {
        name: format(date, "MMM"),
        start: startOfMonth(date),
        end: endOfMonth(date),
        total: 0
      }
    })

    const paidInvoices = allInvoices?.filter(inv => inv.paymentStatus === "Paid") || []

    paidInvoices.forEach(inv => {
      const invDate = new Date(inv.issueDate)
      const monthData = months.find(m => isWithinInterval(invDate, { start: m.start, end: m.end }))
      if (monthData) {
        monthData.total += (inv.totalAmount + (inv.totalGSTAmount || 0))
      }
    })

    return months.map(({ name, total }) => ({ name, total }))
  }, [allInvoices])

  if (isUserLoading || isInvoicesLoading || isQuotesLoading || isClientsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="size-8 animate-spin text-accent" />
        <p className="text-muted-foreground text-sm">Aggregating your business data...</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-500 text-white"
      case "Sent": return "bg-blue-500 text-white"
      case "Draft": return "bg-slate-500 text-white"
      case "Rejected": return "bg-rose-500 text-white"
      default: return "bg-slate-400 text-white"
    }
  }

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'User'

  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Business Overview</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Welcome back <span className="font-bold text-foreground">{firstName}</span>!
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Successfully collected payments</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pending Billing</CardTitle>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.pendingRevenue)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Outstanding receivables</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proposals</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingQuotesCount}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Quotes awaiting approval</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-400">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeClients}</div>
            <p className="text-[10px] text-muted-foreground mt-1">In your active directory</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:space-y-0 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly collections for the last 6 months</CardDescription>
              </div>
              <CalendarDays className="h-5 w-5 text-muted-foreground opacity-30" />
            </div>
          </CardHeader>
          <CardContent className="px-2 lg:px-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `₹${value/1000}k`} 
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(52, 58, 64, 0.05)'}}
                    content={({active, payload}) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-lg">
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">{payload[0].payload.name}</p>
                            <p className="text-sm font-black text-accent">{formatCurrency(payload[0].value as number)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} className="fill-accent/80 hover:fill-accent transition-colors" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest generated proposals</CardDescription>
            </div>
            <Link href="/quotes" className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {recentQuotes?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm text-muted-foreground">No recent quotes found.</p>
                </div>
              ) : (
                recentQuotes?.map((quote) => {
                  const clientName = quote.clientId === "one-time" 
                    ? (quote.oneTimeClientName || "One-time Client")
                    : allClients?.find(c => c.id === quote.clientId)?.name || "Unknown Client"
                  
                  return (
                    <div key={quote.id} className="flex items-center group">
                      <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <FileText className="size-4 text-muted-foreground" />
                      </div>
                      <div className="ml-4 space-y-0.5 flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-accent transition-colors">{clientName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                          {quote.quoteNumber} • {format(new Date(quote.issueDate), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col items-end shrink-0">
                        <div className="text-sm font-black">{formatCurrency(quote.totalAmount + (quote.totalGSTAmount || 0))}</div>
                        <Badge className={`text-[9px] px-1.5 h-4 uppercase font-black tracking-tighter ${getStatusColor(quote.status)}`}>
                          {quote.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
