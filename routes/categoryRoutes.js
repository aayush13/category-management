import express from 'express';
import Category from '../models/Category.js';  
import getAllDescendants from '../utils/index.js';
import { 
  createCategory,
  updateCategory,
  deleteCategory,
  getTree,
  getCategoryList 
} from '../controllers/categoryMgmt/index.js';
const router = express.Router();

// create new categories
router.post("/create", (req, res) => {
  createCategory(req, res);
});

// Update an existing category
router.put("/update/:id", async (req, res) => {
  updateCategory(req, res)
});

// Delete a category or subcategories
router.delete("/delete/:id", async (req, res) => {
  deleteCategory(req, res)
});

// Get categories in tree - 
router.get("/tree", async (req, res) => {
  getTree(req, res);
});

// Get all categories in an array of objects
router.get("/", async (req, res) => {
  getCategoryList(req,res);
});

export default router;
