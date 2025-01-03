import app, { connectDB } from '../app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
import Category from '../models/Category';
const request = require('supertest');

let mongoServer;
let server
dotenv.config();

beforeAll(async () => {
  // Set up in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri(); 
  process.env.DATABASE_URL = uri; 
  // Connect to the in-memory MongoDB
  await connectDB(); 

  server = app.listen(9000, () => {
    console.log('Server running on port 3000');
  });
});

afterAll(async () => {
 // close connections
  await mongoose.disconnect(); 
  await mongoServer.stop();
  await new Promise(resolve => server.close(resolve)); // Ensure server close is awaited
});

beforeEach(async () => {
  await Category.deleteMany({});
});



describe('Category API', () => {
  //Test create - /create
  //Scenario 1 - create a new category/ sub-category
  it('should create a new category', async () => {
    const res = await request(server).post('/api/categories/create').send({ name: 'Electronics', parent: null });
    expect(res.statusCode).toEqual(201);
    expect(res.body.category).toHaveProperty('_id');
    expect(res.body.category.name).toBe('Electronics');
  });

  // Scenario 2 - Handle create requests without category name
  it('should not create a category without a name', async () => {
    const res = await request(server).post('/api/categories/create').send({ parent: null });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('Please add category name in the request body.');
  });

  //Scenario 3- Handle sub-category create requests with invalid parent ID
  it('should not create a subcategory with invalid parent ID', async () => {
    const res = await request(server).post('/api/categories/create').send({ name: 'Invalid Parent', parent: 'invalidID' });
    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toContain('Cast to ObjectId failed');
  });

  // Test update - /update/:id
  //Scenario 4 - Successfully update exisiting category
  it('should update an existing category', async () => {
    const category = new Category({ name: 'Books' });
    await category.save();

    const res = await request(server).put(`/api/categories/update/${category._id}`).send({ name: 'Updated Books' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.category.name).toBe('Updated Books');
  });

  //Scneario 5 - Handle category/sub-category update request for an invalid id
  it('should return an error when updating  an invalid id', async () => {
    const res = await request(server).put('/api/categories/update/60f1bdb4b5a55b2d44').send({ name: 'Updated Name' });
    expect(res.body.message).toContain('Cast to ObjectId failed for value');
  });

  //Scneario 6 - Circular reference
  it('do not allow a category to be its own parent', async () => {
    const category = new Category({ name: 'Circular' });
    await category.save();

    const res = await request(app)
      .put(`/api/categories/update/${category._id}`)
      .send({name: 'Circular', parent: category._id });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('Circular reference not allowed');
  });

  // Test Deletion - /delete/:id
  //Scneario 7 - Successfully delete a category/subcategory
  it('should delete a category and its subcategories', async () => {
    const parentCategory = new Category({ name: 'Parent Category' });
    await parentCategory.save();
    const subCategory = new Category({ name: 'Sub Category', parent: parentCategory._id });
    await subCategory.save();

    const res = await request(server).delete(`/api/categories/delete/${parentCategory._id}`);
    expect(res.statusCode).toEqual(200);
    const categories = await Category.find();
    expect(categories.length).toBe(0);
  });

  //Scenario 8 - Handle delete request for an invalid id 
  it('return an error when deleting a non-existent category', async () => {
    const res = await request(server).delete('/api/categories/delete/60f1bdb4b5a55be63a');
    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toContain('Cast to ObjectId failed for value');
  });

  // Test get Category Tree - /
  //Scneario 9- Get category tree.
  it('retrieve the category tree', async () => {
    const parentCategory = new Category({ name: 'Parent' });
    await parentCategory.save();
    console.log(parentCategory)

    const subCategory = new Category({ name: 'Child', parent: parentCategory._id });
    await subCategory.save();
    
    const res = await request(server).get('/api/categories/tree');
    console.log(res.body)
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Parent');
    expect(res.body[0].children[0].name).toBe('Child');
  });

  //Scneario 10- Get category tree (empty tree).
  it(' return an empty tree', async () => {
    const res = await request(server)
      .get('/api/categories/tree');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

});
