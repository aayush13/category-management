import Category from "../../models/Category.js";
import getAllDescendants from "../../utils/index.js";

export async function createCategory(req, res) {
  try {
    const { name, parent } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ message: "Please add category name in the request body." });
    }
    const category = new Category({ name, parent });
    await category.save();
    return res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function updateCategory(req, res) {
  try {
    const { name, parent } = req.body;
    //check if the required field is available
    if (!name) {
      return res
        .status(400)
        .json({ message: "Please add updated name in the request body." });
    }
    //prevent circular reference
    if (req.params.id == parent) {
      return res
        .status(400)
        .json({ message: "Circular reference not allowed" });
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, parent },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    // get all the child docs upto level-n
    const docsToDelete = await getAllDescendants(id);
    docsToDelete.push(id);
    const result = await Category.deleteMany({
      _id: { $in: docsToDelete },
    });

    return res.status(200).json({
      message: "Category / subcategories deleted successfully",
      result,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getTree(req, res) {
  try {
    const categories = await Category.find().lean();
    const buildTree = (parentId) => {
      return categories
        .filter((cat) => String(cat.parent) === String(parentId)) // get all the nodes with null parent
        .map((cat) => ({ ...cat, children: buildTree(cat._id) })); // using recursive call get all the child docs
    };
    const tree = buildTree(null);
    return res.status(200).json(tree);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getCategoryList(req, res) {
  try {
    const categories = await Category.find().lean();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
