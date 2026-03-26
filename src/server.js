// src/server.js
const express = require('express');
const path = require('path');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/', incomeRoutes);
app.use('/', expenseRoutes);

app.listen(port, () => {
  console.log(`Budget manager running at http://localhost:${port}`);
});

