const express = require('express');
const cors = require('cors');
// const stripeRoutes = require('./stripeService');
const twilioRoutes = require('./twilioService');

const app = express();

// Permitir solicitudes desde tu frontend
app.use(cors({ origin: ['https://caferouse.com'] })); 
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

// Rutas de la API
// app.use('/api/stripe', stripeRoutes);
app.use('/api/twilio', twilioRoutes);

// Exportar la aplicación como función
module.exports = (req, res) => {
  app(req, res);
};
