require('dotenv').config();
const path = require('path');
const express = require('express');
const apiRouter = require('./api');

const app = express();

app.use('/api', apiRouter);
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public/index.html'));
});

const PORT = 8080;
app.listen(process.env.PORT || PORT, () => {
  console.log(`listening on PORT ${PORT}, homie!`);
});


app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

module.exports = app;
