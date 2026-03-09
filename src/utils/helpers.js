const crypto = require('crypto');

const generateId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const formatResponse = (success, data = null, message = null) => {
  const response = { success };
  if (data !== null) response.data = data;
  if (message !== null) response.message = message;
  return response;
};

const paginate = (items, page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;

  return {
    data: items.slice(startIndex, endIndex),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: items.length,
      totalPages: Math.ceil(items.length / limitNum)
    }
  };
};

module.exports = { generateId, sanitizeString, isValidEmail, formatResponse, paginate };
