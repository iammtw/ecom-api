const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Configuration
const app = express();
mongoose.connect("mongodb://localhost:27017/eshop",  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
})
.then(()=> console.log('Database connection is ready'))
.catch((err)=> console.log(err));
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

// routers
const api = process.env.API_URL;
const productRoutes = require('./routers/products');
const orderRoutes = require('./routers/orders');
const categoriesRoutes = require('./routers/categories');
const usersRoutes = require('./routers/users');

app.use(`${api}/products`,productRoutes);
app.use(`${api}/orders`,orderRoutes);
app.use(`${api}/categories`,categoriesRoutes);
app.use(`${api}/users`,usersRoutes);

// Server Listen
app.listen(4000, ()=> console.log('Server is running'));