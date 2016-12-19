\c mathworks;

--DROP DATABASE IF EXISTS mathworks;
--CREATE DATABASE mathworks;

DROP TABLE answered_worksheet_questions;
DROP TABLE answered_worksheet;
DROP TABLE worksheet_questions;
DROP TABLE worksheet;
DROP TABLE worksheet_type;
DROP TABLE answered_worksheet_status;
DROP TABLE question_bank;
DROP TABLE sub_category_type;
DROP TABLE category_type;

CREATE TABLE worksheet_type (
	ID SERIAL PRIMARY KEY NOT NULL,
	TYPE VARCHAR(50) UNIQUE NOT NULL,
	DESCRIPTION VARCHAR(255)
);

CREATE TABLE answered_worksheet_status (
	ID SERIAL PRIMARY KEY NOT NULL,
	STATUS VARCHAR(50) UNIQUE NOT NULL,
	DESCRIPTION VARCHAR(255) NULL
);

CREATE TABLE category_type (
	ID INTEGER PRIMARY KEY NOT NULL,
	NAME VARCHAR(30) NOT NULL UNIQUE,
	DESCRIPTION VARCHAR(255) NOT NULL,
	CREATE_TIMESTAMP TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	CREATED_BY VARCHAR(30) NOT NULL,
	CREATE_MODULE VARCHAR(50) NOT NULL,
	UPDATE_TIMESTAMP TIMESTAMP WITH TIME ZONE NULL,
	UPDATED_BY VARCHAR(30) NULL,
	UPDATE_MODULE VARCHAR(50) NULL
);

CREATE TABLE sub_category_type (
	ID INTEGER PRIMARY KEY NOT NULL,
	CATEGORY VARCHAR(30) NOT NULL,
	NAME VARCHAR(30) NOT NULL UNIQUE,
	DESCRIPTION VARCHAR(255) NOT NULL,
	CREATE_TIMESTAMP TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	CREATED_BY VARCHAR(30) NOT NULL,
	CREATE_MODULE VARCHAR(50) NOT NULL,
	UPDATE_TIMESTAMP TIMESTAMP WITH TIME ZONE NULL,
	UPDATED_BY VARCHAR(30) NULL,
	UPDATE_MODULE VARCHAR(50) NULL,

	CONSTRAINT sub_category_category_name_fkey FOREIGN KEY(CATEGORY)
		REFERENCES category_type(NAME) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE question_bank (
	ID SERIAL PRIMARY KEY NOT NULL,
	QUESTION JSONB NOT NULL,
	CATEGORY VARCHAR(30) NOT NULL,
	SUB_CATEGORY_1 VARCHAR(30) NULL,
	SUB_CATEGORY_2 VARCHAR(30) NULL,
	CREATE_TIMESTAMP TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	CREATED_BY VARCHAR(30) NOT NULL,
	CREATE_MODULE VARCHAR(50) NOT NULL,

	CONSTRAINT question_bank_category_name_fkey FOREIGN KEY(CATEGORY)
		REFERENCES category_type(NAME) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT question_bank_sub_category_name_fkey FOREIGN KEY(SUB_CATEGORY_1)
		REFERENCES sub_category_type(NAME) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT question_bank_sub_category_name_fkey2 FOREIGN KEY(SUB_CATEGORY_2)
		REFERENCES sub_category_type(NAME) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION

);

/*
CREATE TABLE worksheet(
	ID SERIAL PRIMARY KEY NOT NULL,
	ALTERNATE_ID INTEGER NOT NULL UNIQUE,
	TYPE VARCHAR(50) NOT NULL,
	DESCRIPTION VARCHAR(255),
	QUESTIONS JSONB NOT NULL,
	CREATE_TIMESTAMP TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	CREATED_BY VARCHAR(30) NOT NULL,
	CREATE_MODULE VARCHAR(50) NOT NULL,
	UPDATE_TIMESTAMP TIMESTAMP WITH TIME ZONE NULL,
	UPDATED_BY VARCHAR(30) NULL,
	UPDATE_MODULE VARCHAR(50) NULL,

	CONSTRAINT worksheet_worksheet_type_id_fkey FOREIGN KEY(TYPE)
		REFERENCES worksheet_type(TYPE) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
);
*/

CREATE TABLE worksheet(
	ID SERIAL PRIMARY KEY NOT NULL,
	ALTERNATE_ID INTEGER NOT NULL UNIQUE,
	TYPE VARCHAR(50) NOT NULL,
	DESCRIPTION VARCHAR(255),
	CREATE_TIMESTAMP TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	CREATED_BY VARCHAR(30) NOT NULL,
	CREATE_MODULE VARCHAR(50) NOT NULL,
	UPDATE_TIMESTAMP TIMESTAMP WITH TIME ZONE NULL,
	UPDATED_BY VARCHAR(30) NULL,
	UPDATE_MODULE VARCHAR(50) NULL,

	CONSTRAINT worksheet_worksheet_type_id_fkey FOREIGN KEY(TYPE)
		REFERENCES worksheet_type(TYPE) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE worksheet_questions(
	WORKSHEET_ID INTEGER NOT NULL,
	QUESTION_NUMBER INTEGER NOT NULL,
	QUESTION_ID INTEGER NOT NULL,

	CONSTRAINT worksheet_questions_worksheet_id_fkey FOREIGN KEY(WORKSHEET_ID)
		REFERENCES worksheet(ID) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT worksheet_questions_question_bank_id_fkey FOREIGN KEY(QUESTION_ID)
		REFERENCES question_bank(ID) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION

);

CREATE TABLE answered_worksheet (
	ID SERIAL PRIMARY KEY NOT NULL,
	WORKSHEET_ID INTEGER NOT NULL,
	STATUS VARCHAR(50) NOT NULL DEFAULT 'in-progress',
	ANSWEREDQUESTIONS JSONB DEFAULT '[]',
	CREATE_TIMESTAMP TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
	CREATED_BY VARCHAR(30) NOT NULL,
	CREATE_MODULE VARCHAR(50) NOT NULL,
	UPDATE_TIMESTAMP TIMESTAMP WITH TIME ZONE NULL,
	UPDATED_BY VARCHAR(30) NULL,
	UPDATE_MODULE VARCHAR(50) NULL,

	CONSTRAINT answered_worksheet_worksheet_id_fkey FOREIGN KEY(WORKSHEET_ID)
	REFERENCES worksheet(ALTERNATE_ID) MATCH SIMPLE
	ON UPDATE NO ACTION ON DELETE NO ACTION,

	CONSTRAINT answered_worksheet_status_fkey FOREIGN KEY(STATUS)
	REFERENCES answered_worksheet_status(STATUS) MATCH SIMPLE
	ON UPDATE NO ACTION ON DELETE NO ACTION

);

CREATE TABLE answered_worksheet_questions (
	ANSWERED_WORKSHEET_ID INTEGER NOT NULL,
	QUESTION_ID INTEGER NOT NULL,

	CONSTRAINT answered_worksheet_questions_answered_worksheet_id_fkey FOREIGN KEY(ANSWERED_WORKSHEET_ID)
		REFERENCES answered_worksheet(ID) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION,
	CONSTRAINT answered_worksheet_questions_question_bank_id_fkey FOREIGN KEY(QUESTION_ID)
		REFERENCES question_bank(ID) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION

);

GRANT ALL PRIVILEGES ON TABLE worksheet_type TO mathapp;
GRANT ALL PRIVILEGES ON TABLE worksheet TO mathapp;
GRANT ALL PRIVILEGES ON TABLE answered_worksheet TO mathapp;
GRANT ALL PRIVILEGES ON TABLE answered_worksheet_id_seq TO mathapp;
GRANT ALL PRIVILEGES ON TABLE category_type TO mathapp;
GRANT ALL PRIVILEGES ON TABLE sub_category_type TO mathapp;
GRANT ALL PRIVILEGES ON TABLE question_bank TO mathapp;
GRANT ALL PRIVILEGES ON TABLE question_bank_id_seq TO mathapp;
GRANT ALL PRIVILEGES ON TABLE worksheet_questions TO mathapp;
GRANT ALL PRIVILEGES ON TABLE answered_worksheet_questions TO mathapp;

INSERT INTO worksheet_type(TYPE, DESCRIPTION)
VALUES('sprint', 'mctm sprint');

INSERT INTO answered_worksheet_status(STATUS, DESCRIPTION)
VALUES('in-progress', 'answering is in-progress');
INSERT INTO answered_worksheet_status(STATUS, DESCRIPTION)
VALUES('done', 'answering is done');

/*
INSERT INTO worksheet(ID, ALTERNATE_ID, TYPE, DESCRIPTION, CREATE_TIMESTAMP, CREATED_BY, CREATE_MODULE, QUESTIONS)
VALUES(1, 1234, 'sprint', 'practice sheet 1', NOW(), 'manual', 'sql', '[
	{ "id" : 10, "question" : "4 tens minus 5 ones plus 6 hundreds equals how much?",
	"answerChoices" : [ { "choice" : "A", "description" : "456" },
		{ "choice" : "B", "description" : "645" },
		{ "choice" : "C", "description" : "654" },
		{ "choice" : "D", "description" : "635" },
		{ "choice" : "E", "description" : "Other" } ],
		"answer": "D"
	},
	{ "id" : 11, "question" : "Which of the following number is divisible by 8?",
	"answerChoices" : [ { "choice" : "A", "description" : "98765" },
		{ "choice" : "B", "description" : "98765432" },
		{ "choice" : "C", "description" : "987654" },
		{ "choice" : "D", "description" : "9876543" },
		{ "choice" : "E", "description" : "Other" } ],
		"answer": "B"
	}
	]');
*/

INSERT INTO worksheet(ID, ALTERNATE_ID, TYPE, DESCRIPTION, CREATE_TIMESTAMP, CREATED_BY, CREATE_MODULE)
VALUES(1, 1234, 'sprint', 'practice sheet 1', NOW(), 'manual', 'sql');


INSERT INTO category_type(ID, NAME, DESCRIPTION, CREATE_TIMESTAMP, CREATED_BY, CREATE_MODULE)
VALUES
	(1, 'probability', 'probability', NOW(), 'manual', 'sql'),
	(2, 'permutations and computations', 'permutations and computations', NOW(), 'manual', 'sql'),
	(3, 'arithmetic', 'arithmetic', NOW(), 'manual', 'sql');

INSERT INTO sub_category_type(ID, CATEGORY, NAME, DESCRIPTION, CREATE_TIMESTAMP, CREATED_BY, CREATE_MODULE)
VALUES
	(1, 'probability', 'single event', 'single event', NOW(), 'manual', 'sql'),
	(2, 'probability', 'compound events', 'compound events', NOW(), 'manual', 'sql'),
	(3, 'arithmetic', 'divisibility', 'divisibility', NOW(), 'manual', 'sql');

INSERT INTO question_bank(ID, QUESTION, CATEGORY, SUB_CATEGORY_1, CREATE_TIMESTAMP, CREATED_BY, CREATE_MODULE)
VALUES
	(1, '{"question" : "4 tens minus 5 ones plus 6 hundreds equals how much?",
		"answerChoices" : [ { "choice" : "A", "description" : "456" },
			{ "choice" : "B", "description" : "645" },
			{ "choice" : "C", "description" : "654" },
			{ "choice" : "D", "description" : "635" },
			{ "choice" : "E", "description" : "Other" } ],
		"answer": "D"
		}', 'arithmetic', null, NOW(), 'manual', 'sql'),
	(2, '{"question" : "Which of the following number is divisible by 8?",
		"answerChoices" : [ { "choice" : "A", "description" : "98765" },
			{ "choice" : "B", "description" : "98765432" },
			{ "choice" : "C", "description" : "987654" },
			{ "choice" : "D", "description" : "9876543" },
			{ "choice" : "E", "description" : "Other" } ],
		"answer": "B"
		}', 'arithmetic', 'divisibility', NOW(), 'manual', 'sql');

INSERT INTO worksheet_questions(WORKSHEET_ID, QUESTION_NUMBER, QUESTION_ID)
VALUES
	(1, 10, 1),
	(1, 11, 2);
