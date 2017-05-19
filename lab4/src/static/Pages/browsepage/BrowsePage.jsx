class BrowsePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            existingUser: false,
            userIdInput: '',
            userId: ''
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.getUserPage = this.getUserPage.bind(this);
        this.updateExistingUser = this.updateExistingUser.bind(this);
        this.handleDomain = this.handleDomain.bind(this);
    }

    componentDidMount() {
        if (this.props.domainsArray) {
            this.handleDomain(this.props.domainsArray)
        }
    }

    handleDomain(domainsArray) {
        if (domainsArray[1] && domainsArray[1] !== this.state.userId) {
            this.setState({userId: domainsArray[1], existingUser: false});
            this.updateExistingUser(domainsArray[1]);
        } else if (!domainsArray[1]) {
            this.setState({userId: '', existingUser: false});
        }
    }

    onSubmit(event) {
        event.preventDefault();
        let userId = this.state.userIdInput;
        this.props.pushState([BROWSE_PAGE, userId]);
        this.setState({userId: userId, existingUser: false});
        this.updateExistingUser(userId);
    }

    updateExistingUser(userId) {
        server.request('POST', '/existing_user', {id: userId}, (response) => {
            if (response.success) {
                if (response.data) {
                    this.props.updateCachedUser(userId);
                    this.setState({existingUser: true});
                } else {
                    this.setState({existingUser: false});
                    this.props.onMessage('info', response.message);
                }
            } else {
                this.props.onMessage('danger', response.message);
            }
        });
    }

    onChange(event) {
        this.setState({userIdInput: event.target.value});
    }

    getUserPage() {
        if (!this.state.existingUser) {
            return (
                <div className={'info alert-warning'}>

                </div>
            );
        }

        let userId = this.state.userId;
        let userData = this.props.cachedUserData[userId];
        if (!userData) {
            return '';
        }
        let b64ProfilePicture = this.props.cachedFiles[userData.profile_picture];
        let userMessages = this.props.cachedUserMessages[userId];

        return (
            <HomePage userId={userId}
                      userData={userData}
                      b64ProfilePicture={b64ProfilePicture}
                      updateUserMessages={this.props.updateUserMessages}
                      userMessages={userMessages}
                      onMessage={this.props.onMessage}
                      cachedFiles={this.props.cachedFiles}/>
        );
    }

    render() {
        const style = {
            marginBottom: '20px'
        };
        return (
            <div>
                <div className='row'>
                    <div className='col-xs-12'>
                        <HorizontalSingleLabelessInputForm
                            type='text' label='Enter user email' onSubmit={this.onSubmit}
                            onChange={this.onChange} name='userIdInput' value={this.state.userIdInput}
                            style={style}/>
                    </div>
                    {this.getUserPage()}
                </div>
            </div>
        );
    }
}