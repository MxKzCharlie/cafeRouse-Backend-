const express = require('express');
const cors = require('cors');
const stripeRoutes = require('./stripeService');
const twilioRoutes = require('./twilioService');
const PORT = process.env.PORT;

const app = express();

app.use(cors({ origin: ['https://caferouse.com'] })); 

app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/stripe/webhook')) {
    next(); 
  } else {
    express.json()(req, res, next); 
  }
});

app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

app.use('/api/stripe', stripeRoutes); 
app.use('/api/twilio', twilioRoutes);

module.exports = (req, res) => {
  app(req, res);
};
