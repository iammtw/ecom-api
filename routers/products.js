const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');

const {auth, adminRole} = require('../helpers/verifyToken');

// Models and Schemas
require('../models/product');
require('../models/category');
const Product = mongoose.model('Product');
const Category = mongoose.model('Category');

// Multer Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.replace(' ','-');
      cb(null, fileName + '-' + Date.now())
    }
  })
   
  const upload = multer({ storage: storage })

// router.get(`/`,async (req,res)=> {
//     const productList = await Product.find().populate('category');
//     // const productList = await Product.find().select('name image -_id');
//     if(!productList){
//         res.status(500).json({ success: false });
//     }
//     res.json(productList);
// });

router.get(`/`, async (req,res)=> {
    let filter ={};
    
    if(req.query.categories){
         filter = {category: req.query.categories.split(',')};
    }

    const productList = await Product.find(filter).populate('category');
    // const productList = await Product.find().select('name image -_id');
    if(!productList){
        res.status(500).json({ success: false });
    }
    res.json(productList);
});

router.get(`/:id`,async (req,res)=> {
    const product =  await Product.findById(req.params.id).populate('category');
    if(!product){
        res.status(500).json({ success: false });
    }
    res.json(product);
});

router.post(`/`,auth,adminRole,upload.single('image'), async (req,res)=> {
    const category = await Category.findById(req.body.category);
    if(!category) {
        return res.status(500).send('The category doesnt found!')
    };

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });

    product = await product.save();
    if(!product){
        return res.status(500).send('The product cannot be created!');
    }
    return res.send(product);

});

router.put(`/:id`,auth,adminRole,async (req,res)=> {
    if(!mongoose.isValidObjectId(req.body.category)){
        return res.status(400).send('Invalid Product id!');
    }
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(500).send('The category doesnt found!');

    const product = await Product.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    }, { new: true });

    if(!product){
        res.send('empty');
    }
    res.json(product);
});

router.delete(`/:id`,auth,adminRole,async (req,res)=> {
    const product = await Product.findByIdAndRemove(req.params.id);
    if(!product){
        res.send('empty');
    }
    res.json(product);
});

router.get(`/get/count`,async (req,res)=> {
    // const productCount = await Product.countDocuments((count) => count);
    const productCount = await Product.find().count();
    if(!productCount){
       res.status(500).json({ success: false })
    }
    res.json({
        productCount: productCount
    });
});

router.get(`/get/featured/:count`,async (req,res)=> {
    const count = req.params.count ? req.params.count : 0;
    const productList = await Product.find({ isFeatured: true }).limit(+count);
    if(!productList){
        res.status(500).json({ success: false });
    }
    res.json(productList);
});


module.exports = router; 