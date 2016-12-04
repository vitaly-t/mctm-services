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

exports.getNewWorksheetsMetadata = function(req, res) {

  db.manyOrNone('select coalesce(alternate_id, id) as "id", description ' +
      'from worksheet w ' +
      'where not exists(select 1 from answered_worksheet a where a.worksheet_id = w.alternate_id)')
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(error) {
      console.log("ERROR (getNewWorksheetsMetadata): ", error.message || error);
      res.send({'error':'An error has occurred'});
    });

};

exports.getInprogressWorksheetsMetadata = function(req, res) {

  db.manyOrNone('select coalesce(w.alternate_id, w.id) as "id", w.description, a.id as "answeredWorksheetId", 0 as "lastQuestionIndex" ' +
    'from worksheet w inner join answered_worksheet a on (a.worksheet_id = w.alternate_id and a.status=$1)', ['in-progress'])
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(error) {
      console.log("ERROR (getInprogressWorksheetsMetadata): ", error.message || error);
      res.send({'error':'An error has occurred'});
    });
};

exports.getCompletedWorksheetsMetadata = function(req, res) {

  db.manyOrNone('select coalesce(w.alternate_id, w.id) as "id", w.description, a.id as "lastAnsweredWorksheetId" ' +
    'from worksheet w inner join answered_worksheet a on (a.worksheet_id = w.alternate_id and a.status=$1) ' +
    'order by a.update_timestamp desc ' +
    'fetch first 1 rows only', ['done'])
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(error) {
      console.log("ERROR (getCompletedWorksheetsMetadata): ", error.message || error);
      res.send({'error':'An error has occurred'});
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

  db.one('insert into answered_worksheet(WORKSHEET_ID, CREATE_TIMESTAMP, CREATED_BY, CREATE_MODULE) ' +
    'values($1, $2, $3, $4) returning id', [worksheetid, new Date(), 'service', 'mathworks.js'])
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

  db.none('update answered_worksheet set ANSWEREDQUESTIONS=$1, ' +
    'status=$2, update_timestamp=$3, UPDATED_BY=$4, UPDATE_MODULE=$5 where worksheet_id=$6 and id=$7',
      [JSON.stringify(answeredWorksheet.answeredquestions), answeredWorksheet.status,
      new Date(), 'service', 'mathworks.js', worksheetid, id])
    .then(function() {
      getAnsweredWorksheet(worksheetid, id, res);
    })
    .catch(function(error) {
      console.log("ERROR (saveAnsweredWorksheet): ", error.message || error);
      res.send({'error':'An error has occurred'});
    });
};

function getAnsweredWorksheet(worksheetid, id, res) {
  // we need ORM to do database-to-app layer mappings
  db.one('select id, worksheet_id as "worksheetid" from answered_worksheet where worksheet_id=$1 and id=$2', [worksheetid, id])
    .then(function(data) {
        res.status(200).json(data);
    });
}
