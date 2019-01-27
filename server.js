// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var logger = require("morgan");
var path = require("path");
var mongoose = require("mongoose");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000

// Initialize Express
var app = express();

app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// // Database configuration
// var databaseUrl = "snowboarddb";
// var collections = ["Snowboard"];

// // Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });


mongoose.connect("mongodb://localhost:3000/snowboarddb", { useNewUrlParser: true });

// Main route (simple message)
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "./views/index.html"));
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://www.evo.com/shop/snowboard/snowboards/").then(function (response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
    // For each element with a "title" class
    $(".product-thumb").each(function (i, element) {

      // Save the text and href of each link enclosed in the current element
      var snowboard = $(element).children(".product-thumb-details").children("a").children("span.product-thumb-title").text();
      var price = $(element).children(".product-thumb-details").children("a").children("span.product-thumb-price").text();
      var image = $(element).children("a").children("img").attr("src");

      // If this found element had both a title and a link
      if (snowboard && price && image) {
        // Insert the data in the scrapedData db
        db.Snowboard.create({
          snowboard: snowboard,
          price: price,
          image: image
        })
          .then(function (dbArticle) {
            // View the added result in the console
            console.log(dbArticle);
          })
          .catch(function (err) {
            // If an error occurred, log it
            console.log(err);
          });
      }
    });
  });
  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});

// Retrieve data from the db
app.get("/allsnowboards", function (req, res) {
  // Find all results from the scrapedData collection in the db
  db.Snowboard.find({}, function (error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Route for grabbing a specific Snowboar by id, populate it with its note
app.get("/snowboards/:id", function (req, res) {
  db.Snowboard.findOne({ _id: req.params.id })

    .populate("note")
    .then(function (dbSnowboard) {
      res.json(dbSnowboard);
    })
    .catch(function (err) {
      res.json(err);
    });
});

//Route fo saving/updating an Snowboard's associated Note
app.post("/snowboards/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one snowbaord with an `_id` equal to `req.params.id`. Update the snowbaord to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Snowboard.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });

    })
    .then(function (dbSnowboard) {
      res.json(dbSnowboard);
    })
    .catch(function (err) {
      res.json(err);
    });
});



// // Handle form submission, save submission to mongo
// app.post("/submit", function(req, res) {
//     console.log(req.body);
//     // Insert the note into the notes collection
//     db.snowboardData.insert(
//         {note: req.body}, function(error, saved) {
//       // Log any errors
//       if (error) {
//         console.log(error);
//       }
//       else {
//         // Otherwise, send the note back to the browser
//         // This will fire off the success function of the ajax request
//         res.send(saved);
//       }
//     });
//   });


// Listen on port 3000
app.listen(PORT, function () {
  console.log("App running on http://localhost:" + PORT);
});
