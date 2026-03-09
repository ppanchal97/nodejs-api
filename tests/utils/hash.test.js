const { hashPassword, comparePassword } = require('../../src/utils/hash');

describe('Hash utils', () => {
  it('hashes a password into a different string', async () => {
    const hash = await hashPassword('password123');
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe('password123');
  });

  it('returns true when comparing correct password', async () => {
    const hash = await hashPassword('password123');
    const result = await comparePassword('password123', hash);
    expect(result).toBe(true);
  });

  it('returns false when comparing wrong password', async () => {
    const hash = await hashPassword('password123');
    const result = await comparePassword('wrongpassword', hash);
    expect(result).toBe(false);
  });

  it('generates different hashes for same password', async () => {
    const hash1 = await hashPassword('password123');
    const hash2 = await hashPassword('password123');
    expect(hash1).not.toBe(hash2);
  });
});
