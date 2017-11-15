const router = require('express').Router();

router.get('/', (req, res) => {
  res.json('nothing to see here');
});

router.get('/translate', (req, res) => {
  res.json(process.env.YANDEX_API_KEY);
});

router.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

module.exports = router;
