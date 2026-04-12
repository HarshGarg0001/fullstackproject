import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import HallCard from '../components/HallCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, SlidersHorizontal } from 'lucide-react';

import { mockHalls } from '../utils/mockData';

const Home = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const { data } = await api.get('/halls');
        setHalls(data.length > 0 ? data : mockHalls);
      } catch (error) {
        console.error('Error fetching halls, falling back to mock data:', error);
        const localHalls = JSON.parse(localStorage.getItem('mockAddedHalls') || '[]');
        setHalls([...mockHalls, ...localHalls]);
      } finally {
        setLoading(false);
      }
    };
    fetchHalls();
  }, []);

  const filteredHalls = halls.filter(hall => {
    return (
      (hall.name.toLowerCase().includes(search.toLowerCase()) || hall.location.toLowerCase().includes(search.toLowerCase())) &&
      (minCapacity === '' || hall.capacity >= Number(minCapacity)) &&
      (maxPrice === '' || hall.price <= Number(maxPrice))
    );
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative py-24 px-4 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-slate-900 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/90 to-purple-900/90 mix-blend-multiply z-0"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent z-0 opacity-60"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-semibold tracking-wider uppercase mb-6 backdrop-blur-sm">
            Premium Venues
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-100 to-white mb-6 tracking-tight drop-shadow-sm">
            Find Your Perfect<br />Wedding Venue
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium">
            Discover and book the most beautiful halls for your special day with our smart booking system.
          </p>
          
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 max-w-4xl mx-auto flex flex-col md:flex-row gap-2 transition-all hover:bg-white/15">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="text" 
                placeholder="Search by name or location..." 
                className="w-full pl-12 pr-4 py-4 rounded-xl md:rounded-l-full md:rounded-r-none border-none bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all text-slate-800 placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input 
                type="number" 
                placeholder="Min Capacity" 
                className="w-full pl-12 pr-4 py-4 rounded-xl md:rounded-none border-none border-l md:border-slate-100 bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all text-slate-800"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
              />
            </div>
            <div className="flex-1 relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-medium h-5 w-5">₹</span>
              <input 
                type="number" 
                placeholder="Max Price" 
                className="w-full pl-12 pr-4 py-4 rounded-xl md:rounded-r-full md:rounded-l-none border-none border-l md:border-slate-100 bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition-all text-slate-800"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Venues</h2>
            <p className="text-slate-500 mt-1">Explore our handpicked selection of wedding halls</p>
          </div>
          <p className="text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            {filteredHalls.length} venues found
          </p>
        </div>

        {filteredHalls.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-700">No venues matched your criteria.</h3>
            <p className="text-slate-500 mt-2">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredHalls.map(hall => (
              <HallCard key={hall._id} hall={hall} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
