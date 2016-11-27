var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://mathapp:mathapp@localhost:5432/mathworks')

db.one('SELECT $1 AS value', 123)
  .then(function (data) {
    console.log('DATA:', data.value)
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  })

exports.test = function(req, res) {

  db.many('select * from worksheet').then(function(data) {
    res.status(200).json(data);
  });
};

exports.getStats = function(req, res) {

  db.many('select coalesce(alternate_id, id) as "id", description from worksheet').then(function(data) {
    res.status(200).json(data);
  });
};

exports.findWorksheetByAlternateId = function(req, res) {
  var worksheetid = +req.params.id;

  db.one('select alternate_id as "id", type, description, questions from worksheet where alternate_id=$1', [worksheetid])
    .then(function(data) {
      res.status(200).json(data);
    });
};

exports.createAnsweredWorksheet = function(req, res) {
  var worksheetid = +req.params.worksheetid;

  db.one('insert into answered_worksheet(WORKSHEET_ID) ' +
    'values($1) returning id', [worksheetid])
    .then(function(data) {
      db.one('select a.id, w.alternate_id as "worksheetid", a.answeredquestions ' +
          ' from answered_worksheet a inner join worksheet w on (a.worksheet_id = w.alternate_id) ' +
          ' where w.alternate_id=$1 and a.id=$2', [worksheetid, data.id])
        .then(function(data2) {
          res.status(200).json(data2);
        })
    })
    .catch(function(error) {
      console.log("ERROR (insert into answered_worksheet): ", error.message || error);
      res.send({'error':'An error has occurred'});
    });

};

exports.findAnsweredWorksheetById = function(req, res) {
  var worksheetid = +req.params.worksheetid;
  var id = +req.params.id;

  db.one('select * from answered_worksheet where worksheet_id=$1 and id=$2', [worksheetid, id])
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(error) {
      console.log("ERROR (findAnsweredWorksheetById): ", error.message || error);
      res.send({'error':'An error has occurred'});
    });

};

exports.saveAnsweredWorksheet = function(req, res) {
  var worksheetid = +req.params.worksheetid;
  var id = +req.params.id;
  var answeredWorksheet = req.body;

  db.none('update answered_worksheet set ANSWEREDQUESTIONS=$1 where worksheet_id=$2 and id=$3',
    [JSON.stringify(answeredWorksheet.answeredquestions), worksheetid, id])
    .then(function() {
      db.one('select * from answered_worksheet where worksheet_id=$1 and id=$2', [worksheetid, id])
        .then(function(data) {
          res.status(200).json(data);
        })
    })
    .catch(function(error) {
      console.log("ERROR (saveAnsweredWorksheet): ", error.message || error);
      res.send({'error':'An error has occurred'});
    });
};
