import React, { useState, useEffect } from 'react';
import {
  Building2,
  CalendarDays,
  ShoppingBag,
  BellRing,
  IndianRupee,
  Filter,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  fetchAdminSummary,
  fetchAdminBookings,
  updateAdminBookingStatus,
  fetchAdminOrders,
  updateAdminOrderStatus,
  fetchAdminServices,
  updateAdminServiceStatus
} from '../services/api';

export default function AdminDashboard({ onBackToGuestView }) {
  const [selectedHotel, setSelectedHotel] = useState('all');
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'orders' | 'services'
  const [summary, setSummary] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const hotelTabs = [
    { id: 'all', label: 'All Hotels' },
    { id: 'bengaluru', label: 'Oleria Bengaluru' },
    { id: 'goa', label: 'Oleria Goa' },
    { id: 'mumbai', label: 'Oleria Mumbai' },
    { id: 'delhi', label: 'Oleria Delhi' },
    { id: 'jaipur', label: 'Oleria Jaipur' },
  ];

  const loadData = async (hotelId = selectedHotel, showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);
    try {
      const [sumRes, bRes, oRes, sRes] = await Promise.all([
        fetchAdminSummary(hotelId),
        fetchAdminBookings(hotelId),
        fetchAdminOrders(hotelId),
        fetchAdminServices(hotelId)
      ]);
      setSummary(sumRes);
      setBookings(bRes);
      setOrders(oRes);
      setServices(sRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedHotel);
  }, [selectedHotel]);

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => {
      setActionMessage(null);
    }, 3000);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateAdminOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Order ${orderId} updated to ${newStatus}`);
      // Refresh summary to reflect status
      fetchAdminSummary(selectedHotel).then(setSummary);
    } catch (err) {
      alert(err.message || 'Could not update order status.');
    }
  };

  const handleUpdateServiceStatus = async (requestId, newStatus) => {
    try {
      await updateAdminServiceStatus(requestId, newStatus);
      setServices((prev) =>
        prev.map((s) => (s.request_id === requestId ? { ...s, status: newStatus } : s))
      );
      showToast(`Service request ${requestId} updated to ${newStatus}`);
      fetchAdminSummary(selectedHotel).then(setSummary);
    } catch (err) {
      alert(err.message || 'Could not update service status.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await updateAdminBookingStatus(bookingId, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.booking_id === bookingId ? { ...b, status: newStatus } : b))
      );
      showToast(`Booking ${bookingId} updated to ${newStatus}`);
      fetchAdminSummary(selectedHotel).then(setSummary);
    } catch (err) {
      alert(err.message || 'Could not update booking status.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Preparing':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Out for Delivery':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'New':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'In Progress':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Cancelled':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBackToGuestView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Back to Guest View</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold tracking-wide text-white">OLERIA HOTEL</span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
              Operations Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {actionMessage && (
            <span className="hidden sm:inline-block text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 animate-fade-in">
              ✓ {actionMessage}
            </span>
          )}

          <button
            onClick={() => loadData(selectedHotel, true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh latest live state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Live Data</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Prominent Demo Disclaimer Banner */}
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="font-semibold text-amber-300">Demo Admin Dashboard</strong> — All bookings, payments, orders and service requests are simulated for demonstration purposes.
            Real-time actions in the guest interface automatically appear below.
          </div>
        </div>

        {/* Hotel Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/80">
          <div className="flex items-center gap-1 text-xs text-slate-400 pr-2 shrink-0">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Property Filter:</span>
          </div>
          {hotelTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedHotel(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedHotel === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Bookings</span>
              <CalendarDays className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-white">
              {summary?.total_bookings ?? (isLoading ? '...' : 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ₹{(summary?.booking_revenue || 0).toLocaleString()} demo room value
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Food Orders</span>
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-white">
              {summary?.total_orders ?? (isLoading ? '...' : 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ₹{(summary?.dining_revenue || 0).toLocaleString()} in-room dining
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Service Requests</span>
              <BellRing className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-white">
              {summary?.total_services ?? (isLoading ? '...' : 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Housekeeping & Concierge
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden">
            <div className="flex items-center justify-between text-amber-300/80 text-xs mb-2">
              <span>Total Demo Revenue</span>
              <IndianRupee className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-400">
              ₹{(summary?.demo_revenue || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-300/70 mt-1">
              Rooms + Dining combined
            </div>
          </div>
        </div>

        {/* Operational Section Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Room Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Room Dining Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Guest Service Requests ({services.length})</span>
          </button>
        </div>

        {/* Section 1: Room Bookings Table */}
        {activeTab === 'bookings' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Guest Room Bookings</h3>
                <p className="text-xs text-slate-400">Reservations created via property booking engine</p>
              </div>
              <span className="text-xs font-mono text-slate-400">{bookings.length} reservations</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Booking ID</th>
                    <th className="py-3.5 px-4">Guest Name</th>
                    <th className="py-3.5 px-4">Hotel Property</th>
                    <th className="py-3.5 px-4">Room Type</th>
                    <th className="py-3.5 px-4">Dates</th>
                    <th className="py-3.5 px-4 text-center">Guests</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-500">
                        No bookings found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b.booking_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{b.booking_id}</td>
                        <td className="py-3.5 px-4 font-medium text-white">{b.guest_name}</td>
                        <td className="py-3.5 px-4 text-slate-300">{b.hotel_name}</td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {b.room_name} <span className="text-[10px] text-amber-300/80 font-mono">#{b.assigned_room_number}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {b.check_in} → {b.check_out} ({b.nights}n)
                        </td>
                        <td className="py-3.5 px-4 text-center">{b.adults}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-amber-400">
                          ₹{Number(b.total_price || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={b.status || 'Confirmed'}
                            onChange={(e) => handleUpdateBookingStatus(b.booking_id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border focus:outline-none cursor-pointer ${getStatusBadge(
                              b.status
                            )}`}
                          >
                            <option value="Confirmed" className="bg-slate-900 text-slate-200">Confirmed</option>
                            <option value="Completed" className="bg-slate-900 text-slate-200">Completed</option>
                            <option value="Cancelled" className="bg-slate-900 text-slate-200">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 2: Room Dining Orders Table */}
        {activeTab === 'orders' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">In-Room Dining Orders</h3>
                <p className="text-xs text-slate-400">Live culinary & wellness orders dispatched to suites</p>
              </div>
              <span className="text-xs font-mono text-slate-400">{orders.length} orders</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Guest</th>
                    <th className="py-3.5 px-4">Hotel & Room</th>
                    <th className="py-3.5 px-4">Items Ordered</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                    <th className="py-3.5 px-4">Order Time</th>
                    <th className="py-3.5 px-4 text-center">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-500">
                        No food orders found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.order_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{o.order_id}</td>
                        <td className="py-3.5 px-4 font-medium text-white">{o.guest_name}</td>
                        <td className="py-3.5 px-4">
                          <span className="block text-slate-200 font-medium">{o.hotel_name}</span>
                          <span className="text-[11px] text-amber-300 font-mono">Room {o.room_number}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="space-y-0.5">
                            {o.items?.map((item, idx) => (
                              <div key={idx} className="text-[11px] truncate text-slate-300">
                                <strong className="text-amber-400">{item.quantity}x</strong> {item.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-amber-400">
                          ₹{Number(o.total || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] font-mono text-slate-400">
                          {o.created_at || 'Just now'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={o.status || 'Confirmed'}
                            onChange={(e) => handleUpdateOrderStatus(o.order_id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border focus:outline-none cursor-pointer ${getStatusBadge(
                              o.status
                            )}`}
                          >
                            <option value="Confirmed" className="bg-slate-900 text-slate-200">Confirmed</option>
                            <option value="Preparing" className="bg-slate-900 text-slate-200">Preparing</option>
                            <option value="Out for Delivery" className="bg-slate-900 text-slate-200">Out for Delivery</option>
                            <option value="Delivered" className="bg-slate-900 text-slate-200">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 3: Guest Service Requests Table */}
        {activeTab === 'services' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Guest Service Requests</h3>
                <p className="text-xs text-slate-400">Housekeeping, amenities & concierge requests</p>
              </div>
              <span className="text-xs font-mono text-slate-400">{services.length} requests</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Request ID</th>
                    <th className="py-3.5 px-4">Guest Name</th>
                    <th className="py-3.5 px-4">Hotel Property</th>
                    <th className="py-3.5 px-4">Room #</th>
                    <th className="py-3.5 px-4">Request Details</th>
                    <th className="py-3.5 px-4">Created Time</th>
                    <th className="py-3.5 px-4 text-center">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {services.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-500">
                        No service requests found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    services.map((s) => (
                      <tr key={s.request_id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{s.request_id}</td>
                        <td className="py-3.5 px-4 font-medium text-white">{s.guest_name}</td>
                        <td className="py-3.5 px-4 text-slate-300">{s.hotel_name}</td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-amber-300">Room {s.room_number}</td>
                        <td className="py-3.5 px-4 text-slate-200 font-medium">
                          {s.service_name || s.service_id}
                        </td>
                        <td className="py-3.5 px-4 text-[11px] font-mono text-slate-400">
                          {s.created_at || 'Just now'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <select
                            value={s.status || 'New'}
                            onChange={(e) => handleUpdateServiceStatus(s.request_id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border focus:outline-none cursor-pointer ${getStatusBadge(
                              s.status
                            )}`}
                          >
                            <option value="New" className="bg-slate-900 text-slate-200">New</option>
                            <option value="In Progress" className="bg-slate-900 text-slate-200">In Progress</option>
                            <option value="Completed" className="bg-slate-900 text-slate-200">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
