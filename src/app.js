const express = require('express');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

module.exports = app;
