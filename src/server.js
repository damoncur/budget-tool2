// src/server.js
const express = require('express');
const path = require('path');
const store = require('./data/store');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const groupAssetRoutes = require('./routes/groupAssetRoutes');

const app = express();
const port = 3000;

// Load saved data on startup
store.load();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/', incomeRoutes);
app.use('/', expenseRoutes);
app.use('/', groupAssetRoutes);

// Save data on shutdown
function shutdown(signal) {
  console.log(`\n${signal} received. Saving data before exit...`);
  store.save();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

app.listen(port, () => {
  console.log(`Budget manager running at http://localhost:${port}`);
});

