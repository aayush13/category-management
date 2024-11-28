import Category from '../models/Category.js';  

async function getAllDescendants(parentId) {
  const descendants = [];
   
  // find first level child docs
  const children = await Category.find({ parent: parentId });

  for (const child of children) {
    descendants.push(child._id);  
    // find next level child docs
    const childDescendants = await getAllDescendants(child._id);
    descendants.push(...childDescendants); 
  }

  return descendants;
}

export default getAllDescendants