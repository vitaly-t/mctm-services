\c mathworks;

--DROP DATABASE IF EXISTS mathworks;
--CREATE DATABASE mathworks;

DROP TABLE answered_worksheet;
DROP TABLE worksheet;
DROP TABLE worksheet_type;

CREATE TABLE worksheet_type (
	ID SERIAL PRIMARY KEY NOT NULL,
	TYPE VARCHAR(50) UNIQUE NOT NULL,
	DESCRIPTION VARCHAR(255)
);

CREATE TABLE answered_worksheet_status (
	ID SERIAL PRIMARY KEY NOT NULL,
	STATUS VARCHAR(50) UNIQUE NOT NULL,
	DESCRIPTION VARCHAR(255)
);

CREATE TABLE worksheet(
	ID SERIAL PRIMARY KEY NOT NULL,
	ALTERNATE_ID INTEGER NOT NULL UNIQUE,
	TYPE VARCHAR(50) NOT NULL,
	DESCRIPTION VARCHAR(255),
	QUESTIONS JSONB NOT NULL,

	CONSTRAINT worksheet_worksheet_type_id_fkey FOREIGN KEY(TYPE)
		REFERENCES worksheet_type(TYPE) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE answered_worksheet (
	ID SERIAL PRIMARY KEY NOT NULL,
	WORKSHEET_ID INTEGER NOT NULL,
	STATUS VARCHAR(50) NOT NULL DEFAULT 'in-progress',
	ANSWEREDQUESTIONS JSONB DEFAULT '[]',

	CONSTRAINT answered_worksheet_worksheet_id_fkey FOREIGN KEY(WORKSHEET_ID)
	REFERENCES worksheet(ALTERNATE_ID) MATCH SIMPLE
	ON UPDATE NO ACTION ON DELETE NO ACTION,

	CONSTRAINT answered_worksheet_status_fkey FOREIGN KEY(STATUS)
	REFERENCES answered_worksheet_status(STATUS) MATCH SIMPLE
	ON UPDATE NO ACTION ON DELETE NO ACTION

);

GRANT ALL PRIVILEGES ON TABLE worksheet_type TO mathapp;
GRANT ALL PRIVILEGES ON TABLE worksheet TO mathapp;
GRANT ALL PRIVILEGES ON TABLE answered_worksheet TO mathapp;
GRANT ALL PRIVILEGES ON TABLE answered_worksheet_id_seq TO mathapp;

INSERT INTO worksheet_type(TYPE, DESCRIPTION)
VALUES('sprint', 'mctm sprint');

INSERT INTO answered_worksheet_status(STATUS, DESCRIPTION)
VALUES('in-progress', 'answering is in-progress');
INSERT INTO answered_worksheet_status(STATUS, DESCRIPTION)
VALUES('done', 'answering is done');

INSERT INTO worksheet(ALTERNATE_ID, TYPE, DESCRIPTION, QUESTIONS)
VALUES(1234, 'sprint', 'practice sheet 1', '[
	{ "id" : 10, "question" : "4 tens minus 5 ones plus 6 hundreds equals how much?",
	"answerChoices" : [ { "choice" : "A", "description" : "456" },
		{ "choice" : "B", "description" : "645" },
		{ "choice" : "C", "description" : "654" },
		{ "choice" : "D", "description" : "635" },
		{ "choice" : "E", "description" : "Other" } ]
	},
	{ "id" : 11, "question" : "Which of the following number is divisible by 8?",
	"answerChoices" : [ { "choice" : "A", "description" : "98765" },
		{ "choice" : "B", "description" : "98765432" },
		{ "choice" : "C", "description" : "987654" },
		{ "choice" : "D", "description" : "9876543" },
		{ "choice" : "E", "description" : "Other" } ]
	}
	]');
