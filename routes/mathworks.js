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
/*
  db.many('select a.worksheet_id as "worksheetid", w.description, a.id as "answeredworksheetid", ' +
      ' jsonb_array_length(w.questions) as "totalqcnt", jsonb_array_length(a.answeredquestions) as answeredqcnt, ' +
      ' 0 as correctcnt, ' +
      ' 0 as incorrectcnt, 0 as totaltime ' +
      'from answered_worksheet a join worksheet w on a.worksheet_id = w.alternate_id')
    .then(function(data) {
        res.status(200).json(data);
    })
    .catch(function(error) {
      console.log("ERROR (getStats): ", error.message || error);
      res.send({'error':'An error has occurred'});
    });
*/
  db.many('select a.worksheet_id as "worksheetid", w.description, a.id as "answeredworksheetid", ' +
      ' COALESCE(w.totalqcnt, 0) as "totalqcnt", COALESCE(awq.answeredqcnt, 0) as "answeredqcnt", ' +
      ' COALESCE(awqc.correctcnt, 0) as "correctcnt", ' +
      ' (COALESCE(awq.answeredqcnt, 0) - COALESCE(awqc.correctcnt, 0)) as incorrectcnt, ' +
      ' (COALESCE(w.totalqcnt, 0) - COALESCE(awq.answeredqcnt, 0)) as skipcnt, ' +
      ' awq.totaltime ' +
      'from answered_worksheet a join (select wi.alternate_id, wi.description, count(wi.id) as totalqcnt ' +
      '                           from worksheet wi join worksheet_questions wqi on wqi.worksheet_id = wi.id ' +
      '                           group by wi.alternate_id, wi.description, wi.id) w on a.worksheet_id = w.alternate_id ' +
      '   left outer join (select awqi.answered_worksheet_id, count(awqi.answered_worksheet_id) as answeredqcnt, ' +
      '                     sum(extract(epoch from to_timestamp(answeredquestion#>>\'{answerMetric,end}\', ' +
      '                                                \'YYYY-MM-DD HH24:MI:SS.MS\')::timestamp at time zone \'00:00\' ' +
      '                                              - to_timestamp(answeredquestion#>>\'{answerMetric,start}\', ' +
      '                                                  \'YYYY-MM-DD HH24:MI:SS.MS\')::timestamp at time zone \'00:00\')) as totaltime ' +
      '                 from answered_worksheet_questions awqi ' +
      '                 group by awqi.answered_worksheet_id) awq on awq.answered_worksheet_id = a.id ' +
      '   left outer join (select awqi.answered_worksheet_id, count(awqi.answered_worksheet_id) as correctcnt ' +
      '                 from answered_worksheet_questions awqi ' +
      '                 where awqi.answeredquestion#>\'{answer, answer}\' = awqi.answeredquestion#>\'{question, answer}\' ' +
      '                 group by awqi.answered_worksheet_id, awqi.answered_worksheet_id) awqc on awqc.answered_worksheet_id = a.id ' +
      ' order by a.worksheet_id, a.id desc')
    .then(function(data) {
        res.status(200).json(data);
    })
    .catch(function(error) {
      console.log("ERROR (getStats): ", error.message || error);
      res.send({'error':'An error has occurred'});
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

  db.one('select w.alternate_id as "id", w.type, w.description, json_agg(jsonb_build_object(\'id\', wq.question_number) || qb.question) as questions ' +
      'from worksheet w join worksheet_questions wq on w.id=wq.worksheet_id ' +
      'join question_bank qb on qb.id=wq.question_id ' +
      'where w.alternate_id=$1 ' +
      'group by w.alternate_id, w.type, w.description ', [worksheetid])
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(error) {
      console.log("ERROR (findWorksheetByAlternateId2): ", error.message || error);
      res.send({'error':'An error has occurred'});
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

/*
  db.one('select * from answered_worksheet where worksheet_id=$1 and id=$2', [worksheetid, id])
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(error) {
      console.log("ERROR (findAnsweredWorksheetById): ", error.message || error);
      res.send({'error':'An error has occurred'});
    });
*/

  db.one('select aw.id, aw.worksheet_id as "worksheetid", aw.status, ' +
      '(case when jsonb_agg(awq.ANSWEREDQUESTION)=jsonb_build_array(null) then jsonb_build_array() else jsonb_agg(awq.ANSWEREDQUESTION) end) as answeredquestions, ' +
      ' aw.create_timestamp as "startTime", aw.update_timestamp as "endTime" ' +
      'from answered_worksheet aw left outer join answered_worksheet_questions awq on awq.ANSWERED_WORKSHEET_ID = aw.ID ' +
      'where aw.worksheet_id=$1 and aw.id=$2 ' +
      'group by aw.id, aw.worksheet_id, aw.status', [worksheetid, id])
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

  db.tx(function(t) {
/*
    var q1 = this.none('update answered_worksheet set ANSWEREDQUESTIONS=$1, ' +
        'status=$2, update_timestamp=$3, UPDATED_BY=$4, UPDATE_MODULE=$5 where worksheet_id=$6 and id=$7',
          [JSON.stringify(answeredWorksheet.answeredquestions), answeredWorksheet.status,
          new Date(), 'service', 'mathworks.js', worksheetid, id]);
*/
    var q1 = this.none('update answered_worksheet set status=$1, ' +
        'update_timestamp=$2, UPDATED_BY=$3, UPDATE_MODULE=$4 ' +
        'where worksheet_id=$5 and id=$6',
          [answeredWorksheet.status, new Date(), 'service', 'mathworks.js',
          worksheetid, id]);

    var worksheetQs = [];

    answeredWorksheet.answeredquestions.forEach(function(obj) {
      worksheetQs.push(obj);
    })

    var q2 = worksheetQs.map(function(l) {
      return t.none('insert into answered_worksheet_questions(ANSWERED_WORKSHEET_ID, QUESTION_NUMBER, ANSWEREDQUESTION) ' +
        'values($1, $2, $3)', [id, l.question.id, l]);
    });

    return this.batch([q1, q2]);
  })
  .then(function(data) {
    getAnsweredWorksheet(worksheetid, id, res);
  })
  .catch(function(error) {
    console.log("ERROR (saveAnsweredWorksheet): ", error.message || error);
    res.send({'error':'An error has occurred'});
  });


  /*
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
    */
};

function getAnsweredWorksheet(worksheetid, id, res) {
  // we need ORM to do database-to-app layer mappings
  db.one('select id, worksheet_id as "worksheetid" from answered_worksheet where worksheet_id=$1 and id=$2', [worksheetid, id])
    .then(function(data) {
        res.status(200).json(data);
    });
}

exports.getStatsByAnswerWorksheetId = function(req, res) {
  db.many('select a.worksheet_id as "worksheetid", w.description, a.id as "answeredworksheetid", ' +
      ' COALESCE(w.totalqcnt, 0) as "totalqcnt", COALESCE(awq.answeredqcnt, 0) as "answeredqcnt", ' +
      ' COALESCE(awqc.correctcnt, 0) as "correctcnt", ' +
      ' (COALESCE(awq.answeredqcnt, 0) - COALESCE(awqc.correctcnt, 0)) as incorrectcnt, ' +
      ' (COALESCE(w.totalqcnt, 0) - COALESCE(awq.answeredqcnt, 0)) as skipcnt, ' +
      ' awq.totaltime ' +
      'from answered_worksheet a join (select wi.alternate_id, wi.description, count(wi.id) as totalqcnt ' +
      '                           from worksheet wi join worksheet_questions wqi on wqi.worksheet_id = wi.id ' +
      '                           group by wi.alternate_id, wi.description, wi.id) w on a.worksheet_id = w.alternate_id ' +
      '   left outer join (select awqi.answered_worksheet_id, count(awqi.answered_worksheet_id) as answeredqcnt, ' +
      '                     sum(extract(epoch from to_timestamp(answeredquestion#>>\'{answerMetric,end}\', ' +
      '                                                \'YYYY-MM-DD HH2:MI:SS.MS\')::timestamp at time zone \'00:00\' ' +
      '                                              - to_timestamp(answeredquestion#>>\'{answerMetric,start}\', ' +
      '                                                  \'YYYY-MM-DD HH2:MI:SS.MS\')::timestamp at time zone \'00:00\')) as totaltime ' +
      '                 from answered_worksheet_questions awqi ' +
      '                 group by awqi.answered_worksheet_id) awq on awq.answered_worksheet_id = a.id ' +
      '   left outer join (select awqi.answered_worksheet_id, count(awqi.answered_worksheet_id) as correctcnt ' +
      '                 from answered_worksheet_questions awqi ' +
      '                 where awqi.answeredquestion#>\'{answer, answer}\' = awqi.answeredquestion#>\'{question, answer}\' ' +
      '                 group by awqi.answered_worksheet_id, awqi.answered_worksheet_id) awqc on awqc.answered_worksheet_id = a.id ' +
      ' order by a.worksheet_id, a.id desc')
    .then(function(data) {
        res.status(200).json(data);
    })
    .catch(function(error) {
      console.log("ERROR (getStatsByAnswerWorksheetId): ", error.message || error);
      res.send({'error':'An error has occurred'});
    });
}
