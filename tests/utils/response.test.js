const { successResponse, errorResponse } = require('../../src/utils/response');

describe('Response utils', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('successResponse', () => {
    it('sends 200 with success body by default', () => {
      successResponse(res, { id: 1 }, 'Ok');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Ok',
        data: { id: 1 }
      });
    });

    it('uses default message "Success" if not provided', () => {
      successResponse(res, null);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Success' }));
    });

    it('accepts custom status code', () => {
      successResponse(res, null, 'Created', 201);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('passes null data through', () => {
      successResponse(res, null, 'Deleted');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: null }));
    });
  });

  describe('errorResponse', () => {
    it('sends 500 with error body by default', () => {
      errorResponse(res, 'Something went wrong');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Something went wrong'
      });
    });

    it('accepts custom status code', () => {
      errorResponse(res, 'Not found', 404);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
