/*********************************************************************************
 *  WEB322 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name:Komalpreet Kaur
 *  Student ID:152860219
 * Date: 06 November,2022
 *
 *  Online (Cyclic) Link: 
 * 
 *
 ********************************************************************************/
 const HTTP_PORT = process.env.PORT || 8080;

const express = require('express');
const path = require("path");
const multer = require("multer");
const fs = require('fs');
const productData = require("./product-service.js");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const app = express();
const stripJs = require('strip-js');

app.engine('.hbs', exphbs({ 
    extname: ".hbs", 
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';},
        equal: function (lvalue, rvalue, options) {
            if (arguments.length< 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },  
        safeHTML: function(context){
            return stripJs(context);
        }
         
    }
}));

app.set('view engine', '.hbs');



cloudinary.config({
    cloud_name: 'dfigibz6e',
    api_key: '964183147451584',
    api_secret: 'Ap59uY4V1aViroxLP3QA6WmeqHk',
    secure: true
});

const upload = multer();

app.use(express.static('public'));

app.use(function(req,res,next){
    let route = req.path.substring(1);
app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ?route.replace(/\/(?!.*)/, "") :route.replace(/\/(.*)/, ""));
app.locals.viewingCategory = req.query.category;
next();
});



app.get('/', (req, res) => {
    res.render(path.join(__dirname, "/views/home.hbs"))
});

app.get('/product', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare an empty array to hold "product" objects
        let products = [];

        // if there's a "category" query, filter the returned products by the category
        if(req.query.category){
            // Obtain the published "products" by category
            products = await productData.getPublishedProductsByCategory(req.query.category);
        }else{
            // Obtain the published "products"
            products = await productData.getPublishedProducts();
        }

        // sort the published products by the postDate
        products.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // get the latest product from the front of the list (element 0)
        let product = products[0]; 

        // store the "products" and "product" data in the viewData object (to be passed to the view)
        viewData.products = products;
        viewData.product = product;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await productData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "product" view with all of the data (viewData)
    res.render("product", {data: viewData})

});

app.get('/product/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare an empty array to hold "product" objects
        let products = [];

        // if there's a "category" query, filter the returned products by the category
        if(req.query.category){
            // Obtain the published "products" by category
            products = await productData.getPublishedProductsByCategory(req.query.category);
        }else{
            // Obtain the published "products"
            products = await productData.getPublishedProducts();
        }

        // sort the published products by postDate
        products.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "products" and "product" data in the viewData object (to be passed to the view)
        viewData.products = products;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the product by "id"
        viewData.product = await productData.getProductById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await productData.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "product" view with all of the data (viewData)
    res.render("product", {data: viewData})
});

app.get('/demos', (req,res)=>{

    let queryPromise = null;

    if(req.query.category){
        queryPromise = productData.getProductsByCategory(req.query.category);
    }else if(req.query.minDate){
        queryPromise = productData.getProductsByMinDate(req.query.minDate);
    }else{
        queryPromise = productData.getAllProducts()
    } 

    queryPromise.then(data=>{
        res.render("demos", {demos: data})
    }).catch(err=>{
        res.render("demos", {message: "no results"});
    })

});

app.get('/categories', (req,res)=>{
    productData.getCategories().then((data=>{
        res.render("categories", {categories: data});
    })).catch(err=>{
        res.render("categories", {message: "no results"});
    });
});

app.post("/products/add", upload.single("featureImage"), (req,res)=>{

    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processProduct(uploaded.url);
        });
    }else{
        processProduct("");
    }

    function processProduct(imageUrl){
        req.body.featureImage = imageUrl;

        productData.addProduct(req.body).then(product=>{
            res.redirect("/demos");
        }).catch(err=>{
            res.status(500).send(err);
        })
    }   
});

app.get('/products/add', (req,res)=>{
    res.render(path.join(__dirname, "/views/addProduct.hbs"));
}); 

app.get('/product/:id', (req,res)=>{
    productData.getProductById(req.params.id).then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    });
});






app.use((req,res)=>{
    res.status(404).send("404 - Page Not Found")
})

productData.initialize().then(()=>{
    app.listen(HTTP_PORT, () => { 
        console.log('server listening on: ' + HTTP_PORT); 
    });
}).catch((err)=>{
    console.log(err);
})