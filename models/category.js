const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
   name: {
       type: String,
       required : true,
   },
   color: {
       type: String,
   },
   icon: {
       type: String,
   },
});

// categorySchema.virtual('id').get(() => this._id.toHexString());
// categorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
 

