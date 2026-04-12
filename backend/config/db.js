const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("MongoDB URI is not defined in .env. The backend cannot connect to the database.");
      process.exit(1);
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

const seedDatabase = async () => {
  try {
    const hallCount = await Hall.countDocuments();
    if (hallCount === 0) {
      console.log('Seeding memory DB with initial data...');
      
      const admin = await User.create({
        name: "Admin User",
        email: "harsh@admin.com",
        password: "password123",
        role: "admin"
      });
      console.log('Created Seed Admin - (Email: harsh@admin.com, Password: password123)');

      await Hall.insertMany([
        {
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
          name: "Sunset Beach Resort",
          location: "Goa",
          price: 250000,
          capacity: 500,
          description: "A breathtaking beachfront venue. Walk down the aisle with the sound of the ocean waves behind you.",
          images: ["https://images.unsplash.com/photo-1546198632-9ef6368bef12?auto=format&fit=crop&w=1200&q=80"]
        },
        {
          name: "Heritage Fort Manor",
          location: "Jaipur, Rajasthan",
          price: 350000,
          capacity: 1500,
          description: "Give your wedding a royal touch in an authentic centuries-old fort.",
          images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1200&q=80"]
        }
      ]);
      console.log('Seeded halls successfully!');
    }
  } catch(err) {
    console.error("Failed to seed DB:", err);
  }
};

module.exports = connectDB;
