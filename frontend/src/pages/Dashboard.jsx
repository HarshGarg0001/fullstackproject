import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, CheckCircle, Clock, XCircle, Ban, Plus, Store, CalendarRange } from 'lucide-react';
import { mockHalls } from '../utils/mockData';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('my-bookings'); // my-bookings, my-listings, incoming, add-hall
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Data states
  const [myBookings, setMyBookings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);

  // Form states for Add Hall
  const [newHall, setNewHall] = useState({ name: '', location: '', price: '', capacity: '', description: '' });

  useEffect(() => {
    // Check url params for default tab (e.g., from Navbar "List your Venue")
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  const loadDashboardData = async () => {
    try {
      // Because backend is down, we use entirely mock data mapped around user._id
      const allLocalHalls = JSON.parse(localStorage.getItem('mockAddedHalls') || '[]');
      
      // 1. Find halls owned by this user
      const ownedHalls = allLocalHalls.filter(h => h.ownerId === user?._id);
      setMyListings(ownedHalls);

      // 2. Find bookings made BY this user
      const userBookings = JSON.parse(localStorage.getItem(`mockBookings_${user?._id}`) || '[]');
      setMyBookings(userBookings);

      // 3. Find global bookings made FOR this user's halls
      const globalBookings = JSON.parse(localStorage.getItem('admin_mockBookings') || '[]');
      const ownedHallIds = ownedHalls.map(h => h._id);
      const incoming = globalBookings.filter(b => ownedHallIds.includes(b.hallId?._id));
      setIncomingRequests(incoming);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [user, activeTab]);

  const handleCancelBooking = (id) => {
    if (window.confirm('Are you sure you want to cancel your booking?')) {
      const updated = myBookings.map(b => b._id === id ? { ...b, status: 'cancelled' } : b);
      setMyBookings(updated);
      localStorage.setItem(`mockBookings_${user?._id}`, JSON.stringify(updated));
      loadDashboardData(); // Refresh to sync globals if needed
    }
  };

  const updateIncomingBookingStatus = (id, status, bookerId) => {
    // 1. Update Global
    const globalBookings = JSON.parse(localStorage.getItem('admin_mockBookings') || '[]');
    const updatedGlobal = globalBookings.map(b => b._id === id ? { ...b, status } : b);
    localStorage.setItem('admin_mockBookings', JSON.stringify(updatedGlobal));

    // 2. Update Booker's local storage
    if (bookerId) {
      const targetUserBookings = JSON.parse(localStorage.getItem(`mockBookings_${bookerId}`) || '[]');
      const updatedUserb = targetUserBookings.map(b => b._id === id ? { ...b, status } : b);
      localStorage.setItem(`mockBookings_${bookerId}`, JSON.stringify(updatedUserb));
    }
    
    // Refresh
    loadDashboardData();
  };

  const handleCreateHall = (e) => {
    e.preventDefault();
    const mockNew = {
      _id: "hall_" + Date.now().toString(),
      ownerId: user._id, // LINKING TO USER
      name: newHall.name,
      location: newHall.location,
      price: Number(newHall.price),
      capacity: Number(newHall.capacity),
      description: newHall.description,
      images: ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80"]
    };

    const localHalls = JSON.parse(localStorage.getItem('mockAddedHalls') || '[]');
    localHalls.push(mockNew);
    localStorage.setItem('mockAddedHalls', JSON.stringify(localHalls));

    alert('Your venue has been listed successfully!');
    setNewHall({ name: '', location: '', price: '', capacity: '', description: '' });
    setActiveTab('my-listings');
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><CheckCircle size={14}/> Approved</span>;
      case 'pending': return <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><Clock size={14}/> Pending</span>;
      case 'rejected': return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-bold uppercase"><XCircle size={14}/> Rejected</span>;
      case 'cancelled': return <span className="flex items-center gap-1 text-slate-700 bg-slate-200 px-3 py-1 rounded-full text-xs font-bold uppercase"><Ban size={14}/> Cancelled</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Navigation */}
      <div className="w-16 md:w-64 bg-slate-900 text-white flex flex-col pt-8 shrink-0">
        <nav className="flex-1 space-y-2 px-2 md:px-4">
          <button 
            onClick={() => setActiveTab('my-bookings')}
            className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-4 md:py-3 rounded-xl transition ${activeTab === 'my-bookings' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            title="My Bookings"
          >
            <Calendar size={20} /> <span className="hidden md:inline font-medium">My Bookings</span>
          </button>
          
          <div className="pt-6 pb-2 px-4 hidden md:block text-xs font-bold tracking-wider text-slate-500 uppercase">Hosting</div>
          
          <button 
            onClick={() => setActiveTab('my-listings')}
            className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-4 md:py-3 rounded-xl transition ${activeTab === 'my-listings' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            title="My Venues"
          >
            <Store size={20} /> <span className="hidden md:inline font-medium">My Venues</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('incoming')}
            className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-4 md:py-3 rounded-xl transition ${activeTab === 'incoming' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white relative'}`}
            title="Incoming Requests"
          >
            <CalendarRange size={20} /> <span className="hidden md:inline font-medium">Requests</span>
            {incomingRequests.filter(b => b.status === 'pending').length > 0 && (
              <span className="absolute top-2 right-2 md:relative md:top-0 md:right-0 flex h-5 w-5 md:ml-auto items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {incomingRequests.filter(b => b.status === 'pending').length}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('add-hall')}
            className={`w-full flex items-center justify-center md:justify-start gap-3 px-2 md:px-4 py-4 md:py-3 rounded-xl transition ${activeTab === 'add-hall' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            title="List New Venue"
          >
            <Plus size={20} /> <span className="hidden md:inline font-medium">List New Venue</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {/* TAB: My Bookings */}
          {activeTab === 'my-bookings' && (
            <>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">My Trips & Bookings</h1>
              <p className="text-slate-500 mb-8">Places you have booked to host your event.</p>
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {myBookings.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <Calendar className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No bookings found</h3>
                    <p className="mt-1 text-slate-500 mb-6">You haven't made any hall reservations yet.</p>
                    <Link to="/" className="inline-flex items-center rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-700 transition shadow-md">
                      Browse Halls
                    </Link>
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {myBookings.map(booking => (
                      <li key={booking._id} className="p-6 hover:bg-slate-50 transition flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6 flex-1">
                          <div className="h-20 w-32 rounded-lg bg-slate-200 overflow-hidden shrink-0 hidden sm:block">
                            <img src={booking.hallId?.images?.[0] || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed'} className="h-full w-full object-cover" alt="hall" />
                          </div>
                          <div>
                            <Link to={`/halls/${booking.hallId?._id}`} className="text-lg font-bold text-slate-900 hover:text-rose-600 transition tracking-tight">
                              {booking.hallId?.name || 'Hall Unavaliable'}
                            </Link>
                            <div className="mt-1 flex items-center gap-4 text-sm text-slate-500 font-medium">
                              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-rose-400"/> {booking.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                          {getStatusBadge(booking.status)}
                          {booking.status === 'pending' || booking.status === 'approved' ? (
                            <button onClick={() => handleCancelBooking(booking._id)} className="text-sm font-medium text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition">Cancel</button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}

          {/* TAB: My Listings (Halls) */}
          {activeTab === 'my-listings' && (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">My Venues</h1>
                  <p className="text-slate-500 mt-1">Halls that you are renting out to others.</p>
                </div>
                <button onClick={() => setActiveTab('add-hall')} className="bg-rose-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-rose-700 transition flex items-center gap-2">
                  <Plus size={18} /> List Venue
                </button>
              </div>

              {myListings.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                  <Store className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">You have no listings</h3>
                  <p className="text-slate-500 mt-1 mb-6">Create your first venue listing and start earning.</p>
                  <button onClick={() => setActiveTab('add-hall')} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium shadow-md hover:bg-slate-800 transition">
                    Create Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myListings.map(hall => (
                    <div key={hall._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
                      <div className="h-48 overflow-hidden relative">
                        <img src={hall.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Venue" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-sm font-bold px-3 py-1 rounded-full shadow cursor-default">
                          ₹{hall.price.toLocaleString('en-IN')}/day
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{hall.name}</h3>
                        <p className="text-slate-500 text-sm mb-4">{hall.location}</p>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                          <span className="text-sm font-medium text-slate-600">{hall.capacity} pax max</span>
                          <Link to={`/halls/${hall._id}`} className="text-rose-600 font-medium text-sm hover:underline">View Public</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* TAB: Incoming Requests */}
          {activeTab === 'incoming' && (
            <>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Incoming Requests</h1>
              <p className="text-slate-500 mb-8">Manage bookings placed by other users for your venues.</p>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {incomingRequests.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No booking requests received yet.</div>
                ) : (
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-sm uppercase tracking-wide">
                        <th className="p-4">Date</th>
                        <th className="p-4">Venue</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {incomingRequests.map(booking => (
                        <tr key={booking._id} className="hover:bg-slate-50 transition">
                          <td className="p-4 text-slate-800 font-medium">{booking.date}</td>
                          <td className="p-4 text-slate-600 font-medium">{booking.hallId?.name}</td>
                          <td className="p-4">{getStatusBadge(booking.status)}</td>
                          <td className="p-4 text-center">
                            {booking.status === 'pending' ? (
                              <div className="flex justify-center gap-2">
                                <button onClick={() => updateIncomingBookingStatus(booking._id, 'approved', booking.userId)} className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition shadow-sm" title="Approve">
                                  <CheckCircle size={16} />
                                </button>
                                <button onClick={() => updateIncomingBookingStatus(booking._id, 'rejected', booking.userId)} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition shadow-sm" title="Reject">
                                  <XCircle size={16} />
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Resolved</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* TAB: Add Hall */}
          {activeTab === 'add-hall' && (
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">List Your Venue</h1>
              <p className="text-slate-500 mb-8">Offer your beautiful space for weddings and events.</p>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
                <form onSubmit={handleCreateHall} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Venue Name</label>
                    <input type="text" required value={newHall.name} onChange={e => setNewHall({...newHall, name: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 outline-none transition" placeholder="e.g. Royal Palace Gardens" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Location / Address</label>
                      <input type="text" required value={newHall.location} onChange={e => setNewHall({...newHall, location: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 outline-none transition" placeholder="City, State" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Max Capacity (Pax)</label>
                      <input type="number" required value={newHall.capacity} onChange={e => setNewHall({...newHall, capacity: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 outline-none transition" placeholder="e.g. 500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price Per Day (₹)</label>
                    <input type="number" required value={newHall.price} onChange={e => setNewHall({...newHall, price: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 outline-none transition" placeholder="50000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea required rows="4" value={newHall.description} onChange={e => setNewHall({...newHall, description: e.target.value})} className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 outline-none transition" placeholder="Describe what makes your venue special..." />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-4 rounded-xl shadow-md hover:shadow-lg transition flex justify-center items-center gap-2 mt-4">
                    <Store size={20} /> Publish Venue
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
