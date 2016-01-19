var express = require('express');
app = express();
var pg = require('pg');
app.use(express.static(__dirname + '/public'));
require('dotenv').load();

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'jade');

var router = express.Router();

var connectionString = 'postgres://localhost/food';

function runQuery (query, callback) {
  pg.connect(connectionString, function (err, client, done) {
    if (err) { done() ; console.log(err); return; }
    client.query(query, function (err, results) {
      done();
      if (err) { console.log(err); return; }
      callback(results);
    });
  });
}

app.get('/', function (req, res) {
  runQuery("SELECT * FROM restaurants", function (results) {

    var restaurants = [];
    console.log(results.rows);
    for(var i = 0; i < results.rows.length; i++){
      var thisRestaurant = {
        id: results.rows[i]["id"],
        name: results.rows[i]["name"],
        location: results.rows[i]["location"],
        description: results.rows[i]["description"],
        rating: results.rows[i]["rating"],
        type: results.rows[i]["type"],
        url: results.rows[i]["url"]
      }

      var stars = "";
      for(var j = 0; j < thisRestaurant["rating"]; j++){
        stars += "<i class='fa fa-star'></i> "
      }

      thisRestaurant['stars'] = stars;

      restaurants.push(thisRestaurant);
    }
    //console.log(restaurants);
    res.render("index", {allRestaurants:restaurants});
    });
})

app.get('/index', function (req, res) {
  runQuery("SELECT * FROM restaurants", function (results) {

    var restaurants = [];
    console.log(results.rows.length);
    for(var i = 0; i < results.rows.length; i++){
      var thisRestaurant = {
        id: results.rows[i]["id"],
        name: results.rows[i]["name"],
        location: results.rows[i]["location"],
        description: results.rows[i]["description"],
        rating: results.rows[i]["rating"],
        type: results.rows[i]["type"],
        url: results.rows[i]["url"]
      }

      var stars = "";
      for(var j = 0; j < thisRestaurant["rating"]; j++){
        stars += "<i class='fa fa-star'></i> "
      }

      thisRestaurant['stars'] = stars;

      restaurants.push(thisRestaurant);
      console.log("got here");
    }
    console.log(restaurants);
    res.render("index", {allRestaurants:restaurants});
  });
})

app.get('/new', function (req, res) {
  res.render('new');
});

app.post('/new', function (req, res, next) {
  console.log(req.body.name);
  runQuery("INSERT INTO restaurants VALUES(DEFAULT,'"+req.body.name+"','"+req.body.location+"','"+req.body.description+"','"+req.body.rating+"','"+req.body.cuisine+"','"+req.body.image+"')", function (results) {
    res.redirect('/index');
  });
});

app.get('/edit/:id', function (req, res) {
  runQuery("SELECT * FROM restaurants WHERE id="+req.params.id, function (results) {

    var restaurants = [];
    for(var i = 0; i < results.rows.length; i++){
      var thisRestaurant = {
        id: results.rows[i]["id"],
        name: results.rows[i]["name"],
        location: results.rows[i]["location"],
        description: results.rows[i]["description"],
        rating: results.rows[i]["rating"],
        type: results.rows[i]["type"],
        url: results.rows[i]["url"]
      }

      restaurants.push(thisRestaurant);
    }
    res.render("edit", {allRestaurants:restaurants[0]});
  });
})

app.get('/addReview/:id', function (req, res) {
  res.render('add-review', {restaurant_id: req.params.id})
})

app.post('/addReview/:id', function (req, res) {
  var x = new Date().toJSON().slice(0,10);
  runQuery("INSERT INTO reviews VALUES(DEFAULT, '"+req.params.id+"', '"+req.body.name+"', '"+req.body.review+"', '"+req.body.stars+"', '"+x+"')", function (results) {
    console.log(results);
    res.redirect('/index');
  });
});

app.post('/edit/:id', function (req, res, next) {
  console.log(req.body.location);
  runQuery("UPDATE restaurants SET(name, location, description, type, url, rating)=('"+req.body.name+"','"+req.body.location+"','"+req.body.description+"','"+req.body.cuisine+"','"+req.body.image+"','"+req.body.rating+"') WHERE id = '"+ req.params.id + "'", function (results) {
    res.redirect('/index');
  });
  //UPDATE books SET("Author", "Title", "rating", "description") = (\''+req.body.author+'\',\''+req.body.title+'\',\''+req.body.rating+'\',\''+req.body.description+'\') WHERE id = \''+req.params.id+"\'",
})

app.get('/show/:id', function (req, res) {
  runQuery("SELECT * FROM restaurants WHERE id="+req.params.id, function (results) {
    runQuery("SELECT * FROM reviews WHERE restaurants_id='"+req.params.id + "' LIMIT 2", function (results2) {
      runQuery("SELECT * FROM employees WHERE food_id='"+req.params.id + "' LIMIT 6", function (results3) {

      var reviews = [];
      for (var j = 0; j < results2.rows.length; j++) {
        reviews.push(results2.rows[j]);
      }

      var restaurants = [];
      for(var i = 0; i < results.rows.length; i++){
        var thisRestaurant = {
          id: results.rows[i]["id"],
          name: results.rows[i]["name"],
          location: results.rows[i]["location"],
          description: results.rows[i]["description"],
          rating: results.rows[i]["rating"],
          type: results.rows[i]["type"],
          url: results.rows[i]["url"]
        }

        var stars = "";
        for(var i = 0; i < thisRestaurant["rating"]; i++){
          stars += "<i class='fa fa-star'></i> "
        }

        thisRestaurant['stars'] = stars;

        restaurants.push(thisRestaurant);
    }
    console.log(results3.rows);
    res.render("show", {allRestaurants:restaurants[0], firstReview:reviews[0], secondReview:reviews[1], employees:results3.rows});
  });
});
});
});

app.get('/delete/:id', function (req, res) {
  // runQuery('DELETE FROM restaurants WHERE id = \''+req.params.id+"\'", function (results1) {
    res.redirect('/index')
  // })
});

app.get('/addEmployee/:id', function (req, res) {
    res.render('add-employee')
});
app.post('/addEmployee/:id', function (req, res) {
  runQuery("INSERT INTO employees VALUES(DEFAULT, '"+req.params.id+"', '"+req.body.first_name+"', '"+req.body.last_name+"', '"+req.body.position + "')", function (results) {
    res.redirect('../show/'+req.params.id)
  });
});

app.get('/admin', function (req, res) {
  var employees = [];
  runQuery("SELECT * FROM restaurants", function (results) {
    var restaurants = [];
    for(var i = 0; i < results.rows.length; i++){
      restaurants.push(results.rows[i]);
    }

    runQuery("SELECT * FROM employees", function (results1) {
      for(var j = 0; j < results1.rows.length; j++){
        employees.push(results1.rows[j]);
      }
      console.log(employees);

      res.render("admin", {restaurants:restaurants, employees:employees});

    });
  });
});


app.listen(process.env.DATABASE_URL, function () {
  console.log("starting a server on localhost:3000");
});
