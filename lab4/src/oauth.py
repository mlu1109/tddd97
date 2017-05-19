import requests
import random
import json


# https://developers.google.com/identity/protocols/OAuth2WebServer


def random_string(length):
    rand_str = ""
    chars = "0123456789abcdefghijklmnoqprstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    for i in range(length):
        rand_str += chars[random.randint(0, len(chars) - 1)]
    return rand_str


class OAuthGoogle:
    def __init__(self):
        self.client_id = ""
        self.client_secret = ""

    def get_url(self):
        # Generates a req link with a new state to counter CSRF-attacks
        state = random_string(25)  # TODO: Save state to database for validation (or something)
        url = "https://accounts.google.com/o/oauth2/v2/auth?" + \
              "client_id=" + self.client_id + "&" + \
              "response_type=code&" + \
              "redirect_uri=https://localhost:12344/oauth_google_login&" + \
              "scope=email%20profile" + \
              "&state=" + state
        return url

    def get_token(self, code):
        # Use previously obtained code to get an access token.
        r = requests.post("https://www.googleapis.com/oauth2/v4/token", {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": "https://localhost:12344/oauth_google_login"  # Has to be the same as the one in get_url
        })
        return json.loads(r.text)

    @staticmethod
    def token_info(id_token):
        r = requests.get("https://www.googleapis.com/oauth2/v3/tokeninfo", {
            "id_token": id_token
        })
        return json.loads(r.text)
