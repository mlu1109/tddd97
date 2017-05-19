const USER_PAGE = '#home';
const BROWSE_PAGE = '#browse';
const ACCOUNT_PAGE = '#account';
const LOGOUT_PAGE = '#logout';
const STATS_PAGE = '#stats';

var globalVar = {};


class Message extends React.Component {
    render() {
        const style = {
            position: 'fixed',
            bottom: '0px',
            zIndex: 10,
            left: '50%',
            width: '80%',
            transform: 'translateX(-50%)'
        };
        const typeToText = {
            'danger': <strong>Error! </strong>,
            'success': <strong>Success! </strong>,
            'info': <strong>Info! </strong>
        };
        return (
            <div style={style} onClick={this.props.onClick}>
                {
                    this.props.messages.map((message, i) => {
                        return (
                            <div key={i} className={'alert alert-' + message.type}>
                                {typeToText[message.type]}
                                {message.text}
                            </div>
                        );
                    }).reverse()
                }
            </div>
        );
    }
}

class Client extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUserId: '',
            messages: props.messages || [],
            cachedUserData: {},
            cachedUserMessages: {},
            cachedFiles: {},
            domainsArray: [], // [#topDomain, subDomain, subSubDomain...]
            liveData: {
                time: [],
                numberOfUsersOnline: [],
                numberOfReceivedMessages: [],
                numberOfSentMessages: [],
                totalNumberOfMessages: []
            },
        }

        this.pushState = this.pushState.bind(this);
        this.onClickTab = this.onClickTab.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.clearMessages = this.clearMessages.bind(this);
        this.onLogin = this.onLogin.bind(this);
        this.afterLogin = this.afterLogin.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.updateUserData = this.updateUserData.bind(this);
        this.updateUserMessages = this.updateUserMessages.bind(this);
        this.updateFile = this.updateFile.bind(this);
        this.updateProfilePicture = this.updateProfilePicture.bind(this);
        this.updateCachedUser = this.updateCachedUser.bind(this);
        this.getCurrentPage = this.getCurrentPage.bind(this)

        window.addEventListener('popstate', (event) => {
            event.preventDefault();
            this.setState({domainsArray: event.state});
        });

        globalVar.onMessage = (type, message) => {
            this.onMessage(type, message);
        };

        globalVar.liveData = (liveData) => {
            let data = this.state.liveData;
            data.time.push(Math.floor(new Date().getTime()/1000))
            data.numberOfUsersOnline.push(liveData[0]);
            data.numberOfReceivedMessages.push(liveData[1]);
            data.numberOfSentMessages.push(liveData[2]);
            data.totalNumberOfMessages.push(liveData[3]);
            this.setState({liveData: data});
        };
    }

    pushState(domainsArray) {
        if (window.location.pathname !== '/') {
            window.history.pushState(domainsArray, '', '/' + domainsArray.join('/'))
        }
        window.history.pushState(domainsArray, '', domainsArray.join('/'));
        this.setState({domainsArray: domainsArray})
    }

    componentDidMount() {
        server.request('POST', '/is_logged_in', null, (response) => {
            if (response.success) {
                server.ws.send('login', '') // Establish a WebSocket connection
                this.setState({currentUserId: response.data});
                this.afterLogin();
                this.onMessage('info', response.message);
            }
        });

        if (window.location.hash.length) {
            this.pushState(window.location.hash.split('/'));
        } else {
            this.pushState([USER_PAGE]);
        }

    }

    onLogin(formData) {
        server.request('POST', '/login', formData, (response) => {
            if (response.success) {
                server.ws.send('login', ''); // Establish a WebSocket connection
                this.onMessage('success', response.message);
                this.setState({currentUserId: response.data});
                this.pushState([USER_PAGE]);
                this.afterLogin();
            } else {
                this.onMessage('danger', response.message);
            }
        });
    }

    afterLogin() {
        let currentUserId = this.state.currentUserId;
        this.updateUserData(currentUserId)
        this.updateUserMessages(currentUserId);
        this.updateProfilePicture(currentUserId);
    }

    onLogout() {
        server.ws.send('logout', '')
        server.request('POST', '/logout', {}, (response) => {
            if (response.success) {
                this.onMessage('success', response.message);
            } else {
                this.onMessage('danger', response.message);
            }
        });
        this.setState({currentUserId: ''});
        clearInterval(globalVar.webSocketPing);
    }

    onClickTab(event) {
        // Don't take action if user isn't logged in.
        if (!this.state.currentUserId.length) {
            return;
        }

        this.pushState([event.target.id]);
        switch (event.target.id) {
            case USER_PAGE:
                let currentUserId = this.state.currentUserId;
                this.updateUserMessages(currentUserId);
                this.updateProfilePicture(currentUserId);
                break;
            case BROWSE_PAGE:
            case ACCOUNT_PAGE:
            case STATS_PAGE:
                break;
            case LOGOUT_PAGE:
                this.onLogout();
                this.pushState(['/']);
                break;
            default:
                console.error("Unhandled tab:" + event.target.id);
        }
    }

    onMessage(type, message) {
        let messages = this.state.messages;
        messages.push({type: type, text: (new Date()).toTimeString().slice(0, 8) + ' ' + message});
        this.setState({messages: messages});
    }

    clearMessages() {
        this.setState({messages: []});
    }

    updateUserData(userId) {
        server.request('POST', '/get_public_user', {id: userId}, (response) => {
            if (response.success) {
                let cachedUserData = this.state.cachedUserData;
                cachedUserData[userId] = response.data;
                this.setState({cachedUserData: cachedUserData});
            } else {
                this.onMessage('danger', response.message);
            }
        });
    }

    updateUserMessages(userId) {
        let cachedUserMessages = this.state.cachedUserMessages;
        server.request('POST', '/get_messages', {'id': userId}, (response) => {
            if (response.success) {
                cachedUserMessages[userId] = response.data;
                this.setState({cachedUserMessages: cachedUserMessages});
                for (let message of response.data) {
                    if (message.files && message.files[0]) {
                        this.updateFile(message.files[0]);
                    }
                }
            } else {
                this.props.onMessage('danger', response.message);
            }
        });
    }

    updateFile(fileId) {
        if (this.state.cachedFiles[fileId]) {
            return;
        }

        let cachedFiles = this.state.cachedFiles;
        server.request('POST', '/get_file', {'id': fileId}, (response) => {
            if (response.success) {
                cachedFiles[fileId] = response.data.file;
                this.setState({cachedFiles: cachedFiles});
            } else {
                this.onMessage('danger', response.message);
            }
        });
    }

    updateProfilePicture(userId) {
        let cachedFiles = this.state.cachedFiles;
        server.request('POST', '/get_profile_picture', {'id': userId}, (response) => {
            if (response.success) {
                cachedFiles[response.data.image_id] = response.data.image;
                this.setState({cachedFiles, cachedFiles});
            } else {
                this.onMessage('danger', response.message);
            }
        });
    }

    updateCachedUser(userId) {
        this.updateUserData(userId)
        this.updateUserMessages(userId);
        this.updateProfilePicture(userId);
    }

    getCurrentPage() {
        let currentUserId = this.state.currentUserId;
        // Handle user not logged in or no history state present
        if (!currentUserId.length) {
            return (
                <LoginPage onMessage={this.onMessage}
                           onLogin={this.onLogin}/>
            );
        } else if (!this.state.domainsArray[0]) {
            <div className={'alert alert-warning'}>
                <strong>404: Page Not Found!</strong>
                <br/> No page matches location '{window.location.hash}'
            </div>
        }

        let userData = this.state.cachedUserData[currentUserId];
        if (!userData) {
            return (
                <div className={'alert alert-warning'}>
                    <strong>500: Internal error!</strong>
                    <br/> 'Not able to get user data.'
                </div>
            );
        }

        let b64ProfilePicture = this.state.cachedFiles[userData.profile_picture] || '';
        let userMessages = this.state.cachedUserMessages[currentUserId] || [];
        switch (this.state.domainsArray[0]) {
            case USER_PAGE:
                return (
                    <HomePage userId={currentUserId}
                              userData={userData}
                              b64ProfilePicture={b64ProfilePicture}
                              updateUserMessages={this.updateUserMessages}
                              userMessages={userMessages}
                              onMessage={this.onMessage}
                              cachedFiles={this.state.cachedFiles}/>
                );
            case BROWSE_PAGE:
                return (
                    <BrowsePage onMessage={this.onMessage}
                                cachedUserData={this.state.cachedUserData}
                                cachedUserMessages={this.state.cachedUserMessages}
                                cachedFiles={this.state.cachedFiles}
                                updateCachedUser={this.updateCachedUser}
                                updateUserMessages={this.updateUserMessages}
                                pushState={this.pushState}
                                domainsArray={this.state.domainsArray}/>
                );
            case ACCOUNT_PAGE:
                return (
                    <AccountPage onMessage={this.onMessage}
                                 b64ProfilePicture={b64ProfilePicture}
                                 updateCachedUser={this.updateCachedUser}
                                 userId={currentUserId}/>
                );
            case STATS_PAGE:
                return (
                    <StatsPage liveData={this.state.liveData}/>
                )
            case LOGOUT_PAGE:
                this.onLogout();
                break;
            default:
                return (
                    <div className={'alert alert-warning'}>
                        <strong>404: Page Not Found!</strong>
                        <br/> No page matches location '{window.location.hash}'
                    </div>
                );
        }
    }


    render() {
        return (
            <div className='container'>
                <Menu onClick={this.onClickTab}
                      currentUserId={this.state.currentUserId}
                      domainsArray={this.state.domainsArray}/>
                {this.getCurrentPage()}
                <Message onClick={this.clearMessages}
                         onMessage={this.onMessage}
                         messages={this.state.messages}/>
            </div>
        )
    }
}

const reactContentDiv = document.getElementById('react-content');

function forceLogOut(errorMessage) {
    console.error(errorMessage);
    // Removes the current client component and initializes a new one with an error message.
    ReactDOM.unmountComponentAtNode(reactContentDiv);
    ReactDOM.render(
        React.createElement(
            Client, {messages: [{type: 'danger', text: errorMessage}]}
        ),
        reactContentDiv
    );
}

function init() {
    ReactDOM.render(
        React.createElement(
            Client
        ),
        reactContentDiv
    );
}

init();

