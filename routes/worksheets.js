var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('local', server);

db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'local' database");
        db.collection('worksheets', {strict:true}, function(err, collection) {
            if (err) {
                //console.log("The 'worksheets' collection doesn't exist. Creating it with sample data...");
                //populateDB();
            }
        });
    }
});

exports.findAll = function(req, res) {
    //res.send([{name:'wine1'}, {name:'wine2'}, {name:'wine3'}]);

    db.collection('worksheets', function(err, collection) {
      collection.find().toArray(function(err, items) {
        res.send(items[0]);
      });
    });
};

exports.findById = function(req, res) {
    res.send({id:req.params.id, name: "The Name", description: "description"});
};

exports.createAnsweredWorksheet = function(req, res) {
  var worksheetid = req.body;
  console.log('creating answeredWorksheet: ' + JSON.stringify(worksheetid));
/*
  db.collection('answeredworksheets', function(err, collection) {
    collection.insert(answeredWorksheet, {safe: true}, function(err, result) {
      if (err) {
        res.send({'error':'An error has occurred'});
      } else {
        console.log('Success: ' + JSON.stringify(result[0]));
        res.send(result[0]);
      }
    });
  });
  */

  // TODO: for now pre-load empty answerworksheet into mongodb, and return that one (matching worksheetid)
  db.collection('answeredworksheets', function(err, collection) {
    collection.findOne({'answerworksheet.worksheetid': worksheetid.id}, function(err, item) {
      res.send(item);
    });
  });

};

exports.saveAnsweredWorksheet = function(req, res) {
  var worksheetid = req.params.id;
  var answeredWorksheet = req.body;
  console.log('Updating answeredworksheet: ' + worksheetid);
  console.log(JSON.stringify(answeredWorksheet));

  db.collection('answeredworksheets', function(err, collection) {
    // TODO: remove prefixing the json object being saved as "answerworksheet"
    collection.update({'answerworksheet.worksheetid': parseInt(worksheetid)}, answeredWorksheet, {safe:true}, function(err, result) {
      if (err) {
        console.log('Error updating wine: ' + err);
        res.send({'error':'An error has occurred'});
      } else {
        console.log('' + result + ' document(s) updated');
        res.send(answeredWorksheet);
      }
    });
  });
};

exports.findAnsweredWorksheetById = function(req, res) {
  var worksheetid = req.params.id;
  console.log('Retrieving worksheet: ' + worksheetid);

  db.collection('answeredworksheets', function(err, collection) {
    collection.findOne({'answerworksheet.worksheetid': parseInt(worksheetid)}, function(err, item) {
      res.send(item);
    });
  });
};
