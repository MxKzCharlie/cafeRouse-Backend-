require('dotenv').config();
console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  const total = req.body.total * 100;
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product: 'prod_R8YPyL0vvCxTLS',
            unit_amount: total,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://caferouse.com/tienda/thankyou/delivery/',
      cancel_url: 'https://caferouse.com/tienda/pagar/',
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
