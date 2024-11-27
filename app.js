const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));

// Use category routes
app.use('/api/categories', categoryRoutes);

// MongoDB Connection
const mongoURI= (process.env.MONGO_URI || "mongodb+srv://aayush:qwerty123@cluster10.qoffs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster10")
mongoose.set('debug', true);
mongoose.connect(mongoURI)
    .then(() => {
    console.log('Connected',mongoURI );
  }).catch(err => {
    console.error('Connection issue:', err);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


module.exports = app;