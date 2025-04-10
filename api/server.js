const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve todos os arquivos da pasta atual (HTML, imagens, etc)
app.use(express.static(path.join(__dirname)));

// Endpoint que o Marketing Cloud chama quando executa sua activity
app.post('/execute', (req, res) => {
  console.log('Executando com os dados:', req.body);
  res.status(200).send({ message: 'Executado com sucesso!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});