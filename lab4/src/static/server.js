const server = {
    url: 'https://localhost:12344',
    request: function (type, uri, parameters, callback) {
        let xhr = new XMLHttpRequest();

        let params = '';
        for (let key in parameters) {
            if (parameters.hasOwnProperty(key))
                params += key + '=' + parameters[key] + '&';
        }
        params = params.slice(0, -1);

        if (type === 'POST' || type === 'PUT') {
            xhr.open(type, this.url + uri);
            xhr.onload = function () {
                let responseJSON = JSON.parse(decodeURIComponent(xhr.responseText));
                console.debug(responseJSON);
                callback(responseJSON);
            };
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.send(params);

        } else {
            xhr.open(type, this.url + uri + '?' + params);
            xhr.onload = function () {
                callback(xhr.responseText);
            }
            xhr.send();
        }
    },

    ws: {
        wsUrl: 'wss://localhost:12344/ws',
        _ws: undefined,

        init: function (onOpenCallback) {
            this._ws = new WebSocket(this.wsUrl);
            this._ws.onopen = onOpenCallback;
            this._ws.onerror = function (event) {
                console.error(event);
            };

            this._ws.onclose = function () {
                console.error("Lost WebSocket connection.");
            };

            this._ws.onmessage = (event) => {
                let response = JSON.parse(event.data);
                switch (response.type) {
                    case 'kick':
                        console.debug(response.data)
                        clearInterval(globalVar.webSocketPing);
                        this._ws = undefined;
                        forceLogOut(response.data);
                        break;
                    case 'message':
                        globalVar.onMessage('info', response.data);
                        break;
                    case 'error':
                        globalVar.onMessage('danger', response.data);
                        break;
                    case 'loggedin':
                        server.ws.send('livedata', '');
                        globalVar.webSocketPing = setInterval(() => {
                            server.ws.send('ping', '');
                        }, 3000);
                        break;
                    case 'loggedout':
                        clearInterval(globalVar.webSocketPing);
                        break;
                    case 'livedata':
                        console.log(response.data);
                        globalVar.liveData(response.data);
                        break;
                    case 'pong':
                        break;
                    default:
                        console.error("Unhandled method type: " + response.type);
                }
            };
        },

        send: function (type, data) {
            if (this._ws == null || this._ws.readyState === WebSocket.CLOSED) {
                this.init(() => {
                    console.debug(type, data);
                    this._ws.send(JSON.stringify({type: type, data: data}));
                });
            } else {
                console.debug(type, data);
                this._ws.send(JSON.stringify({type: type, data: data}));
            }
        }
    }
};
