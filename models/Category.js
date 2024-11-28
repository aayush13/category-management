import mongoose from 'mongoose';

/** 
 * schema for each category
 * name - holds the category name
 * parent - ObjectId of the parent category
**/ 

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }
});

export default mongoose.model('Category', CategorySchema);
