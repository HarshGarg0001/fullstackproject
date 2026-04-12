import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { LayoutDashboard, Store, CalendarRange, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

import { mockHalls } from '../utils/mockData';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('halls'); // 'halls', 'bookings', 'add-hall'
  const [loading, setLoading] = useState(true);
  
  // Data
  const [halls, setHalls] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Form states for Add Hall
  const [newHall, setNewHall] = useState({ name: '', location: '', price: '', capacity: '', description: '' });
  const [images, setImages] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      try {
        const [hallsRes, bookingsRes] = await Promise.all([
          api.get('/halls'),
          api.get('/bookings')
        ]);
        setHalls(hallsRes.data.length > 0 ? hallsRes.data : mockHalls);
        setBookings(bookingsRes.data);
      } catch (error) {
        console.warn('Backend failed, using mock data for admin');
        
        // Mock Halls
        const localHalls = JSON.parse(localStorage.getItem('mockAddedHalls') || '[]');
        setHalls([...mockHalls, ...localHalls]);
        
        // Mock Bookings
        const globalBookings = JSON.parse(localStorage.getItem('admin_mockBookings') || '[]');
        setBookings(globalBookings);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (user?.role !== 'admin') return <Navigate to="/" />;

  const handleDeleteHall = async (id) => {
    if (window.confirm('Delete this hall?')) {
      try {
        await api.delete(`/halls/${id}`);
        setHalls(halls.filter(h => h._id !== id));
      } catch (error) {
        alert('Failed to delete hall');
      }
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
    } catch (error) {
      console.warn('Backend failed, mutating admin booking globally');
      const updated = bookings.map(b => b._id === id ? { ...b, status } : b);
      setBookings(updated);
      localStorage.setItem('admin_mockBookings', JSON.stringify(updated));
      
      // Also update the specific user's booking stash so they see it
      const targetUserId = bookings.find(b => b._id === id)?.userId;
      if (targetUserId) {
        const userBookings = JSON.parse(localStorage.getItem(`mockBookings_${targetUserId}`) || '[]');
        const updatedUserBookings = userBookings.map(b => b._id === id ? { ...b, status } : b);
        localStorage.setItem(`mockBookings_${targetUserId}`, JSON.stringify(updatedUserBookings));
      }
    }
  };

  const handleCreateHall = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(newHall).forEach(key => formData.append(key, newHall[key]));
    
    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }

    try {
      const { data } = await api.post('/halls', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setHalls([...halls, data]);
      setActiveTab('halls');
      setNewHall({ name: '', location: '', price: '', capacity: '', description: '' });
      setImages(null);
      alert('Hall added successfully!');
    } catch (error) {
      console.warn("Using mock create hall");
      const mockNew = {
        _id: Date.now().toString(),
        name: newHall.name,
        location: newHall.location,
        price: Number(newHall.price),
        capacity: Number(newHall.capacity),
        description: newHall.description,
        images: ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80"] // Mock static image due to lack of local host saving
      };

      const localHalls = JSON.parse(localStorage.getItem('mockAddedHalls') || '[]');
      localHalls.push(mockNew);
      localStorage.setItem('mockAddedHalls', JSON.stringify(localHalls));

      setHalls([...halls, mockNew]);
      setActiveTab('halls');
      setNewHall({ name: '', location: '', price: '', capacity: '', description: '' });
      alert('Hall added specifically to your local browser!');
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col pt-8">
        <div className="px-6 mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard size={24} /> Admin
          </h2>
        </div>
        <nav className="flex-1 space-y-2 px-4">
          <button 
            onClick={() => setActiveTab('halls')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'halls' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Store size={20} /> Manage Halls
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'bookings' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <CalendarRange size={20} /> Bookings
          </button>
          <button 
            onClick={() => setActiveTab('add-hall')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'add-hall' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Plus size={20} /> Add New Hall
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto h-screen">
        
        {/* Halls Tab */}
        {activeTab === 'halls' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-slate-800">Manage Wedding Halls</h1>
              <span className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 font-medium">Total: {halls.length}</span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-sm uppercase tracking-wide">
                    <th className="p-4">Hall Name</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Capacity</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {halls.map(hall => (
                    <tr key={hall._id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-semibold text-slate-800">{hall.name}</td>
                      <td className="p-4 text-slate-600">{hall.location}</td>
                      <td className="p-4 text-slate-600">₹{hall.price}</td>
                      <td className="p-4 text-slate-600">{hall.capacity} pax</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDeleteHall(hall._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {halls.length === 0 && <div className="p-8 text-center text-slate-500">No halls added yet.</div>}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Review Bookings</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-sm uppercase tracking-wide">
                    <th className="p-4">Date</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Hall</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map(booking => (
                    <tr key={booking._id} className="hover:bg-slate-50 transition">
                      <td className="p-4 text-slate-800 font-medium">{new Date(booking.date).toLocaleDateString()}</td>
                      <td className="p-4 text-slate-600">{booking.userId?.email || 'Unknown'}</td>
                      <td className="p-4 text-slate-600">{booking.hallId?.name || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                          booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          booking.status === 'cancelled' ? 'bg-slate-200 text-slate-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {booking.status === 'pending' && (
                          <div className="flex justify-center gap-2">
                            <button onClick={() => updateBookingStatus(booking._id, 'approved')} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition" title="Approve">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => updateBookingStatus(booking._id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition" title="Reject">
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && <div className="p-8 text-center text-slate-500">No bookings to review.</div>}
            </div>
          </div>
        )}

        {/* Add Hall Tab */}
        {activeTab === 'add-hall' && (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Add New Wedding Hall</h1>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <form onSubmit={handleCreateHall} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hall Name</label>
                  <input type="text" required value={newHall.name} onChange={e => setNewHall({...newHall, name: e.target.value})} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500" placeholder="e.g. Grand Plaza" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <input type="text" required value={newHall.location} onChange={e => setNewHall({...newHall, location: e.target.value})} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500" placeholder="City, Area" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Capacity</label>
                    <input type="number" required value={newHall.capacity} onChange={e => setNewHall({...newHall, capacity: e.target.value})} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500" placeholder="Guests count" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price per Day (₹)</label>
                  <input type="number" required value={newHall.price} onChange={e => setNewHall({...newHall, price: e.target.value})} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Images (Multiple allowed)</label>
                  <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} className="w-full border border-slate-300 rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea rows="4" value={newHall.description} onChange={e => setNewHall({...newHall, description: e.target.value})} className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-rose-500" placeholder="Describe the hall amenities and features..." />
                </div>
                <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition">
                  Create Hall
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
