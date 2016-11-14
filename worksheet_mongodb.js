var express = require('express');
var cors = require('cors');
var mongoClient = require('mongodb').MongoClient;
 
var app = express();

app.use(cors());
 
var url = 'mongodb://localhost:27017/local';

mongoClient.connect(url, function(err, db) {
	var worksheets = db.collection('worksheets');

	app.get('/worksheets', function(req, res) {
		worksheets.find({}).toArray(function(err, docs) {
			res.status(200).json(docs[0]);
		});
	});
});

app.listen(8888);
