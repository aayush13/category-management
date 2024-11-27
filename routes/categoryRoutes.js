const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// create new categories
router.post("/create", async (req, res) => {
  try {
    const { name, parent } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Please add category name in the request body." });
    }
    const category = new Category({ name, parent });
    await category.save();
    return res.status(201).json({ message: "Category created successfully", category });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Update an existing category
router.put("/update/:id", async (req, res) => {
  try {
    const { name, parent } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Please add updated name in the request body." });
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, parent },
      { new: true }
    );
    return res.status(200).json({ message: "Category updated successfully", category });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Delete a category or subcategories
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Category.deleteMany({
      $or: [{ _id: id }, { parent: id }],
    });

    return res.status(200).json({ message: "Category / subcategories deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Get categories in tree - 
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().lean();
    const buildTree = (parentId) => {
      return categories
        .filter((cat) => String(cat.parent) === String(parentId))
        .map((cat) => ({ ...cat, children: buildTree(cat._id) }));
    };
    const tree = buildTree(null);
    return res.status(200).json(tree);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
