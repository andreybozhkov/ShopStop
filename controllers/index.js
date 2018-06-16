const homeController = require('./home');
const productController = require('./product');
const categoryController = require('./category');

module.exports = {
    home: homeController,
    product: productController,
    category: categoryController
};