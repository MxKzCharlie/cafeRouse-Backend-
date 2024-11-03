require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const router = express.Router();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/send-sms-pickup', async (req, res) => {
    const { dataClient, orderDetails } = req.body;

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
    
    const numTel = buildNumber(dataClient.Numero);
    const order = buildOrder(orderDetails);

    try {
        const customerMessage = await client.messages.create({
            contentVariables: JSON.stringify({"1": dataClient.Nombre}),
            contentSid: 'HX32202a50a68b6c6b89be6beddf6f1c90',
            from: '+14702038017',
            to: numTel,
        });

        const cafeMessage = await client.messages.create({
            contentVariables: JSON.stringify({
                "1": dataClient.Nombre, 
                "2": order,
                "3": `$${dataClient.total}`
            }),
            contentSid: 'HX98f9b1293fcdb976c0fa8bc116af3746',
            from: '+14702038017',
            to: '+526647354900',
        });

        res.status(200).json({ success: true});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'No se pudo enviar el mensaje' });
    }
});

router.post('/send-sms-delivery', async (req, res) => {
    const { dataClient, orderDetails } = req.body;

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
        const customerMessage = await client.messages.create({
            contentVariables: JSON.stringify({"1": dataClient.Nombre}),
            contentSid: 'HX7c85110cce002b720781987578f54036',
            from: '+14702038017',
            to: numTel,
        });

        const cafeMessage = await client.messages.create({
            contentVariables: JSON.stringify({
                "1": dataClient.Nombre,
                "2": order,
                "3": `$${dataClient.total}`,
                "4": dataClient.Pago,
                "5": adress
            }),
            contentSid: 'HX468c83f64d824575ee3b44f06a908631',
            from: '+14702038017',
            to: '+526647354900',
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'No se pudo enviar el mensaje' });
    }
});
  

module.exports = router;
