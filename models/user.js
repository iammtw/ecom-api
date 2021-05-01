const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    street: {
        type: String,
        default : ''
    },
    appartment: {
        type: String,
        default : ''
    },
    city: {
        type: String,
        default : ''
    },
    zip: {
        type: String,
        default : ''
    },
    country: {
        type: String,
        default : ''
    },
    phone: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default : false
    },
});

// userSchema.virtual('id').get(() => this._id.toHexString());
// userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
 

   