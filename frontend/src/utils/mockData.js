export const mockHalls = [
  {
    _id: "m1",
    name: "The Grand Royal Palace",
    location: "Mumbai, Maharashtra",
    price: 150000,
    capacity: 1000,
    description: "Experience the ultimate luxury for your special day. The Grand Royal Palace offers stunning architecture, crystal chandeliers, and a massive banquet area perfect for grand weddings.",
    images: [
      "https://loremflickr.com/1200/800/wedding,stage?lock=11",
      "https://loremflickr.com/1200/800/wedding,banquet?lock=12",
      "https://loremflickr.com/1200/800/wedding,decoration?lock=13",
      "https://loremflickr.com/1200/800/wedding,seating?lock=14",
      "https://loremflickr.com/1200/800/wedding,luxury?lock=15"
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
      "https://loremflickr.com/1200/800/beach,wedding?lock=21",
      "https://loremflickr.com/1200/800/ocean,wedding?lock=22",
      "https://loremflickr.com/1200/800/outdoor,wedding?lock=23",
      "https://loremflickr.com/1200/800/beach,banquet?lock=24",
      "https://loremflickr.com/1200/800/sunset,wedding?lock=25"
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
      "https://loremflickr.com/1200/800/royal,wedding?lock=31",
      "https://loremflickr.com/1200/800/fort,wedding?lock=32",
      "https://loremflickr.com/1200/800/indian,wedding?lock=33",
      "https://loremflickr.com/1200/800/traditional,wedding?lock=34",
      "https://loremflickr.com/1200/800/heritage,wedding?lock=35"
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
      "https://loremflickr.com/1200/800/garden,wedding?lock=41",
      "https://loremflickr.com/1200/800/floral,wedding?lock=42",
      "https://loremflickr.com/1200/800/outdoor,banquet?lock=43",
      "https://loremflickr.com/1200/800/green,wedding?lock=44",
      "https://loremflickr.com/1200/800/forest,wedding?lock=45"
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
