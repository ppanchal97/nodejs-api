const { getHealth } = require('../../controllers/healthController');

describe('healthController', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getHealth', () => {
    it('should return 200 with status ok', () => {
      getHealth(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ok',
          timestamp: expect.any(String),
          uptime: expect.any(Number)
        })
      );
    });

    it('should return a valid ISO timestamp', () => {
      getHealth(req, res);

      const jsonArg = res.json.mock.calls[0][0];
      expect(new Date(jsonArg.timestamp).toISOString()).toBe(jsonArg.timestamp);
    });

    it('should return a non-negative uptime', () => {
      getHealth(req, res);

      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
