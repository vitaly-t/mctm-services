var mongo = require('mongodb');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('local', server);

db.open(function(err, db) {
    if(!err) {
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
        res.send(items);
      });
    });
};

exports.findById = function(req, res) {
    res.send({id:req.params.id, name: "The Name", description: "description"});
};

exports.createAnsweredWorksheet = function(req, res) {
  var worksheetid = +req.params.worksheetid;
  var answeredworksheet = req.body.answeredworksheet;

  db.collection('answeredworksheets', function(err, collection) {
    collection.insert(answeredworksheet, {safe: true, _id: 0}, function(err, result) {
      if (err) {
        res.send({'error':'An error has occurred'});
      } else {
        console.log('Success: ' + JSON.stringify(result.ops[0]));
//        res.send(result.ops[0]);

        // TODO: return this object to requestor from here

      }
    });
  });

  // TODO: for now pre-load empty answerworksheet into mongodb, and return that one (matching worksheetid)
  db.collection('answeredworksheets', function(err, collection) {
    collection.findOne({'worksheetid': worksheetid, 'id': answeredworksheet.id}, { _id: 0}, function(err, item) {
      res.send(item);
    });
  });
};

exports.saveAnsweredWorksheet = function(req, res) {
  var worksheetid = +req.params.worksheetid;
  var id = +req.params.id;
  var answeredWorksheet = req.body;

  console.log('calling saveanser');
  db.collection('answeredworksheets', function(err, collection) {
    collection.update({'worksheetid': worksheetid, 'id': id}, answeredWorksheet, {safe:true}, function(err, result) {
      if (err) {
        console.log(err);
        res.send({'error':'An error has occurred'});
      } else {
        console.log(answeredWorksheet);
        res.send(answeredWorksheet);
      }
    });
  });
};

exports.findAnsweredWorksheetById = function(req, res) {
  var worksheetid = req.params.id;

  db.collection('answeredworksheets', function(err, collection) {
    collection.findOne({'worksheetid': parseInt(worksheetid)}, { _id: 0}, function(err, item) {
      res.send(item);
    });
  });
};

exports.findAnsweredWorksheetById2 = function(req, res) {
  var worksheetid = +req.params.worksheetid;
  var id = +req.params.id;

  db.collection('answeredworksheets', function(err, collection) {
    collection.findOne({'worksheetid': worksheetid, 'id': id}, { _id: 0}, function(err, item) {
      res.send(item);
    });
  });
};

exports.getStats = function(req, res) {
    //res.send([{name:'wine1'}, {name:'wine2'}, {name:'wine3'}]);

    db.collection('worksheets', function(err, collection) {
      collection.find({}, { _id: 0, id: 1, description: 1}).toArray(function(err, items) {
        res.send(items);
      });
    });
};
