import request from 'supertest';
import app from '../../src/app';

const mockupCategory = {
  name: 'A Category',
  slug: 'a-category',
  description: 'Something is a category',
};

describe('Categories', () => {
  describe('get all categories', () => {
    it('shows list of categories', async () => {
      const response = await request(app).get('/categories').send();
      expect(response.body.txt).toEqual('workshop');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Create new a category', () => {
    it('#create successfully', async () => {
      const response = await request(app).post('/categories').send(mockupCategory);
      expect(response.body.name).toEqual('A Category');
      expect(response.body.slug).toEqual('a-category');
      expect(response.body.description).toEqual('Something is a category');
      expect(response.statusCode).toBe(201);
    });
  });
});
