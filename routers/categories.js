const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Models and Schemas
require('../models/category');
const Category = mongoose.model('Category');

router.get(`/`,async (req,res)=> {
    try {
        const categories = await Category.find();
        res.json(categories);
      } catch (error) {
          res.status(500);
      }
});

router.get(`/:id`,async (req,res)=> {
    try {
        const categories = await Category.find({_id: req.params.id});
        res.json(categories);
      } catch (error) {
          res.status(500);
      }
});

router.post(`/`, async (req,res)=> {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });
   
    category = await category.save();
    if(!category){
        return res.status(400).send('The category cannot be created!');
    }
    res.send(category);
});

router.put(`/:id`, async (req,res)=> {
    const category = await Category.findByIdAndUpdate(req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        {
            new: true, // for return updated data
        }
    );

   if(!category){
       return res.status(400).send('The category cannot be created!');
   }
   res.send(category);
});

router.delete('/:id', (req,res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if(category){
            return res.status(200).json({
                success: true,
                message: 'The Category is deleted',
            })
        } else {
            return res.status(404).json({
                success: false,
                message: 'The category not found',
            })
        }
    }).catch(err => {
        return res.status(400).json({
            success: true,
            error: err,
        })
    })
});

module.exports = router; 