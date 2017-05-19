class LoginPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='row'>
                <div className='col-xs-6'>
                    <h4>Login</h4>
                    <LoginForm onMessage={this.props.onMessage}
                               onLogin={this.props.onLogin}/>
                    <LoginGoogle/>
                </div>
                <div className='col-xs-6'>
                    <h4>Register</h4>
                    <RegisterForm onMessage={this.props.onMessage}
                                  onLogin={this.props.onLogin}/>
                </div>
            </div>
        );
    }
}