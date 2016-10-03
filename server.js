var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root')
});

//GET /todos
app.get('/todos', function(req, res){
	res.json(todos);
})

//GET /todos/:id
app.get('/todos/:id', function (req, res){
// params are a string, so we need to move it to an integer
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}

})

//POST /todos
app.post('/todos', function (req, res){
	
	var body = _.pick(req.body, 'description', 'completed');
	
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	};
	// set body.description to trimmed 
	body.description = body.description.trim();

	body.id = todoNextId++;
	// push body into array
	todos.push(body);

//	console.log('description: ' + body.description);

	res.json(body);
});


app.listen(PORT, function () {
	console.log('Express running on port ' + PORT + '!')
})