/*********************************************************************************
 *  WEB322 – Assignment 03
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source
 *  (including 3rd party web sites) or distributed to other students.
 *
 *  Name:Komalpreet Kaur Student ID:152860219 Date: 16 October,2022
 *
 *  Online (Cyclic) Link:https://happy-poncho-ray.cyclic.app/ 
 *
 ********************************************************************************/
 var express = require("express");
var app = express();
var path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const upload = multer(); // no { storage: storage }

cloudinary.config({
  cloud_name: 'dsmavkhyb',
  api_key: '391812368776995',
  api_secret: 'NUClncR4LVhj28fxQDs615qZ2wo',
      secure: true,
  });

//adding path tp product-service.js module to interact with it
var productSrv = require("./product-service");
const { get } = require("http");

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
  return new Promise(function (res, req) {
    productSrv
      .initialize()
      .then(function (data) {
        console.log(data);
      })
      .catch(function (err) {
        console.log(err);
      });
  });
}
app.use(express.static("public"));

//setting up a defualt route for local host
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

app.get("/home", function (req, res) {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});

app.get("/products/add", function (req, res) {
  res.sendFile(path.join(__dirname + "/views/addProducts.html"));
});

//add image cloudinary code
app.post("/products/add", upload.single("featureImage"), function (req, res) {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });

      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    console.log(result);
    return result;
  }

  upload(req).then((uploaded) => {
    req.body.featureImage = uploaded.url;
  });

  // TODO: Process the req.body and add it as a new Product Demo before redirecting to /demos
  productSrv.addProduct(req.body).then(() => {
    res.redirect("/demos"); //after done redirect to demos
  });
});

//route to products
app.get("/products", function (req, res) {
  productSrv
    .getPublishedProducts()
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});

//route to demos
app.get("/demos", function (req, res) {
  //if category query then filter using this
  if (req.query.category) {
    productSrv
      .getProductByCategory(req.query.category)
      .then(function (data) {
        res.json(data);
      })
      .catch(function (err) {
        res.json({ message: err });
      });
    //if minDate query then this route taken
  } else if (req.query.minDate) {
    productSrv
      .getProductsByMinDate(req.query.minDate)
      .then(function (data) {
        res.json(data);
      })
      .catch(function (err) {
        res.json({ message: err });
      });

    //otherwise display all products
  } else {
    productSrv
      .getAllProducts()
      .then(function (data) {
        res.json(data);
      })
      .catch(function (err) {
        res.json({ message: err });
      });
  }
});

//route to categories
app.get("/categories", function (req, res) {
  productSrv
    .getCategories()
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});

//product id return function
app.get("/product/:value", function (req, res) {
  productSrv
    .getProductById(req.params.value)
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});

//if no route found show Page Not Found
app.use(function (req, res) {
  res.status(404).sendFile(path.join(__dirname, "/views/error.html"));
});

app.listen(HTTP_PORT, onHttpStart);