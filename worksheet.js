var express = require('express');
var cors = require('cors');
 
var app = express();

app.use(cors());
 
const data=require("./data.json");

app.get('/worksheets', function(req, res) {
	const worksheets = data.worksheets;

	res.status(200).json({worksheets});
});
 
app.listen(8888);
