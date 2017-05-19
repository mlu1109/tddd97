DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS MessageFiles;
DROP TABLE IF EXISTS Files;
DROP TABLE IF EXISTS Images;
DROP TABLE IF EXISTS Audios;
DROP TABLE IF EXISTS Videos;

CREATE TABLE Users(
  email VARCHAR(30) PRIMARY KEY,
  password VARCHAR(30),
  given_name VARCHAR(30),
  family_name VARCHAR(30),
  gender VARCHAR(30),
  city VARCHAR(30),
  country VARCHAR(30),
  token VARCHAR(30) UNIQUE,
  profile_picture VARCHAR(36),
  FOREIGN KEY(profile_picture) REFERENCES Files(id)
);

CREATE TABLE Messages(
  id VARCHAR(36) PRIMARY KEY,
  sender VARCHAR(30),
  receiver VARCHAR(30),
  epoch INTEGER,
  content VARCHAR(255),
  FOREIGN KEY(sender) REFERENCES Users(email),
  FOREIGN KEY(receiver) REFERENCES Users(email)
);

CREATE TABLE MessageFiles(
  message_id VARCHAR(36),
  file_id VARCHAR(36),
  FOREIGN KEY(message_id) REFERENCES Messages(id),
  FOREIGN KEY(file_id) REFERENCES Files(id)
);

CREATE TABLE Files(
  id VARCHAR(36) PRIMARY KEY,
  owner VARCHAR(30),
  title VARCHAR(30),
  description VARCHAR(255),
  FOREIGN KEY(owner) REFERENCES Users(email)
);