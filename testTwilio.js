const express = require('express');
const app = express();
const port = 3000;

app.post('/webhooks/message-status', (req, res) => {
  const messageSid = req.body.MessageSid;
  const messageStatus = req.body.MessageStatus;

  console.log(`Mensaje SID: ${messageSid}, Estado: ${messageStatus}`);

  // Aquí puedes implementar la lógica para manejar cada estado del mensaje según tus necesidades

  res.sendStatus(200);
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});