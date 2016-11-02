var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root')
});

//GET /todos
app.get('/todos', function(req, res) {
	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}
	

	if (query.hasOwnProperty('q') && query.q.trim().length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({where: where}).then(function (todos) {
		res.json(todos);
	}, function (e) {
		res.status(500).send();
	});
});

//GET /todos/:id
// app.get('/todos/:id', function(req, res) {
// 	// params are a string, so we need to move it to an integer
// 	var todoId = parseInt(req.params.id, 10);
// 	db.todo.findById(todoId).then (function (todo){
// 		if(todo){
// 			res.json(todo.toJSON());
// 		} else {
// 			res.status(404).send();
		
// 		// }, function (e) {
// 		// 	res.status(500).send();	
// 		}
// });

app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then (function (todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send();
	});
});




//POST /todos
app.post('/todos', function(req, res) {

	var body = _.pick(req.body, 'description', 'completed');

	body.description = body.description.trim();

	db.todo.create(body).then(function (todo){
		res.json(todo.toJSON());
	}, function (e){
		res.status(400).json(e);
	})
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function (rowsDeleted){
		if (rowsDeleted === 0){
			res.status(404).json({
				error: 'No todo with that id'
			});
		} else {
			res.status(204).send();
		}
	}, function () {
		res.status(500).send();
	})
});


// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	var todoId = parseInt(req.params.id, 10);
	var attributes = {};

	// make sure 'completed' property is valid
	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	};

	// make sure 'description' property is valid
	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	};

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
});

app.post('/users', function(req, res) {

	var body = _.pick(req.body, 'email', 'password');

	body.email = body.email.trim();
	body.password = body.password.trim();

	db.user.create(body).then(function (user){
		res.json(user.toJSON());
	}, function (e){
		res.status(400).json(e);
	})
});

db.sequelize.sync().then(function () {
		app.listen(PORT, function() {
		console.log('Express running on port ' + PORT + '!');
	});
});