from flask_bcrypt import generate_password_hash, check_password_hash
from flask import Flask, request, jsonify
from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
from database import Database
from oauth import OAuthGoogle
from functools import wraps
import json
import random
import time
import base64
import uuid
import os

db = Database('database.db')
app = Flask(__name__, static_url_path='')
oauth_google = OAuthGoogle()


def response(success, message=None, data=None):
    """ Response to json """
    r = {'success': success}
    if message is not None:
        r['message'] = message
    if data is not None:
        r['data'] = data
    # print(r)
    return jsonify(r)


def b64decloads(encoded_json):
    return json.loads(base64.b64decode(encoded_json))


def dumpsb64enc(dictionary):
    return base64.b64encode(json.dumps(dictionary))


def session_owner():
    return b64decloads(request.cookies.get('session'))['email']


def session_token():
    return b64decloads(request.cookies.get('session'))['token']


def session_required(func):  # Decorator
    """ Verifies that there is a valid session cookie. If there's an invalid one the cookie is killed. """

    @wraps(func)  # @wraps copies the original function's information to the new function
    def wrapper():
        if 'session' not in request.cookies:
            return response(False, 'You are not signed in')
        elif not db.validate_session(session_owner(), session_token()):
            # If there's an invalid session cookie, kill it.
            resp = app.make_response(response(False, 'Invalid credentials'))
            resp.set_cookie('session', value='garbage', max_age=0)
            return resp
        else:
            return func()

    return wrapper


def form_parameters(keys):  # Decorator
    """ Verifies that request form has parameters in keys """

    def func_decorator(func):
        @wraps(func)
        def wrapper():
            for name in keys:
                if name not in request.form:
                    return response(False, 'Bad request. Missing paramter "' + name + '".')

            return func()

        return wrapper

    return func_decorator


def random_string(length):
    rand_str = ''
    chars = '0123456789abcdefghijklmnoqprstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for i in range(length):
        rand_str += chars[random.randint(0, len(chars) - 1)]
    return rand_str


def get_b64file(file_id):
    file_path = os.path.join(
        os.path.dirname(__file__), 'userfiles/' + file_id
    )
    with open(file_path, 'r') as f:
        return f.read()


def store_file(file_data):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(
        os.path.dirname(__file__), 'userfiles/' + file_id
    )
    with open(file_path, 'w') as f:
        f.write(file_data)

    return file_id


@app.route('/')
def page():
    return app.send_static_file('client.html')


@app.route('/is_logged_in', methods=['POST'])
@session_required
def is_logged_in():
    user_id = session_owner()
    return response(True, 'You are logged in as ' + user_id, user_id)


@app.route('/oauth_google_url', methods=['POST'])
def oauth_google_url():
    """ Creates and returns a Google OAuth URL. "state" being the unique property.
        This occurs when the user uses the login with Google option."""
    url = oauth_google.get_url()
    return response(True, 'Google OAuth link successfully generated.', url)


@app.route('/oauth_google_login', methods=['GET'])
def oauth_google_sign_in():
    # Called after the user has signed in with Google.
    code = request.args.get('code')
    state = request.args.get('state')  # TODO: Validate state with previous link
    # Uses the retreived code to get an id and access token from Google.
    token = oauth_google.get_token(code)
    if 'error' in token:
        return token['error'] + ': ' + token['error_description']
    # Decodes the id_token (JWT).
    token_info = oauth_google.token_info(token['id_token'])  # TODO: Verify that token is designated for this app
    if 'error' in token_info:
        return token_info['error'] + ': ' + token_info['error_description']
    # Register the user if s(he) doesn't exist.
    email = token_info['email']
    if not db.existing_user(email):
        db.add_user(
            email,
            None,
            token_info['given_name'],
            token_info['family_name'],
            None,
            None,
            None
        )
    # At this point the user has been authenticated and is registered.
    # No more API calls will be done so access_token/id_token are not saved in the database.
    token = random_string(35)
    db.add_token(email, token)
    resp = app.make_response(app.send_static_file('client.html'))
    resp.set_cookie(
        'session',
        value=dumpsb64enc({'email': email, 'token': token}),
        secure=True,
        httponly=True,
        max_age=60 * 60 * 24 * 30
    )
    return resp


@app.route('/login', methods=['POST'])
@form_parameters(['email', 'password'])
def login():
    email = request.form['email']
    password = request.form['password']
    # Validate request
    if not db.existing_user(email):
        return response(False, 'Invalid email or password.')
    # Validate password
    pw_hash = db.get_user(email)['password']
    if not check_password_hash(pw_hash, password):
        return response(False, 'Invalid email or password')
    # User authorized
    token = random_string(35)
    db.add_token(email, token)
    resp = app.make_response(response(True, 'Successfully logged in as' + email, email))
    resp.set_cookie(
        'session',
        value=dumpsb64enc({'email': email, 'token': token}),
        secure=True,
        httponly=True,
        max_age=60 * 60 * 24 * 30
    )
    ws_push_live_data()
    return resp


@app.route('/logout', methods=['POST'])
@session_required
def logout():
    resp = app.make_response(response(True, 'Successfully logged out.'))
    resp.set_cookie('session', value='garbage', max_age=0)
    db.remove_token(session_owner())
    ws_push_live_data()
    return resp


@app.route('/register', methods=['POST'])
@form_parameters(['email', 'password', 'givenName', 'familyName', 'gender', 'city', 'country'])
def register():
    email = request.form['email']
    if db.existing_user(email):
        return response(False, message='User already exists.')
    # Register
    db.add_user(
        email,
        generate_password_hash(request.form['password']),
        request.form['givenName'],
        request.form['familyName'],
        request.form['gender'],
        request.form['city'],
        request.form['country'],
    )
    resp = app.make_response(response(True, 'Successfully registered.'))
    return resp


@app.route('/change_password', methods=['POST'])
@session_required
@form_parameters(['password', 'newPassword', 'reNewPassword'])
def change_password():
    # Validate password
    email = session_owner()
    password = db.get_user(email)['password']
    if not check_password_hash(password, request.form['password']):
        return response(False, 'Incorrect password')

    db.set_password(email, generate_password_hash(request.form['newPassword']))
    return response(True, 'Password changed.')


@app.route('/existing_user', methods=['POST'])
@session_required
@form_parameters(['id'])
def existing_user():
    if db.existing_user(request.form['id']):
        return response(True, 'User exists.', True)

    return response(True, 'User does not exist', False)


@app.route('/get_public_user', methods=['POST'])
@session_required
@form_parameters(['id'])
def get_public_user():
    user_id = request.form['id']
    if not db.existing_user(user_id):
        return response(False, 'User does not exist.')

    user_data = db.get_user(user_id)
    # Remove sensitive information.
    del user_data['password']
    del user_data['token']
    return response(True, 'Successfully retrieved public user data.', user_data)


@app.route('/get_messages', methods=['POST'])
@form_parameters(['id'])
@session_required
def get_messages():
    user_id = request.form['id']
    if not db.existing_user(user_id):
        return response(False, 'User does not exist.')
    # Get messages and return them.
    messages = db.get_messages(user_id)
    for message in messages:
        files = []
        message_files = db.get_message_files(message['id'])
        for message_file in message_files:
            files.append(message_file['file_id'])

        message['files'] = files

    return response(True, 'Successfully retrieved user messages.', messages)


@app.route('/post_message', methods=['POST'])
@session_required
@form_parameters(['receiver', 'content'])
def post_message():
    receiver = request.form['receiver']
    if not db.existing_user(receiver):
        return response(False, 'User does not exist.')

    sender = session_owner()
    message_id = str(uuid.uuid4())
    if 'file_id' in request.form:  # TODO: Should take multiple files
        db.add_message_file(message_id, request.form['file_id'])

    db.add_message(message_id, sender, receiver, time.time(), request.form['content'])
    ws_push_live_data()
    return response(True, 'Message posted.', message_id)


@app.route('/delete_message', methods=['POST'])
@session_required
@form_parameters(['id'])
def delete_message():
    message_id = request.form['id']
    if not db.existing_message(message_id):
        return response(False, 'Message does not exist.')
    # Only the receiver can delete a message.
    message = db.get_message(message_id)
    if message['receiver'] != session_owner():
        return response(False, 'Unauthorized request.')
    # Delete and return.
    db.delete_message(message_id)
    ws_push_live_data()
    return response(True, 'Message removed.')


@app.route('/upload_file', methods=['POST'])
@session_required
@form_parameters(['data', 'title', 'description'])
def upload_file():
    file_id = str(uuid.uuid4())
    file_path = os.path.join(
        os.path.dirname(__file__), 'userfiles/' + file_id
    )
    file_data = request.form['data']
    with open(file_path, 'w') as f:
        f.write(file_data)

    db.add_file(file_id, session_owner(), request.form['title'], request.form['description'])
    return response(True, 'File uploaded', {'id': file_id})


@app.route('/set_profile_picture', methods=['POST'])
@session_required
@form_parameters(['id'])
def set_profile_picture():
    db.set_profile_picture(session_owner(), request.form['id'])
    return response(True, 'User picture set', request.form['id'])


@app.route('/get_profile_picture', methods=['POST'])
@form_parameters(['id'])
def get_profile_picture():
    user_data = db.get_user(request.form['id'])
    if user_data['profile_picture'] is not None:
        file_id = user_data['profile_picture']
        b64_file = get_b64file(file_id)
        return response(True,
                        'User picture successfully retrieved', {
                            'image_id': file_id,
                            'image': b64_file
                        })

    return response(False, 'User has no profile picture')


@app.route('/get_file', methods=['POST'])
@form_parameters(['id'])
def get_file():
    file_id = request.form['id']
    b64_file = get_b64file(file_id)
    return response(True,
                    'File successfully retrieved', {
                        'file_id': file_id, 'file': b64_file
                    })


# Websockets

user_socket = {}  # Current socket for user
user_session = {}  # Used to keep track of previous session, if new != prev kick prev user.


def add_user(ws, user, token):
    if user in user_socket:
        user_socket[user].append(ws)
    else:
        user_socket[user] = [ws]

    user_session[user] = token


def remove_user(user):
    del user_socket[user]
    del user_session[user]


def live_data_response(user):
    online_users = db.get_number_of_tokens()
    received_messages = db.get_number_of_received_messages(user)
    sent_messages = db.get_number_of_sent_messages(user)
    total_messages = db.get_total_number_of_messages()
    return [online_users, received_messages, sent_messages, total_messages]


def ws_push_live_data():
    for user in user_socket:
        live_data = live_data_response(user)
        for ws in user_socket[user]:
            try:
                ws.send(ws_response('livedata', live_data))
            except Exception:
                pass


def ws_response(type, data):
    ret = json.dumps({'type': type, 'data': data})
    # print(ret)
    return ret


def ws_handler(ws, message):
    req = json.loads(message)
    t = req['type']
    user = session_owner()
    token = session_token()
    if not db.validate_session(user, token):
        ws.send(ws_response('kick', 'Your session is not valid.'))
        return False

    if t == 'ping':
        ws.send(ws_response('pong', time.time()))

    elif t == 'livedata':
        ws.send(ws_response('livedata', live_data_response(user)))

    elif t == 'login':
        if user in user_session:
            if token != user_session[user]:
                for _ws in user_socket[user]:
                    try:
                        _ws.send(ws_response('kick', 'Your account has been accessed somewhere else.'))
                    except Exception:
                        # Some sockets might not be valid, nevertheless we need to continue and send to the rest
                        pass
                remove_user(user)

        add_user(ws, user, token)
        ws.send(ws_response('loggedin', ''))

    elif t == 'logout':
        remove_user(user)
        ws.send(ws_response('loggedout', ''))
        return False

    else:
        ws.send(ws_response('error', 'Bad request'))

    return True


@app.route('/ws')
def ws_api():
    if 'wsgi.websocket' not in request.environ:
        return response(False, 'Not a websocket.')

    ws = request.environ['wsgi.websocket']
    keep_alive = True
    while keep_alive:
        try:
            message = ws.receive()
            keep_alive = ws_handler(ws, message)
        except ValueError:
            ws.send(ws_response('error', 'Request needs to be valid json'))


if __name__ == '__main__':
    # context = ('trash.crt', 'trash.key')
    # app.run(host='127.0.0.1', port=12344, debug=True, ssl_context=context)
    port = 12344
    ip = '127.0.0.1'
    https_server = WSGIServer(
        (ip, port),
        app,
        handler_class=WebSocketHandler,
        keyfile='trash.key',
        certfile='trash.crt'
    )
    print('Server is alive on ' + ip + ':' + str(port) + '.')
    https_server.serve_forever()
