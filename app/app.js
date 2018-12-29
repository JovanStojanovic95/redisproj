const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// Create Redis Client
let client = redis.createClient();

client.on('connect', function () {
  console.log('Connected to Redis...');
});

// Set Port
const port = 3000;

// Init app
const app = express();

// View Engine\
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static(__dirname + '/public'));

app.listen(port, function () {
  console.log('Server started on port ' + port);
});

app.use(methodOverride('_method'));

//-------------get pages!!!
app.get('/', function (req, res, next) { /// ovde treba defaltni deo da se nalazi defaultni box!!!
  res.render('defolt');
})

app.get('/add', function (req, res, next) {
  res.render('addUser');
})



app.get('/search', function (req, res, next) {
  res.render('search');
})
///------------------- Complete add user processing!!!!
app.post('/add', function (req, res, next) {

 
  client.incr('keyCounter', function(err, reply) {
    let user_name = req.body.user_name;
    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let phone = req.body.phone;
  
    client.hmset("user:" +reply, [
      'user_name', user_name,
      'first_name', first_name,
      'last_name', last_name,
      'email', email,
      'phone', phone
    ], function (err, reply) {
      if (err) {
        console.log(err);
      }
      console.log(reply);
      res.redirect('/');
    });
    
  }); 
 
});



///-----------------------------------------------------

app.use(methodOverride('_method'));

//-------------------------gete all Complete processing!!!
app.get('/delete', function (req, res, next) {

  client.keys("user:*", function (err, keys) {
    if (!keys) {
      res.render('search', {
        err: 'Users does not exist'
      });
    } else {
      const niz = []
      keys.map(key => client.hgetall(key, function (err, item) {
        if (!item) console.log("puko sam");
        item.key = key;
        niz.push(item);

      }))

      res.render('deleteUser', {
        user: niz,
        user_id: keys
      });
    }
  })
});


//------------ Search by id processing
app.post('/search', function (req, res, next) {

  let id = "user:" + req.body.search;

  client.hgetall(id, function (err, obj) {
    if (!obj) {
      res.render('search', {
        error: 'User does not exist'
      });
    } else {
      obj.id = id;
      //console.log(obj);
      res.render('search', {
        user: obj
      });
    }
  });
});

//-----------------delete user

app.delete('/user/delete/:key', function (req, res, next) {
  console.log("hey man delete");
  client.del(req.params.key);

  res.redirect('/');
});

//-----------change user 

app.post('/user/change/:id', function (req, res, next) {
 // console.log("hey man Change");
  //console.log(req.params.id);
  client.hgetall(req.params.id, function (err, obj) {
    if (!obj) {
      res.render('search', {
        error: 'User does not exist'
      });
    } else {
      obj.id = req.params.id.slice(5);
     // console.log(obj);
      res.render('change', {
        user: obj
      });
    }
  });
});


//-------------change user 
app.post('/add/changed', function (req, res, next) {
  let id = req.body.key;
  let user_name = req.body.user_name;
  let first_name = req.body.first_name;
  let last_name = req.body.last_name;
  let email = req.body.email;
  let phone = req.body.phone;
  console.log(id);
  console.log(first_name);
  console.log(last_name);
  console.log(email);
  console.log(phone);
  client.hmset("user:" + id, [
    'user_name', user_name,
    'first_name', first_name,
    'last_name', last_name,
    'email', email,
    'phone', phone
  ], function (err, reply) {
    if (err) {
      console.log(err);
    }

    res.redirect('/');
  });
})