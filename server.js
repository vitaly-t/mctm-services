var express = require('express'),
    worksheets = require('./routes/worksheets'),
    cors = require('cors'),
    bodyParser = require('body-parser');

var app = express();

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/worksheets', worksheets.findAll);

app.post('/answeredworksheets/:worksheetid', worksheets.createAnsweredWorksheet)

app.put('/answeredworksheets/:worksheetid/:id', worksheets.saveAnsweredWorksheet);

app.get('/answeredworksheets/:id', worksheets.findAnsweredWorksheetById);
app.get('/answeredworksheets/:worksheetid/:id', worksheets.findAnsweredWorksheetById2);

app.listen(8888);
console.log('Listening on port 8888...');
