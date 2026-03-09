const { generateToken, verifyToken } = require('../../src/utils/jwt');

describe('JWT utils', () => {
  it('generates a valid JWT token string', () => {
    const token = generateToken({ id: '1', email: 'test@test.com' });
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('verifies and decodes a valid token', () => {
    const payload = { id: '1', email: 'test@test.com' };
    const token = generateToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.id).toBe('1');
    expect(decoded.email).toBe('test@test.com');
  });

  it('throws an error for an invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });

  it('throws an error for an empty string token', () => {
    expect(() => verifyToken('')).toThrow();
  });
});
