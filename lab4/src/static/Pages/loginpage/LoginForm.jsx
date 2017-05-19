class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: 'test@test.com',
            password: 'testtest'
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    onSubmit(event) {
        event.preventDefault();
        if (this.state.email.length === 0) {
            this.props.onMessage('info', 'Email can not be left empty.');
        } else if (this.state.password.length === 0) {
            this.props.onMessage('info', 'Password can not be left empty.');
        } else {
            this.props.onLogin(this.state)
        }
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <RegularFormInput type='text' name='email' label='Email'
                                  value={this.state.email} onChange={this.onChange}/>
                <RegularFormInput type='password' name='password' label='Password'
                                  value={this.state.password} onChange={this.onChange}/>
                <input type='submit' value='Submit' className='btn btn-primary'/>
            </form>
        );
    }
}