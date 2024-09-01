const express = require('express');
const mysql = require('mysql2');
const qrcode = require('qrcode');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Connect to MySQL Database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'locationdb'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected...');
});

// API to get location data
app.get('/api/locations/:id', (req, res) => {
  const locationId = req.params.id;
  db.query('SELECT * FROM locations WHERE id = ?', [locationId], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'Location not found' });
    }
  });
});

// API to generate QR code for location
app.get('/api/qr/:id', (req, res) => {
  const locationId = req.params.id;
  db.query('SELECT * FROM locations WHERE id = ?', [locationId], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      const location = results[0];
      const lat = location.latitude; 
      const lon = location.longitude;
      const locationName = location.name; // Assuming your table has a 'name' column

      // Create a JSON object with latitude, longitude, and location name
      const qrData = JSON.stringify({ latitude: lat, longitude: lon, name: locationName });

      // Generate QR code with the location data
      qrcode.toDataURL(qrData, (err, url) => {
        if (err) throw err;
        res.json({ qrCode: url });
      });
    } else {
      res.status(404).json({ message: 'Location not found' });
    }
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
