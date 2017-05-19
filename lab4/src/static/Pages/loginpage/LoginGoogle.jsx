class LoginGoogle extends React.Component {
    constructor(props) {
        super(props);
        this.onSignIn = this.onSignIn.bind(this);
    }

    onSignIn() {
        server.request('POST', '/oauth_google_url', null, (response) => {
            if (response.success) {
                window.location.href = response.data;
            } else {
                this.props.onMessage('info', response.message);
            }
        });
    }

    render() {
        let style = {
            marginTop: '10px'
        };
        return (
                <button type='button'
                        onClick={this.onSignIn}
                        className='btn btn-danger'
                        style={style}>
                    Login with Google
                </button>
        );
    }
}