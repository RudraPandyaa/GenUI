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

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));