const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./controller/userController');
dotenv.config();


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// Serve the uploaded images statically so frontend can display them
app.use('/uploads', express.static('uploads'));

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/GenUI";

mongoose.set('strictQuery', false);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10s
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  // Optional: exit to trigger Render restart failure (helps spotting env problems)
  // process.exit(1);
});
// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));