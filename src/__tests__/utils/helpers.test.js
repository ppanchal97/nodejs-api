const { generateId, sanitizeString, isValidEmail, formatResponse, paginate } = require('../../utils/helpers');

describe('helpers utilities', () => {
  describe('generateId', () => {
    it('should return a string', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
    });

    it('should return a non-empty string', () => {
      const id = generateId();
      expect(id.length).toBeGreaterThan(0);
    });

    it('should return unique IDs on successive calls', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('sanitizeString', () => {
    it('should trim leading and trailing whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove < characters', () => {
      expect(sanitizeString('a<b')).toBe('ab');
    });

    it('should remove > characters', () => {
      expect(sanitizeString('a>b')).toBe('ab');
    });

    it('should remove both < and > from XSS-like strings', () => {
      expect(sanitizeString('<script>')).toBe('script');
    });

    it('should return empty string for null', () => {
      expect(sanitizeString(null)).toBe('');
    });

    it('should return empty string for undefined', () => {
      expect(sanitizeString(undefined)).toBe('');
    });

    it('should return empty string for number', () => {
      expect(sanitizeString(123)).toBe('');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should return true for standard valid email', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('should return true for email with subdomain', () => {
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true);
    });

    it('should return false for string without @', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
    });

    it('should return false for email with no local part', () => {
      expect(isValidEmail('@nodomain.com')).toBe(false);
    });

    it('should return false for email with no domain', () => {
      expect(isValidEmail('user@')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('formatResponse', () => {
    it('should format success response with data', () => {
      const result = formatResponse(true, { id: 1 });
      expect(result).toEqual({ success: true, data: { id: 1 } });
    });

    it('should format error response with message', () => {
      const result = formatResponse(false, null, 'Error occurred');
      expect(result).toEqual({ success: false, message: 'Error occurred' });
    });

    it('should include only success when no data or message', () => {
      const result = formatResponse(true);
      expect(result).toEqual({ success: true });
      expect(result).not.toHaveProperty('data');
      expect(result).not.toHaveProperty('message');
    });

    it('should include both data and message when both provided', () => {
      const result = formatResponse(true, [1, 2], 'OK');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message', 'OK');
    });
  });

  describe('paginate', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

    it('should return first page with default limit of 10', () => {
      const result = paginate(items);
      expect(result.data).toHaveLength(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(3);
    });

    it('should return correct items for page 2', () => {
      const result = paginate(items, 2, 10);
      expect(result.data[0].id).toBe(11);
      expect(result.pagination.page).toBe(2);
    });

    it('should return remaining items on the last page', () => {
      const result = paginate(items, 3, 10);
      expect(result.data).toHaveLength(5);
    });

    it('should cap limit at 100', () => {
      const result = paginate(items, 1, 200);
      expect(result.pagination.limit).toBe(100);
    });

    it('should enforce minimum limit of 1', () => {
      const result = paginate(items, 1, 0);
      expect(result.pagination.limit).toBe(1);
    });

    it('should treat page 0 as page 1', () => {
      const result = paginate(items, 0);
      expect(result.pagination.page).toBe(1);
    });

    it('should handle empty array', () => {
      const result = paginate([]);
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });
});
