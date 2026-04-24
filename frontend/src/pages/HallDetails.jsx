import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapPin, Users, IndianRupee, Calendar, Image as ImageIcon, Star, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { mockHalls, mockReviews } from '../utils/mockData';

const HallDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [hall, setHall] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Booking state
  const [bookingDate, setBookingDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });
  
  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState({ type: '', text: '' });

  // Photo modal state
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hallRes, reviewsRes] = await Promise.all([
          api.get(`/halls/${id}`),
          api.get(`/reviews/${id}`)
        ]);
        setHall(hallRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error('Error fetching data, using mock data:', error);
        // Fallback to mock data
        const foundHall = mockHalls.find(h => h._id === id);
        if (!foundHall) {
          const localHalls = JSON.parse(localStorage.getItem('mockAddedHalls') || '[]');
          setHall(localHalls.find(h => h._id === id) || mockHalls[0]);
        } else {
          setHall(foundHall);
        }
        
        const localReviews = JSON.parse(localStorage.getItem(`mockReviews_${id}`) || '[]');
        setReviews([...localReviews, ...mockReviews]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setBookingLoading(true);
    setBookingMessage({ type: '', text: '' });

    try {
      await api.post('/bookings', { hallId: id, date: bookingDate });
      setBookingMessage({ type: 'success', text: 'Booking request sent successfully! Awaiting admin approval.' });
      setBookingDate('');
    } catch (error) {
      console.warn("Backend failed, using mock booking storage");
      
      const mockBookings = JSON.parse(localStorage.getItem(`mockBookings_${user?._id}`) || '[]');
      
      // Determine if already booked in mock environment
      if (mockBookings.some(b => b.hallId._id === id && b.date === bookingDate)) {
        setBookingMessage({ type: 'error', text: 'Hall is already booked for this date' });
        setBookingLoading(false);
        return;
      }
      
      const newBooking = {
        _id: Date.now().toString(),
        userId: user._id,
        hallId: hall, 
        date: bookingDate,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      mockBookings.push(newBooking);
      localStorage.setItem(`mockBookings_${user?._id}`, JSON.stringify(mockBookings));
      
      // If admin, they might want to see global bookings, so let's push to a global list too
      const globalBookings = JSON.parse(localStorage.getItem('admin_mockBookings') || '[]');
      globalBookings.push(newBooking);
      localStorage.setItem('admin_mockBookings', JSON.stringify(globalBookings));

      setBookingMessage({ type: 'success', text: 'Booking request sent successfully! (Mocked)' });
      setBookingDate('');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setReviewMessage({ type: '', text: '' });
    try {
      const { data } = await api.post('/reviews', { hallId: id, rating, comment });
      setReviews([data, ...reviews]);
      setComment('');
      setReviewMessage({ type: 'success', text: 'Review added successfully' });
    } catch (error) {
      console.warn("Backend failed, appending mock review");
      
      const newReview = {
        _id: Date.now().toString(),
        userId: { name: user.name || 'Current User' },
        rating,
        comment,
        createdAt: new Date().toISOString()
      };
      
      const localReviews = JSON.parse(localStorage.getItem(`mockReviews_${id}`) || '[]');
      localReviews.unshift(newReview);
      localStorage.setItem(`mockReviews_${id}`, JSON.stringify(localReviews));
      
      setReviews([newReview, ...reviews]);
      setComment('');
      setReviewMessage({ type: 'success', text: 'Review added successfully! (Mocked)' });
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!hall) return <div className="text-center py-20 text-2xl font-bold text-slate-700">Hall not found</div>;

  const defaultImage = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  const getImageUrl = (url) => {
    if (!url) return defaultImage;
    return url.startsWith('/uploads') ? `http://localhost:5000${url}` : url;
  };

  const validImages = hall.images?.filter(Boolean) || [];
  const displayImages = validImages.length > 0 ? validImages : [defaultImage];

  return (
    <div className="bg-white min-h-screen pb-20 font-sans">
      
      {/* Photo Gallery Grid (Airbnb Style) */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">{hall.name}</h1>
        
        {displayImages.length === 1 ? (
          <div className="w-full h-[40vh] md:h-[60vh] rounded-3xl overflow-hidden cursor-pointer relative group shadow-sm border border-slate-100" onClick={() => setSelectedImageIndex(0)}>
            <img 
              src={getImageUrl(displayImages[0])} 
              alt={hall.name}
              onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-[40vh] md:h-[60vh] rounded-3xl overflow-hidden relative shadow-sm border border-slate-100">
            <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer overflow-hidden h-full hidden md:block" onClick={() => setSelectedImageIndex(0)}>
              <img src={getImageUrl(displayImages[0])} alt="Main" onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </div>
            
            {displayImages.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative group cursor-pointer overflow-hidden hidden md:block h-full" onClick={() => setSelectedImageIndex(idx + 1)}>
                <img src={getImageUrl(img)} alt={`Gallery ${idx}`} onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </div>
            ))}

            {/* Mobile View - just the first image */}
            <div className="col-span-1 row-span-1 relative group cursor-pointer overflow-hidden h-full md:hidden" onClick={() => setSelectedImageIndex(0)}>
              <img src={getImageUrl(displayImages[0])} alt="Main" onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            
            <button 
              onClick={() => setSelectedImageIndex(0)}
              className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-xl shadow-lg font-bold text-slate-900 text-sm hover:bg-white hover:scale-105 transition-all flex items-center gap-2 border border-slate-200"
            >
              <ImageIcon size={16} /> Show all photos
            </button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-100">
              <div className="flex flex-wrap items-center gap-6 text-slate-600 mb-6 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="text-rose-500" />
                  <span className="font-medium">{hall.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-rose-500" />
                  <span className="font-medium">Up to {hall.capacity} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="text-rose-500" />
                  <span className="font-bold text-lg text-slate-900 border-l border-slate-200 pl-4">{hall.price.toLocaleString('en-IN')} / day</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-slate-800 mb-4">About this venue</h3>
              <p className="text-slate-600 leading-relaxed">
                {hall.description || 'No description provided.'}
              </p>
            </div>

            {/* Image Gallery removed, now placed at the top */}

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-100">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Star className="text-rose-500 fill-rose-500" />
                <h3 className="text-2xl font-bold text-slate-800">Reviews</h3>
                <span className="ml-auto text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{reviews.length} reviews</span>
              </div>
              
              {user && (
                <form onSubmit={handleReview} className="mb-8 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-4">Write a review</h4>
                  {reviewMessage.text && (
                    <div className={`p-3 rounded-lg mb-4 text-sm ${reviewMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {reviewMessage.text}
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rating (1-5)</label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(num => (
                        <button 
                          key={num} 
                          type="button"
                          onClick={() => setRating(num)}
                          className={`p-2 rounded-full transition-colors ${rating >= num ? 'text-yellow-400 bg-yellow-50' : 'text-slate-300 bg-white hover:bg-slate-100'}`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
                    <textarea 
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 p-3 focus:ring-rose-500 focus:border-rose-500"
                      rows="3"
                    ></textarea>
                  </div>
                  <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
                    Submit Review
                  </button>
                </form>
              )}

              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-slate-500 italic">No reviews yet.</p>
                ) : (
                  reviews.map(review => (
                    <div key={review._id} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-slate-800">{review.userId?.name || 'User'}</div>
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm">{review.comment}</p>
                      <span className="text-xs text-slate-400 mt-2 block">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Booking Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 sticky top-24">
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="text-rose-600" />
                Reserve this Hall
              </h3>
              
              {bookingMessage.text && (
                <div className={`p-4 rounded-lg mb-6 text-sm flex font-medium ${bookingMessage.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                  {bookingMessage.text}
                </div>
              )}

              <form onSubmit={handleBooking}>
                <div className="mb-6">
                  <label className="block font-medium text-slate-700 mb-2">Select Date</label>
                  <input 
                    type="date" 
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all shadow-sm"
                  />
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100 flex justify-between items-center text-sm">
                  <span className="text-slate-600">Total Price</span>
                  <span className="font-bold text-lg text-slate-900 border-l border-slate-200 pl-4">₹{hall.price.toLocaleString('en-IN')}</span>
                </div>

                <button 
                  type="submit" 
                  disabled={bookingLoading}
                  className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {bookingLoading ? 'Processing Requests...' : user ? 'Request to Book' : 'Login to Book'}
                </button>
              </form>
              <p className="text-xs text-center text-slate-500 mt-4">
                You won't be charged yet. Subject to admin approval.
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Full-Screen Image Modal */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-50"
          >
            <X size={32} />
          </button>
          
          {displayImages.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1);
              }}
              className="absolute left-4 md:left-8 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors bg-black/20 z-50"
            >
              <ChevronLeft size={40} />
            </button>
          )}

          <div className="w-full h-full max-w-6xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={getImageUrl(displayImages[selectedImageIndex])} 
              alt="Preview" 
              onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }}
              className="max-w-full max-h-[85vh] object-contain select-none"
            />
          </div>

          {displayImages.length > 1 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(prev => prev === displayImages.length - 1 ? 0 : prev + 1);
              }}
              className="absolute right-4 md:right-8 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors bg-black/20 z-50"
            >
              <ChevronRight size={40} />
            </button>
          )}
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/90 font-medium tracking-wide bg-black/50 px-4 py-1.5 rounded-full text-sm">
            {selectedImageIndex + 1} / {displayImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default HallDetails;
