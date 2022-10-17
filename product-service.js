var fs = require("fs");

//creating products and categories array
var products = [];
var categories = [];

//initializing modules
module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    try {
      //reading files using fs
      fs.readFile("./data/products.json", function (err, data) {
        if (err) throw err;
        products = JSON.parse(data);
      });
      fs.readFile("./data/categories.json", function (err, data) {
        if (err) throw err;
        categories = JSON.parse(data);
      });
    } catch (ex) {
      reject("unable to read file");
    }
    resolve("JSON file successfully read.");
  });
};

//getAllproducts() function
module.exports.getAllProducts = function () {
  var all_products = [];
  return new Promise(function (resolve, reject) {
    for (var i = 0; i < products.length; i++) {
      all_products.push(products[i]);
    }
    if (all_products.length == 0) {
      reject("no results returned");
    }
    resolve(all_products);
  });
};

//function to add a new product
module.exports.addProducts = (productData) => {
  if (typeof productData.published === "undefined") {
    productData.published = false;
  } else {
    productData.published = true;
  }
  productData.id = products.length + 1;
  products.push(productData);

  return new Promise((resolve, reject) => {
    if (products.length == 0) {
      reject("no results returned");
    } else {
      resolve(products);
    }
  });
};

//getPublishedProducts() function validates only published products
module.exports.getPublishedProducts = function () {
  var published_products = [];

  return new Promise(function (resolve, reject) {
    for (var a = 0; a < products.length; a++) {
      if (products[a].published == true) {
        published_products.push(products[a]);
      }
    }
    if (published_products.length == 0) {
      reject("no results returned");
    }
    resolve(published_products);
  });
};

//getCategories() function
module.exports.getCategories = function () {
  var c_categories = [];
  return new Promise(function (resolve, reject) {
    if (products.length == 0) {
      reject("no data returned");
    } else {
      for (var v = 0; v < categories.length; v++) {
        c_categories.push(categories[v]);
      }
      if (c_categories.length == 0) {
        reject("no data returned");
      }
    }
    resolve(c_categories);
  });
};

//get product by categories
module.exports.getProductByCategory = (category) => {
  return new Promise((resolve, reject) => {
    var pr_category = products.filter(
      (product) => product.category == category
    );
    if (pr_category.length == 0) {
      reject("no products found for this value");
    }
    resolve(pr_category);
  });
};

//get products by min date
module.exports.getProductsByMinDate = (minDate) => {
  return new Promise((resolve, reject) => {
    var pr_date = products.filter((products) => products.postDate >= minDate);
    if (pr_date.length == 0) {
      reject("no results returned");
    }
    resolve(pr_date);
  });
};

//function to get id
module.exports.getProductById = (id) => {
  return new Promise((resolve, reject) => {
    var pr_id = products.filter((products) => products.id == id);
    if (pr_id.length == 0) {
      reject("no results returned");
    }
    resolve(pr_id);
  });
};