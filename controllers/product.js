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
    productObj.creator = req.user._id;

    Product.create(productObj).then((product) => {
        req.user.createdProducts.push(product._id);
        req.user.save();

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

        if (product.creator.equals(req.user._id) || req.user.roles.indexOf('Admin') >= 0) {
            Category.find().then((categories) => {
                res.render('product/edit', {
                    product: product,
                    categories: categories
                });
            });
        } else {
            res.redirect(
                `/?error=${encodeURIComponent('Only the creator can edit the product!')}`);
            return;
        }
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

        if (product.creator.equals(req.user._id) || req.user.roles.indexOf('Admin') >= 0) {
            product.name = editedProduct.name;
            product.description = editedProduct.description;
            product.price = editedProduct.price;

            if (req.file) {
                let newFilePath = req.file.path;
                let oldFilePath = product.image;
                
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
        } else {
            res.redirect(
                `/?error=${encodeURIComponent('Only the creator can edit the product!')}`);
            return;
        }
    });
};

module.exports.deleteGet = (req, res) => {
    let id = req.params.id;
    Product.findById(id).then(product => {
        if (!product) {
            res.sendStatus(404);
            return;
        }

        if (product.creator.equals(req.user._id) || req.user.roles.indexOf('Admin') >= 0) {
            res.render('product/delete', {product: product});
        } else {
            res.redirect(
                `/?error=${encodeURIComponent('Only the creator can delete the product!')}`);
            return;
        }
    });
}

module.exports.deletePost = (req, res) => {
    let id = req.params.id;

    Product.findById(id).then((product) => {
        if (!product) {
            res.redirect(
                `/?error=${encodeURIComponent('Product was not found!')}`);
            return;
        }

        if (product.creator.equals(req.user._id) || req.user.roles.indexOf('Admin') >= 0) {
            product.remove();

            Category.findById(product.category).then((category) => {
                let index = category.products.indexOf(product._id);
                
                if (index >= 0) {
                    category.products.splice(index, 1);
                }
                category.save();
                
                fs.unlink(`.${product.image}`, (err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                });

                res.redirect(
                    `/?success=${encodeURIComponent('Product was deleted sucessfully!')}`);
            });
        } else {
            res.redirect(
                `/?error=${encodeURIComponent('Only the creator can delete the product!')}`);
            return;
        }

        
    });
}

module.exports.buyGet = (req, res) => {
    let id = req.params.id;

    Product.findById(id).then((product) => {
        res.render('product/buy', {product: product});
    });
}

module.exports.buyPost = (req, res) => {
    let productId = req.params.id;

    Product.findById(productId).then(product => {
        if (product.buyer) {
            let error = `error=${encodeURIComponent('Product was already bought!')}`;
            res.redirect(`/?${error}`);
            return;
        }

        product.buyer = req.user._id;
        product.save().then(() => {
            req.user.boughtProducts.push(productId);
            req.user.save().then(() => {
                res.redirect('/');
            });
        });
    });
}