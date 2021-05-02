const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const {auth} = require('../helpers/verifyToken');

// Models and Schemas
require('../models/order');
require('../models/order-item');
const Order = mongoose.model('Order');
const OrderItem = mongoose.model('OrderItem');

router.get(`/`, async (req,res)=> {
    const orderList = await Order.find()
    .populate('user','name').sort({'dateOrdered': -1})
    .populate({ path: 'orderItems', populate: { path: 'product', populate: 'category' } });
    if(!orderList){
        res.status(500).json({ success: false });
    }
    res.json(orderList);
});

router.post(`/`, async (req,res)=> {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product,
        })

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id
    }))

    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemsId) => {
        const orderItem = await OrderItem.findById(orderItemsId).populate('product','price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }))
    const totalPrice = totalPrices.reduce( (a,b) => a+b, 0);
    console.log(totalPrice);

    const { shippingAddress1,shippingAddress2,city, zip, country,phone, status, user } = req.body;
    let order = new Order({
        orderItems:orderItemsIdsResolved, shippingAddress1,shippingAddress2,city, zip, country,phone, status,totalPrice, user
    });
   
    order = await order.save();
    if(!order){
        return res.status(400).send('The order cannot be created!');
    }
    res.send(order);
});

router.get(`/:id`, async (req,res)=> {
    const order = await Order.findById(req.params.id)
    .populate('user','name').sort({'dateOrdered': -1})
    .populate({ path: 'orderItems', populate: { path: 'product', populate: 'category' } });
    if(!order){
        res.status(500).json({ success: false });
    }
    res.json(order);
});

router.put(`/:id`, async (req,res)=> {
    const order = await Order.findByIdAndUpdate(req.params.id, { status : req.body.status}, { new: true } );
    if(!order){
        return res.status(500).json({ success: false });
    }
    res.json(order);
});

router.delete(`/:id`, async (req,res)=> {
    const order = await Order.findByIdAndRemove(req.params.id);

    if(order){
        await order.orderItems.map(async (orderItem) => await OrderItem.findByIdAndRemove(orderItem))
        res.json({ success: true });
    } else {
        return res.status(500).json({ success: false });
    }

});

router.get('/get/totalsales', async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated')
    }

    res.send({totalsales: totalSales.pop().totalsales})
})

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.find().count()

    if(!orderCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        orderCount: orderCount
    });
})

router.get(`/get/userorders/:userid`, async (req, res) =>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
})

module.exports = router; 