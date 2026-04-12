import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, IndianRupee } from 'lucide-react';

const HallCard = ({ hall }) => {
  const defaultImage = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  // Check if image is local upload or external url
  const getImageUrl = (url) => {
    if (!url) return defaultImage;
    if (url.startsWith('/uploads')) {
      return `http://localhost:5000${url}`;
    }
    return url;
  };

  const image = hall.images && hall.images.length > 0 ? getImageUrl(hall.images[0]) : defaultImage;

  return (
    <Link to={`/halls/${hall._id}`} className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 transform hover:-translate-y-2 border border-slate-100/80">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img 
          src={image} 
          alt={hall.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-2xl font-bold truncate tracking-tight mb-1">{hall.name}</h3>
          <div className="flex items-center gap-1.5 text-sm text-slate-300 font-medium">
            <MapPin size={15} className="text-rose-400" />
            <span className="truncate">{hall.location}</span>
          </div>
        </div>
      </div>
      
      <div className="p-5 flex justify-between items-center border-t border-slate-100 bg-white">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Price per day</span>
          <div className="flex items-center text-rose-600 font-bold text-lg">
            <IndianRupee size={18} />
            <span>{hall.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Capacity</span>
          <div className="flex items-center text-slate-700 font-medium bg-slate-100 px-3 py-1 rounded-full text-sm">
            <Users size={14} className="mr-1" />
            {hall.capacity} pax
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HallCard;
