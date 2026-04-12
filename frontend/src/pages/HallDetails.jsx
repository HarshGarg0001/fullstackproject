import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapPin, Users, IndianRupee, Calendar, Image as ImageIcon, Star } from 'lucide-react';

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
        setHall(foundHall || mockHalls[0]);
        setReviews(mockReviews);
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
      setReviewMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to add review.' 
      });
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!hall) return <div className="text-center py-20 text-2xl font-bold text-slate-700">Hall not found</div>;

  const defaultImage = "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
  const getImageUrl = (url) => {
    if (!url) return defaultImage;
    return url.startsWith('/uploads') ? `http://localhost:5000${url}` : url;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 h-64 md:h-96 relative">
        <img 
          src={hall.images && hall.images.length > 0 ? getImageUrl(hall.images[0]) : defaultImage} 
          alt={hall.name}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center px-4 drop-shadow-lg">{hall.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
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

            {/* Image Gallery */}
            {hall.images && hall.images.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-100">
                <div className="flex items-center gap-2 mb-6">
                  <ImageIcon className="text-rose-500" />
                  <h3 className="text-2xl font-bold text-slate-800">Gallery</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hall.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={getImageUrl(img)} 
                      alt={`${hall.name} ${idx+1}`} 
                      className="w-full h-40 object-cover rounded-xl shadow-sm hover:scale-[1.02] transition-transform"
                    />
                  ))}
                </div>
              </div>
            )}

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
    </div>
  );
};

export default HallDetails;
