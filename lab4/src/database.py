from __future__ import print_function  # In python 2.7
import sqlite3


class Database:
    def __init__(self, db_file):
        self.db_file = db_file

    def commit(self, sql, parameters):
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()
        cursor.execute(sql, parameters)
        conn.commit()

    def fetch(self, sql, parameters):
        conn = sqlite3.connect(self.db_file)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(sql, parameters)
        return cursor.fetchall()

    def add_user(self, email, password, given_name, family_name, gender, city, country):
        self.commit(
            'INSERT INTO Users(email, password, given_name, family_name, gender, city, country) VALUES (?, ?, ?, ?, ?, ?, ?)',
            (email, password, given_name, family_name, gender, city, country)
        )

    def get_user(self, email):
        data = self.fetch('SELECT * FROM Users WHERE Users.email=?', (email,))[0]
        return {
            'email': data[0],
            'password': data[1],
            'given_name': data[2],
            'family_name': data[3],
            'gender': data[4],
            'city': data[5],
            'country': data[6],
            'token': data[7],
            'profile_picture': data[8]
        }

    def add_token(self, email, token):
        self.commit(
            'UPDATE Users SET token=? WHERE email=?',
            (token, email)
        )

    def remove_token(self, email):
        self.commit(
            'UPDATE Users SET token=NULL WHERE email=?',
            (email,)
        )

    def existing_user(self, email):
        return self.fetch(
            'SELECT count(*) FROM Users WHERE email=?',
            (email,)
        )[0][0] == 1

    def set_password(self, email, password):
        self.commit(
            'UPDATE Users SET password=? WHERE email=?',
            (password, email)
        )

    def set_profile_picture(self, email, image_id):
        self.commit(
            'UPDATE Users SET profile_picture=? WHERE email=?',
            (image_id, email,)
        )

    def validate_session(self, email, token):
        return self.fetch(
            'SELECT count(*) FROM Users WHERE email=? AND token=?',
            (email, token)
        )[0][0] == 1

    def validate_login(self, email, password):
        return self.fetch(
            'SELECT count(*) FROM Users WHERE email=? AND password=?',
            (email, password)
        )[0][0] == 1

    def remove_token(self, email):
        self.commit(
            'UPDATE Users SET token=NULL WHERE email=?',
            (email,)
        )

    def add_message(self, message_id, sender, receiver, epoch, content):
        self.commit(
            'INSERT INTO Messages(id, sender, receiver, epoch, content) VALUES(?, ?, ?, ?, ?)',
            (message_id, sender, receiver, epoch, content)
        )

    def delete_message(self, message_id):
        self.commit(
            'DELETE FROM Messages WHERE id=?',
            (message_id,)
        )

    def existing_message(self, message_id):
        return self.fetch(
            'SELECT count(*) FROM Messages WHERE id=?',
            (message_id,)
        )[0][0] == 1

    def get_message(self, message_id):
        data = self.fetch(
            'SELECT * FROM Messages WHERE id=?',
            (message_id,)
        )[0]
        return {
            'id': data[0],
            'sender': data[1],
            'receiver': data[2],
            'epoch': data[3],
            'content': data[4]
        }

    def get_messages(self, receiver):
        data = self.fetch(
            'SELECT * FROM Messages WHERE receiver=?',
            (receiver,)
        )
        messages = []
        for _id, _sender, _receiver, _epoch, _content in data:
            messages.append({
                'id': _id,
                'sender': _sender,
                'receiver': _receiver,
                'epoch': _epoch,
                'content': _content
            })

        return messages

    def get_message_files(self, message_id):
        data = self.fetch(
            'SELECT * FROM MessageFiles WHERE message_id=?',
            (message_id,)
        )
        message_files = []
        for _message_id, _file_id in data:
            message_files.append({
                'message_id': _message_id,
                'file_id': _file_id
            })

        return message_files

    def add_message_file(self, message_id, file_id):
        self.commit(
            'INSERT INTO MessageFiles(message_id, file_id) VALUES(?, ?)',
            (message_id, file_id)
        )

    def add_file(self, file_id, owner, title, description):
        self.commit(
            'INSERT INTO Files(id, owner, title, description) VALUES(?, ?, ?, ?)',
            (file_id, owner, title, description)
        )

    def get_number_of_tokens(self):
        return self.fetch(
            'SELECT count(*) FROM Users WHERE token IS NOT NULL', ()
        )[0][0]

    def get_number_of_received_messages(self, user):
        return self.fetch(
            'SELECT count(*) FROM Messages WHERE receiver=?',
            (user,)
        )[0][0]

    def get_number_of_sent_messages(self, user):
        return self.fetch(
            'SELECT count(*) FROM Messages WHERE sender=?',
            (user,)
        )[0][0]

    def get_total_number_of_messages(self):
        return self.fetch(
            'SELECT count(*) FROM Messages', ()
        )[0][0]
