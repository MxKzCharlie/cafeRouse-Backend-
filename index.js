const express = require('express');
const cors = require('cors');
// const stripeRoutes = require('./stripeService');
const twilioRoutes = require('./twilioService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['https://caferouse.com/tienda/pagar/'] }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

// app.use('/api/stripe', stripeRoutes);
app.use('/api/twilio', twilioRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
