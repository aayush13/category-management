const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

//middleware
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json());

// Use category routes
app.use('/api/categories', categoryRoutes);

// MongoDB Connection
const mongoURI= (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/categoryMgmt')
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