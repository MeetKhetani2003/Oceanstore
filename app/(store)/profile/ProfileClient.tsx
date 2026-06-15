"use client";

import { useState } from "react";
import { Button } from "@/components/store/ui";
import { money } from "@/data/catalog";
import { Bag, Heart, Trash, Plus } from "@/lib/ui-utils/icons";

interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: string;
  paymentStatus: string;
  items: OrderItem[];
}

interface ProfileClientProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    addresses: Address[];
  };
  initialOrders: Order[];
}

export default function ProfileClient({ initialUser, initialOrders }: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "addresses" | "orders">("profile");
  const [addresses, setAddresses] = useState<Address[]>(initialUser.addresses);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for new address
  const [label, setLabel] = useState("Home");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          name,
          phone,
          line1,
          line2,
          city,
          state,
          pincode,
          isDefault: addresses.length === 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add address");

      // Format updated addresses list
      const formatted = data.addresses.map((a: any) => ({
        id: a._id.toString(),
        label: a.label,
        name: a.name,
        phone: a.phone,
        line1: a.line1,
        line2: a.line2 || "",
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        isDefault: a.isDefault,
      }));

      setAddresses(formatted);
      setShowAddForm(false);
      // Reset form
      setLabel("Home");
      setName("");
      setPhone("");
      setLine1("");
      setLine2("");
      setCity("");
      setState("");
      setPincode("");
    } catch (err: any) {
      alert(err.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to remove this address?")) return;

    try {
      const res = await fetch("/api/user/address", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete address");

      const formatted = data.addresses.map((a: any) => ({
        id: a._id.toString(),
        label: a.label,
        name: a.name,
        phone: a.phone,
        line1: a.line1,
        line2: a.line2 || "",
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        isDefault: a.isDefault,
      }));

      setAddresses(formatted);
    } catch (err: any) {
      alert(err.message || "Failed to delete address");
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out?")) {
      fetch("/api/auth/logout", { method: "POST" })
        .then(() => {
          window.location.href = "/";
        })
        .catch(console.error);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-[250px_1fr]">
      {/* Navigation Sidebar */}
      <aside className="space-y-2">
        <div className="bg-white rounded-2xl border border-line p-5 text-center shadow-sm mb-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-ocean-500 flex items-center justify-center text-white font-display text-xl overflow-hidden mb-3">
            {initialUser.avatar ? (
              <img src={initialUser.avatar} alt={initialUser.name} className="h-full w-full object-cover" />
            ) : (
              initialUser.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <h2 className="font-semibold text-ink leading-tight truncate">{initialUser.name}</h2>
          <p className="text-xs text-muted truncate mt-1">{initialUser.email}</p>
        </div>

        <nav className="bg-white rounded-2xl border border-line p-3 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-[13.5px] font-bold transition-all border-l-4 ${
              activeTab === "profile" 
                ? "border-ocean-500 bg-ocean-50 text-ocean-600" 
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            My Details
          </button>
          <button
            onClick={() => setActiveTab("addresses")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-[13.5px] font-bold transition-all border-l-4 ${
              activeTab === "addresses" 
                ? "border-ocean-500 bg-ocean-50 text-ocean-600" 
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            Saved Addresses
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-[13.5px] font-bold transition-all border-l-4 ${
              activeTab === "orders" 
                ? "border-ocean-500 bg-ocean-50 text-ocean-600" 
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            Order History
          </button>
          <div className="border-t border-line/50 my-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="bg-white rounded-3xl border border-line p-6 md:p-8 shadow-sm">
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">My Details</h1>
              <p className="text-sm text-muted mt-1">Manage your account information</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 text-sm border-t border-line/60 pt-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Full Name</span>
                <p className="text-ink font-medium mt-1 text-base">{initialUser.name}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Email Address</span>
                <p className="text-ink font-medium mt-1 text-base">{initialUser.email}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-ink">Addresses</h1>
                <p className="text-sm text-muted mt-1">Add or manage shipping details</p>
              </div>
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)} size="sm" variant="outline">
                  <Plus className="h-4 w-4" /> Add New
                </Button>
              )}
            </div>

            {showAddForm && (
              <form onSubmit={handleAddAddress} className="border border-line rounded-2xl p-5 bg-cream-100 space-y-4">
                <h3 className="font-medium text-sm text-ink">New Shipping Address</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Label (e.g. Home, Office)</label>
                    <input
                      type="text"
                      required
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-leaf-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-muted mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-leaf-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-muted mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-leaf-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Address Line 1</label>
                    <input
                      type="text"
                      required
                      value={line1}
                      onChange={(e) => setLine1(e.target.value)}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-leaf-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted mb-1">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-leaf-500"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-leaf-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-leaf-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:border-leaf-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={loading}>
                    {loading ? "Saving..." : "Save Address"}
                  </Button>
                </div>
              </form>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.length === 0 ? (
                <p className="text-sm text-muted">No saved addresses found. Add one above.</p>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="relative rounded-2xl border border-line p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-block bg-ocean-50 text-ocean-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {addr.label}
                      </span>
                      {addr.isDefault && <span className="text-[10px] text-leaf-600 font-semibold uppercase tracking-wider">Default</span>}
                    </div>
                    <p className="font-semibold text-sm text-ink">{addr.name}</p>
                    <p className="text-xs text-muted">
                      {addr.line1}, {addr.line2 && `${addr.line2}, `}
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-xs text-muted">Phone: {addr.phone}</p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                        aria-label="Delete address"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Order History</h1>
              <p className="text-sm text-muted mt-1">Review and track your past orders</p>
            </div>

            <div className="divide-y divide-line/60">
              {initialOrders.length === 0 ? (
                <p className="text-sm text-muted py-4">You have not placed any orders yet.</p>
              ) : (
                initialOrders.map((order) => (
                  <div key={order.id} className="py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-ink">#{order.orderNumber}</span>
                        <span className="text-[11px] text-muted">
                          {new Date(order.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                      <ul className="mt-2 text-xs text-muted space-y-1">
                        {order.items.map((it, idx) => (
                           <li key={idx}>
                             • {it.name} × {it.qty}
                           </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center gap-2.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 bg-sand text-ink">
                          Order: {order.status}
                        </span>
                        <span className={`text-[11px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5 ${
                          order.paymentStatus === "paid" ? "bg-leaf-50 text-leaf-700" : "bg-red-50 text-red-600"
                        }`}>
                          Payment: {order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2.5">
                      <span className="font-display text-lg font-medium text-ink">{money(order.total)}</span>
                      {order.paymentStatus === "paid" && (
                        <a
                          href={`/api/user/orders/${order.id}/invoice`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-leaf-700 hover:text-leaf-800 underline font-medium"
                        >
                          Download Invoice PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
