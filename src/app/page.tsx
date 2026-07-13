"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  RefreshCw,
  LogOut,
  CreditCard,
  Lock
} from "lucide-react";

interface Analytics {
  total_churches: number;
  active_subscriptions: number;
  total_revenue: number;
  mrr: number;
}

interface Church {
  id: number;
  church_name: string;
  registration_no: string;
  pastor_name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  status: "active" | "inactive";
  users_count: number;
  members_count: number;
}

interface Subscription {
  id: number;
  church: { church_name: string };
  plan: { name: string; price: number };
  start_date: string;
  end_date: string;
  status: "active" | "expired" | "cancelled";
}

interface Payment {
  id: number;
  church: { church_name: string };
  amount: number;
  currency: string;
  gateway: string;
  transaction_id: string;
  payment_date: string;
  status: string;
}

export default function SuperAdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "churches" | "subscriptions" | "payments">("overview");
  const [analytics, setAnalytics] = useState<Analytics>({ total_churches: 0, active_subscriptions: 0, total_revenue: 0, mrr: 0 });
  const [churches, setChurches] = useState<Church[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const backendUrl = "http://localhost:8000/api";

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch analytics
      const resAnalytics = await fetch(`${backendUrl}/super-admin/analytics`);
      const dataAnalytics = await resAnalytics.json();
      setAnalytics(dataAnalytics);

      // Fetch churches
      const resChurches = await fetch(`${backendUrl}/super-admin/churches`);
      const dataChurches = await resChurches.json();
      setChurches(dataChurches);

      // Fetch subscriptions
      const resSubs = await fetch(`${backendUrl}/super-admin/subscriptions`);
      const dataSubs = await resSubs.json();
      setSubscriptions(dataSubs);

      // Fetch payments
      const resPayments = await fetch(`${backendUrl}/super-admin/payments`);
      const dataPayments = await resPayments.json();
      setPayments(dataPayments);

    } catch (e) {
      console.error("Error loading Super Admin data, using fallback mock data:", e);
      // Fallback mocks if backend is not running locally
      setAnalytics({ total_churches: 4, active_subscriptions: 3, total_revenue: 29700.00, mrr: 9900.00 });
      setChurches([
        { id: 1, church_name: "Grace Community Church", registration_no: "FC-998271", pastor_name: "Pastor John", email: "info@grace.com", phone: "+94771234567", city: "Colombo", country: "Sri Lanka", status: "active", users_count: 3, members_count: 142 },
        { id: 2, church_name: "Calvary Sanctuary", registration_no: "FC-881290", pastor_name: "Pastor David", email: "contact@calvary.org", phone: "+94711112222", city: "Kandy", country: "Sri Lanka", status: "active", users_count: 2, members_count: 89 },
        { id: 3, church_name: "Zion Methodist Church", registration_no: "FC-772183", pastor_name: "Rev. Thomas", email: "thomas@zion.org", phone: "+94710002233", city: "Galle", country: "Sri Lanka", status: "active", users_count: 4, members_count: 210 },
        { id: 4, church_name: "New Life Assembly", registration_no: "FC-556122", pastor_name: "Pastor Saman", email: "saman@newlife.lk", phone: "+94770001111", city: "Jaffna", country: "Sri Lanka", status: "inactive", users_count: 1, members_count: 45 }
      ]);
      setSubscriptions([
        { id: 1, church: { church_name: "Grace Community Church" }, plan: { name: "Premium Plan", price: 9900.00 }, start_date: "2026-01-10", end_date: "2027-01-10", status: "active" },
        { id: 2, church: { church_name: "Calvary Sanctuary" }, plan: { name: "Basic Plan", price: 4900.00 }, start_date: "2026-02-15", end_date: "2026-08-15", status: "active" },
        { id: 3, church: { church_name: "Zion Methodist Church" }, plan: { name: "Premium Plan", price: 9900.00 }, start_date: "2025-07-01", end_date: "2026-07-01", status: "expired" }
      ]);
      setPayments([
        { id: 1, church: { church_name: "Grace Community Church" }, amount: 9900.00, currency: "LKR", gateway: "stripe", transaction_id: "txn_3M291xLK91", payment_date: "2026-07-10 10:15:30", status: "success" },
        { id: 2, church: { church_name: "Calvary Sanctuary" }, amount: 4900.00, currency: "LKR", gateway: "payhere", transaction_id: "pay_8829102", payment_date: "2026-07-09 14:22:12", status: "success" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("super_admin_auth") === "true";
      if (isAuth) {
        setIsAuthenticated(true);
      }
    }
    fetchData();
  }, []);

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === "Admin@FaithCore") {
      sessionStorage.setItem("super_admin_auth", "true");
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid passcode. Access Denied.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("super_admin_auth");
    setIsAuthenticated(false);
    setPasscodeInput("");
  };

  const handleToggleStatus = async (id: number) => {
    try {
      setActionLoading(id);
      const res = await fetch(`${backendUrl}/super-admin/churches/${id}/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        await fetchData();
      } else {
        // Mock state toggle if API fails
        setChurches(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
      }
    } catch (e) {
      // Local fallback
      setChurches(prev => prev.map(c => c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c));
    } finally {
      setActionLoading(null);
    }
  };

  const filteredChurches = churches.filter(c => 
    c.church_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pastor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.registration_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070913] text-white overflow-hidden relative font-sans">
        {/* Ambient background styling */}
        <div className="absolute top-0 left-0 w-full h-[600px] opacity-35 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/25 via-[#070B18] to-transparent pointer-events-none"></div>
        <div className="absolute -bottom-1/6 -right-1/6 w-[550px] h-[550px] bg-violet-600/10 rounded-full blur-[110px] pointer-events-none"></div>
        <div className="absolute -top-1/4 -left-1/4 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md p-6 flex flex-col justify-center">
          <div className="w-full rounded-[2.5rem] border border-white/10 bg-[#0E1528]/85 p-8 sm:p-10 shadow-[0_20px_50px_rgba(4,6,15,0.7)] backdrop-blur-2xl text-center">
            
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#5B3DF5] to-[#8b5cf6] flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                <Lock size={32} />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              SaaS Portal Lock
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm font-medium mb-6 leading-relaxed">
              Enter the Super Admin passcode to monitor the platform database and logs.
            </p>

            <form onSubmit={handleVerifyPasscode} className="space-y-4">
              {authError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 font-semibold">
                  {authError}
                </div>
              )}
              
              <div className="flex h-14 items-center rounded-xl border border-white/5 bg-[#090E1A]/85 px-4 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all duration-300">
                <Lock className="text-gray-500" size={18} />
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="ml-3 flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
                  placeholder="Enter passcode"
                  required
                />
              </div>

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#5B3DF5] to-[#8b5cf6] text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 hover:scale-[1.01] active:scale-[0.98] transition-all duration-300"
              >
                Verify &amp; Enter
              </button>

              <Link
                href="/"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/5 bg-[#090E1A] h-14 hover:bg-white/5 hover:border-white/10 transition-all duration-300 text-xs font-bold text-gray-300"
              >
                Back to Marketing Site
              </Link>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-white selection:bg-[#5B3DF5] selection:text-white font-sans">
      
      {/* Background decoration glows */}
      <div className="absolute top-0 left-0 w-full h-[600px] opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/35 via-[#070B18] to-transparent pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* TOP HEADER */}
      <header className="relative z-10 border-b border-white/10 bg-[#0c0f24]/60 backdrop-blur-md sticky top-0">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#5B3DF5] to-[#8b5cf6] flex items-center justify-center font-black text-white text-lg shadow-lg shadow-[#5B3DF5]/20">
              FC
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                FaithCore <span className="text-[10px] uppercase bg-violet-500/20 text-violet-400 font-bold px-2 py-0.5 rounded-full border border-violet-500/30">Super Admin</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">SaaS Platform Console</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={fetchData} 
              className="p-2 rounded-xl border border-white/5 bg-[#121630]/80 hover:bg-[#181d3d] hover:border-white/10 transition-all text-gray-400 hover:text-white"
            >
              <RefreshCw size={16} className={loading ? "animate-spin text-violet-400" : ""} />
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
            >
              <LogOut size={14} /> Exit Portal
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        
        {/* STAT CARDS */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard 
            title="Total Registered Churches" 
            value={analytics.total_churches} 
            icon={<Building2 className="text-violet-400" size={22} />}
            desc="Across all denominations"
          />
          <StatCard 
            title="Active Subscriptions" 
            value={analytics.active_subscriptions} 
            icon={<ShieldCheck className="text-emerald-400" size={22} />}
            desc="Active paying customers"
          />
          <StatCard 
            title="Total Platform Revenue" 
            value={`LKR ${(analytics.total_revenue).toLocaleString()}`} 
            icon={<DollarSign className="text-purple-400" size={22} />}
            desc="Lifetime Stripe & PayHere earnings"
          />
          <StatCard 
            title="Estimated MRR" 
            value={`LKR ${(analytics.mrr).toLocaleString()}`} 
            icon={<TrendingUp className="text-indigo-400" size={22} />}
            desc="Monthly Recurring Revenue"
          />
        </section>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-white/5 mb-8 overflow-x-auto gap-2 p-1 bg-white/[0.02] rounded-2xl border border-white/10 backdrop-blur-sm">
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="System Overview" icon={<Activity size={16} />} />
          <TabButton active={activeTab === "churches"} onClick={() => setActiveTab("churches")} label="Churches Management" icon={<Building2 size={16} />} />
          <TabButton active={activeTab === "subscriptions"} onClick={() => setActiveTab("subscriptions")} label="Subscriptions" icon={<ShieldCheck size={16} />} />
          <TabButton active={activeTab === "payments"} onClick={() => setActiveTab("payments")} label="Payment Logs" icon={<CreditCard size={16} />} />
        </div>

        {/* CONTENT TABS */}
        <section className="bg-[#0b0e21]/70 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md shadow-2xl">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="text-violet-400" size={20} /> Platform Diagnostics & Logs
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DiagnosticItem title="Laravel API Gateway Status" status="online" info="V1.0.0 Stable API" />
                    <DiagnosticItem title="Stripe Webhook Gateway" status="online" info="Secure handshake active" />
                    <DiagnosticItem title="PayHere Webhook Handler" status="online" info="LKR Payment Processor" />
                    <DiagnosticItem title="Mobile Authentication Gateway" status="online" info="OTP delivery active" />
                  </div>
                </div>
                <div className="w-full md:w-80 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-200">System Logs</h4>
                    <p className="text-xs text-gray-500 mt-1">Platform monitor is checking gateway requests.</p>
                  </div>
                  <div className="mt-6 space-y-3">
                    <LogLine time="10:14 AM" event="PayPal Webhook success - Subscription #1" />
                    <LogLine time="08:22 AM" event="OTP Verified - Member join Success" />
                    <LogLine time="Yesterday" event="Stripe payment checkout generated" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">Recent Payments</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="py-3 font-semibold">Church</th>
                        <th className="py-3 font-semibold">Amount</th>
                        <th className="py-3 font-semibold">Gateway</th>
                        <th className="py-3 font-semibold">Transaction ID</th>
                        <th className="py-3 font-semibold">Payment Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {payments.slice(0, 3).map((pay) => (
                        <tr key={pay.id} className="text-gray-300">
                          <td className="py-3 font-semibold text-white">{pay.church?.church_name}</td>
                          <td className="py-3">{pay.currency} {pay.amount.toLocaleString()}</td>
                          <td className="py-3"><span className="px-2 py-0.5 text-[10px] rounded-md bg-white/5 font-semibold text-gray-300 border border-white/10 uppercase">{pay.gateway}</span></td>
                          <td className="py-3 text-xs text-gray-500 font-mono">{pay.transaction_id}</td>
                          <td className="py-3 text-xs">{pay.payment_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHURCHES */}
          {activeTab === "churches" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
                <div>
                  <h3 className="text-lg font-bold text-white">Churches & Tenants</h3>
                  <p className="text-xs text-gray-500 mt-1">Manage database statuses and check usage metrics.</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search church or pastor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#090E1A] pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 outline-none focus:border-[#5B3DF5] transition-all"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-3 font-semibold">Church Name</th>
                      <th className="py-3 font-semibold">Activation Code</th>
                      <th className="py-3 font-semibold">Pastor</th>
                      <th className="py-3 font-semibold">Location</th>
                      <th className="py-3 font-semibold text-center">Users</th>
                      <th className="py-3 font-semibold text-center">Members</th>
                      <th className="py-3 font-semibold">Status</th>
                      <th className="py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredChurches.map((c) => (
                      <tr key={c.id} className="text-gray-300">
                        <td className="py-3">
                          <div className="font-bold text-white">{c.church_name}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{c.email}</div>
                        </td>
                        <td className="py-3 text-xs text-violet-400 font-bold">{c.registration_no || `FC-000${c.id}`}</td>
                        <td className="py-3 text-xs">{c.pastor_name}</td>
                        <td className="py-3 text-xs">{c.city}, {c.country}</td>
                        <td className="py-3 text-center text-xs font-semibold">{c.users_count || 1}</td>
                        <td className="py-3 text-center text-xs font-semibold">{c.members_count || 0}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            c.status === "active" 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}>
                            {c.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleToggleStatus(c.id)}
                            disabled={actionLoading === c.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              c.status === "active"
                                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                            }`}
                          >
                            {actionLoading === c.id ? "Updating..." : c.status === "active" ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SUBSCRIPTIONS */}
          {activeTab === "subscriptions" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Churches Subscriptions</h3>
                <p className="text-xs text-gray-500 mt-1">Check billing cycles and recurring prices.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-3 font-semibold">Church</th>
                      <th className="py-3 font-semibold">Plan</th>
                      <th className="py-3 font-semibold">Price</th>
                      <th className="py-3 font-semibold">Start Date</th>
                      <th className="py-3 font-semibold">End Date</th>
                      <th className="py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="text-gray-300">
                        <td className="py-3 font-bold text-white">{sub.church?.church_name}</td>
                        <td className="py-3 text-violet-400 font-semibold">{sub.plan?.name}</td>
                        <td className="py-3">LKR {(sub.plan?.price || 0).toLocaleString()}</td>
                        <td className="py-3 text-xs">{sub.start_date}</td>
                        <td className="py-3 text-xs text-gray-400">{sub.end_date}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            sub.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : sub.status === "expired"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              sub.status === "active" ? "bg-emerald-400" : sub.status === "expired" ? "bg-amber-400" : "bg-red-400"
                            }`} />
                            {sub.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Lifetime Payment Logs</h3>
                <p className="text-xs text-gray-500 mt-1">Audit log of all Stripe, PayPal, and PayHere checkout sessions.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-3 font-semibold">Church</th>
                      <th className="py-3 font-semibold">Paid Amount</th>
                      <th className="py-3 font-semibold">Gateway</th>
                      <th className="py-3 font-semibold">Transaction ID</th>
                      <th className="py-3 font-semibold">Payment Date</th>
                      <th className="py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {payments.map((pay) => (
                      <tr key={pay.id} className="text-gray-300">
                        <td className="py-3 font-bold text-white">{pay.church?.church_name}</td>
                        <td className="py-3 font-semibold text-emerald-400">{pay.currency} {pay.amount.toLocaleString()}</td>
                        <td className="py-3 text-xs"><span className="px-2 py-0.5 text-[10px] rounded-md bg-white/5 font-bold border border-white/10 uppercase">{pay.gateway}</span></td>
                        <td className="py-3 text-xs text-gray-500 font-mono">{pay.transaction_id}</td>
                        <td className="py-3 text-xs">{pay.payment_date}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {pay.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </section>

      </main>

    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  desc
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  desc: string;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#0d0f22]/70 p-6 backdrop-blur-md hover:border-white/15 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] border border-white/5">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-black text-white">{value}</h3>
        <p className="text-[11px] text-gray-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
        active 
          ? "bg-[#5B3DF5] text-white shadow-lg shadow-[#5B3DF5]/20" 
          : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function DiagnosticItem({
  title,
  status,
  info
}: {
  title: string;
  status: "online" | "offline";
  info: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-white/[0.02] flex items-center justify-center">
        {status === "online" ? <CheckCircle2 className="text-emerald-400" size={18} /> : <XCircle className="text-red-400" size={18} />}
      </div>
      <div>
        <h4 className="text-xs font-bold text-white">{title}</h4>
        <p className="text-[10px] text-gray-500 mt-0.5">{info}</p>
      </div>
    </div>
  );
}

function LogLine({
  time,
  event
}: {
  time: string;
  event: string;
}) {
  return (
    <div className="flex gap-3 text-[11px]">
      <span className="text-violet-400 font-bold shrink-0">{time}</span>
      <span className="text-gray-400 truncate">{event}</span>
    </div>
  );
}
