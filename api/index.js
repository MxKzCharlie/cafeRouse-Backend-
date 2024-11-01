const express = require('express');
const cors = require('cors');
const stripeRoutes = require('./stripeService');
const twilioRoutes = require('./twilioService');
const PORT = process.env.PORT;

const app = express();

app.use(cors({ origin: ['https://caferouse.com'] })); 
app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

app.use('/api/stripe', stripeRoutes);
app.use('/api/twilio', twilioRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = (req, res) => {
  app(req, res);
};
