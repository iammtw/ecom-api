const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Models and Schemas
require('../models/user');
const User = mongoose.model('User');

router.get(`/`,async (req,res)=> {
    const userList = await User.find({}).select('-passwordHash');
    if(!userList){
        res.status(500).json({ success: false });
    }
    res.json(userList);
});

router.post(`/`, async (req,res)=> {
   try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.passwordHash, salt);
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: hashedPassword,
        street: req.body.street,
        apartment: req.body.appartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    });
   
    user = await user.save();
    if(!user){
        return res.status(400).send('The user cannot be created!');
    }
    res.send(user);
   } catch (error) {
       res.send(error)
   }
});

router.get(`/:id`,async (req,res)=> {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if(!user){
        res.status(500).json({ success: false });
    }
    res.json(user);
});

router.post(`/login`,async (req,res)=> {
    const user = await User.findOne({ email: req.body.email});
    if(!user){
        return res.status(400).send('The user not found');
    }

    if(user && bcrypt.compare(req.body.password, user.passwordHash)){
        const token = jwt.sign({userId : user._id, isAdmin: user.isAdmin }, process.env.secret,{expiresIn: '1d'})
        res.setHeader('auth-token', token);
        res.status(200).send({user: user.email, token: token})
    } else {
        res.status(200).send('password is wrong');
    }
});

router.post(`/register`, async (req,res)=> {
    try {
     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(req.body.passwordHash, salt);
     let user = new User({
         name: req.body.name,
         email: req.body.email,
         passwordHash: hashedPassword,
         street: req.body.street,
         apartment: req.body.appartment,
         zip: req.body.zip,
         city: req.body.city,
         country: req.body.country,
         phone: req.body.phone,
         isAdmin: req.body.isAdmin,
     });
    
     user = await user.save();
     if(!user){
         return res.status(400).send('The user cannot be created!');
     }
    } catch (error) {
        res.send(error)
    }
    res.send(user);
 });

router.delete('/:id', (req, res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.find().count();

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})

router.put('/:id',async (req, res)=> {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if(req.body.password) {
        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(req.body.password, salt);
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})



module.exports = router; 