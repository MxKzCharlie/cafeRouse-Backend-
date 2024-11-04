require('dotenv').config();
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const twilio = require("twilio")(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/create-checkout-session', async (req, res) => {
  const { dataClient, orderDetails } = req.body;
  const totalAmount = dataClient.total * 100;
        
  function buildNumber(number){
    const list = number.split(/[- ]/);
    const finalNumber = list.join("");
      
    return finalNumber;
  }

  function buildOrder(order) {
      let newOrderList = [...order];
  
      for(let i = 0; i < newOrderList.length; i++){
          let detailsText = newOrderList[i][1].join("-");
          newOrderList[i][1] = detailsText;
          let singleOrder = newOrderList[i].join(";");
          newOrderList[i] = singleOrder;
      }
  
      const finalOrderText = newOrderList.join(" <=> ");
      return finalOrderText;
  }

  function buildAdress(dataClient) {
      let finalAdressList = [];
      const keyToCheck = ['Address', 'Colonia', 'Delegation'];
  
      Object.entries(dataClient).forEach(([key, value]) => {
          if(keyToCheck.includes(key)){
              let textString = "";
              textString = `${key}= ${value}`;
              finalAdressList.push(textString);
          }
      });
  
      const finalAdress = finalAdressList.join(", ")
      return finalAdress;
  }
    
  const adress = buildAdress(dataClient);
  const numTel = buildNumber(dataClient.Numero);
  const order = buildOrder(orderDetails);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product: 'prod_R8YPyL0vvCxTLS',
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        numTel: numTel,
        adress: adress,
        order: order,
        total: dataClient.total,
        pago: dataClient.Pago,
        nombre: dataClient.Nombre
      },
      mode: 'payment',
      success_url: 'https://caferouse.com/tienda/thankyou/',
      cancel_url: 'https://caferouse.com',
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//<---------- WebHook Of STRIPE ---------->

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; 
  const sig = req.headers["stripe-signature"];

  let event;
  try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (error) {
      console.log(`Webhook signature verification failed: ${error}`);
      return res.sendStatus(400);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    const updatedPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntent.id);
    console.log(updatedPaymentIntent.metadata);

    try {
      const messageToClient = await twilio.messages.create({
        contentVariables: JSON.stringify({ "1": paymentIntent.metadata.nombre }),
        contentSid: 'HX7c85110cce002b720781987578f54036',
        from: '+14702038017',
        to: updatedPaymentIntent.metadata.numTel,
      });
      console.log("Mensaje al cliente enviado:", messageToClient.sid);
    } catch (error) {
      console.error("Error al enviar mensaje al cliente:", error);
      return res.sendStatus(500);
    }

    // Mensaje para la cafetería
    try {
      const messageToCoffeeShop = await twilio.messages.create({
        contentVariables: JSON.stringify({
          "1": paymentIntent.metadata.nombre,
          "2": paymentIntent.metadata.order,
          "3": `$${paymentIntent.metadata.total}`,
          "4": paymentIntent.metadata.pago,
          "5": paymentIntent.metadata.adress
        }),
        contentSid: 'HX468c83f64d824575ee3b44f06a908631',
        from: '+14702038017',
        to: '+526647354900',
      });
      console.log("Mensaje a la cafetería enviado:", messageToCoffeeShop.sid);
    } catch (error) {
      console.error("Error al enviar mensaje a la cafetería:", error);
      return res.sendStatus(500);
    }
  } else {
    console.error("Metadata incompleta en paymentIntent");
    return res.sendStatus(400);
  }

  res.sendStatus(200)
});
module.exports = router;
