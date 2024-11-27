const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Category = require('../models/Category');

let mongoServer;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) { 
    await mongoose.disconnect();  
  }
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  console.log(process.env.MONGO_URI)
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Category.deleteMany({});
});

describe('Category API', () => {
  
  //Test create - /create
  //Scenario 1 - create a new category/ sub-category
  it('should create a new category', async () => {
    const res = await request(app).post('/api/categories/create').send({ name: 'Electronics', parent: null });
    expect(res.statusCode).toEqual(201);
    expect(res.body.category).toHaveProperty('_id');
    expect(res.body.category.name).toBe('Electronics');
  });

  // Scenario 2 - Handle create requests without category name
  it('should not create a category without a name', async () => {
    const res = await request(app).post('/api/categories/create').send({ parent: null });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('Please add category name in the request body.');
  });

  //Scenario 3- Handle sub-category create requests with invalid parent ID
  it('should not create a subcategory with invalid parent ID', async () => {
    const res = await request(app).post('/api/categories/create').send({ name: 'Invalid Parent', parent: 'invalidID' });
    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toContain('Cast to ObjectId failed');
  });

  // Test update - /update/:id
  //Scenario 4 - Successfully update exisiting category
  it('should update an existing category', async () => {
    const category = new Category({ name: 'Books' });
    await category.save();

    const res = await request(app).put(`/api/categories/update/${category._id}`).send({ name: 'Updated Books' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.category.name).toBe('Updated Books');
  });

  //Scneario 5 - Handle category/sub-category update request for an invalid id
  it('should return an error when updating  an invalid id', async () => {
    const res = await request(app).put('/api/categories/update/60f1bdb4b5a55b2d44').send({ name: 'Updated Name' });
    expect(res.body.message).toContain('Cast to ObjectId failed for value');
  });

  // Test Deletion - /delete/:id
  //Scneario 6 - Successfully delete a category/subcategory
  it('should delete a category and its subcategories', async () => {
    const parentCategory = new Category({ name: 'Parent Category' });
    await parentCategory.save();
    const subCategory = new Category({ name: 'Sub Category', parent: parentCategory._id });
    await subCategory.save();

    const res = await request(app).delete(`/api/categories/delete/${parentCategory._id}`);
    expect(res.statusCode).toEqual(200);
    const categories = await Category.find();
    expect(categories.length).toBe(0);
  });

  //Scenario 7 - Handle delete request for an invalid id 
  it('should return an error when deleting a non-existent category', async () => {
    const res = await request(app).delete('/api/categories/delete/60f1bdb4b5a55be63a');
    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toContain('Cast to ObjectId failed for value');
  });

  // Test get Category Tree - /
  //Scneario 8- Get category tree.
  it('should retrieve the category tree', async () => {
    const parentCategory = new Category({ name: 'Parent' });
    await parentCategory.save();

    const subCategory = new Category({ name: 'Child', parent: parentCategory._id });
    await subCategory.save();
    
    const res = await request(app).get('/api/categories/');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Parent');
    expect(res.body[0].children[0].name).toBe('Child');
  });
});
