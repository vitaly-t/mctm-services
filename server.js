var express = require('express'),
    worksheets = require('./routes/worksheets'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    mathworks = require('./routes/mathworks');

var app = express();

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/worksheets', worksheets.findAll);
app.get('/worksheets/stats', worksheets.getStats);

app.post('/answeredworksheets/:worksheetid', worksheets.createAnsweredWorksheet)

app.put('/answeredworksheets/:worksheetid/:id', worksheets.saveAnsweredWorksheet);

app.get('/answeredworksheets/:id', worksheets.findAnsweredWorksheetById);
app.get('/answeredworksheets/:worksheetid/:id', worksheets.findAnsweredWorksheetById2);

app.get('/mathworks/stats', mathworks.getStats);
app.get('/mathworks/worksheets/new', mathworks.getNewWorksheetsMetadata);
app.get('/mathworks/worksheets/inprogress', mathworks.getInprogressWorksheetsMetadata);
app.get('/mathworks/worksheets/completed', mathworks.getCompletedWorksheetsMetadata);

app.get('/mathworks/worksheet/:id', mathworks.findWorksheetByAlternateId);
app.get('/mathworks/worksheet2/:id', mathworks.findWorksheetByAlternateId2);

app.post('/mathworks/answeredworksheet/:worksheetid', mathworks.createAnsweredWorksheet);
app.get('/mathworks/answeredworksheet/:worksheetid/:id', mathworks.findAnsweredWorksheetById);
app.put('/mathworks/answeredworksheet/:worksheetid/:id', mathworks.saveAnsweredWorksheet);

app.listen(8888);
console.log('Listening on port 8888...');
