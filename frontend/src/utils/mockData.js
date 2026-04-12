export const mockHalls = [
  {
    _id: "m1",
    name: "The Grand Royal Palace",
    location: "Mumbai, Maharashtra",
    price: 150000,
    capacity: 1000,
    description: "Experience the ultimate luxury for your special day. The Grand Royal Palace offers stunning architecture, crystal chandeliers, and a massive banquet area perfect for grand weddings.",
    images: [
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    _id: "m2",
    name: "Sunset Beach Resort",
    location: "Goa",
    price: 250000,
    capacity: 500,
    description: "A breathtaking beachfront venue. Walk down the aisle with the sound of the ocean waves behind you. Includes indoor and outdoor spaces.",
    images: [
      "https://images.unsplash.com/photo-1546198632-9ef6368bef12?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    _id: "m3",
    name: "Heritage Fort Manor",
    location: "Jaipur, Rajasthan",
    price: 350000,
    capacity: 1500,
    description: "Give your wedding a royal touch in an authentic centuries-old fort. Breathtaking views, heritage architecture, and premium catering services.",
    images: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    _id: "m4",
    name: "Emerald Garden Pavilion",
    location: "Bangalore, Karnataka",
    price: 90000,
    capacity: 300,
    description: "A lush green oasis in the middle of the city. Perfect for aesthetic daytime weddings and evening receptions under the stars.",
    images: [
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

export const mockReviews = [
  {
    _id: "r1",
    userId: { name: "Anjali S." },
    rating: 5,
    comment: "Absolutely gorgeous venue! The staff was incredibly helpful and our guests couldn't stop talking about the decorations.",
    createdAt: new Date().toISOString()
  },
  {
    _id: "r2",
    userId: { name: "Rahul K." },
    rating: 4,
    comment: "Very spacious and beautiful. Only dock is the parking size, but the hall itself is 10/10.",
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  }
];
