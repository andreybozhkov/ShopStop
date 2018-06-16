const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');

module.exports.addGet = (req, res) => {
    Category.find().then((categories) => {
        res.render('product/add', {categories: categories});
    });
}

module.exports.addPost = (req, res) => {
    let productObj = req.body;
    productObj.image = '\\' + req.file.path;

    Product.create(productObj).then((product) => {
        Category.findById(product.category).then((category) => {
            category.products.push(product._id);
            category.save();
        });
        res.redirect('/');
    });
}

module.exports.editGet = (req, res) => {
    let id = req.params.id;
    Product.findById(id).then(product => {
        if (!product) {
            res.sendStatus(404);
            return;
        }
        
        Category.find().then((categories) => {
            res.render('product/edit', {
                product: product,
                categories: categories
            });
        });
    });
};

module.exports.editPost = (req, res) => {
    let id = req.params.id;
    let editedProduct = req.body;

    Product.findById(id).then((product) => {
        if (!product) {
            res.redirect(
                `/?error=${encodeURIComponent('Product was not found!')}`);
            return;
        }

        product.name = editedProduct.name;
        product.description = editedProduct.description;
        product.price = editedProduct.price;

        if (req.file) {
            let newFilePath = req.file.path;
            let oldFilePath = product.image;
            console.log(oldFilePath);
            
            fs.unlink(`.${oldFilePath}`, (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
            });

            product.image = '\\' + newFilePath;
        }

        if (product.category.toString() !== editedProduct.category) {
            Category.findById(product.category).then((currentCategory) => {
                Category.findById(editedProduct.category).then((nextCategory) => {
                    let index = currentCategory.products.indexOf(product._id);
                    if (index >= 0) {
                        currentCategory.products.splice(index, 1);
                    }
                    currentCategory.save();

                    nextCategory.products.push(product._id);
                    nextCategory.save();

                    product.category = editedProduct.category;

                    product.save().then(() => {
                        res.redirect(
                            `/?success=${encodeURIComponent('Product was edited sucessfully!')}`);
                    });
                });
            });
        } else {
            product.save().then(() => {
                res.redirect(
                    `/?success=${encodeURIComponent('Product was edited sucessfully!')}`);
            });
        }
    });
};