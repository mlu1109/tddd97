class ChangePasswordForm extends React.Component {
    render() {
        return (
            <form onSubmit={this.props.onSubmit}>
                <RegularFormInput type='password' name='password' label='Password'
                                  value={this.props.password} onChange={this.props.onChange}/>
                <RegularFormInput type='password' name='newPassword' label='New Password'
                                  value={this.props.newPassword} onChange={this.props.onChange}/>
                <RegularFormInput type='password' name='reNewPassword' label='Re-new Password'
                                  value={this.props.reNewPassword} onChange={this.props.onChange}/>
                <input type='submit' value='Submit' className='btn btn-primary'/>
            </form>
        )
    }
}

class ChangePictureForm extends React.Component {
    render() {
        return (
            <form onSubmit={this.props.onSubmit}>
                <RegularFormInput type='file' name='file'
                                  value={this.props.fileProfilePicture} onChange={this.props.onChange}/>
                <input type='submit' value='Submit' className='btn btn-primary'/>
            </form>
        )
    }
}

class AccountPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            newPassword: '',
            reNewPassword: '',
            fileProfilePicture: undefined
        };
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onSubmitChangePassword = this.onSubmitChangePassword.bind(this);
        this.onChangeFileProfilePicture = this.onChangeFileProfilePicture.bind(this);
        this.onSubmitChangeProfilePicture = this.onSubmitChangeProfilePicture.bind(this);
    }

    onChangePassword(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    onSubmitChangePassword(event) {
        event.preventDefault();
        if (this.state.newPassword.length < 8) {
            this.props.onMessage('info', 'The new password needs to be atleast 8 characters long.')
            return false;
        }
        if (this.state.newPassword !== this.state.reNewPassword) {
            this.props.onMessage('info', 'The given passwords do not match.')
            return false;
        }
        server.request('POST', '/change_password', this.state, (response) => {
            if (response.success) {
                this.props.onMessage('success', response.message);
            } else {
                this.props.onMessage('danger', response.message);
            }
        })
    }

    onChangeFileProfilePicture(event) {
        this.setState({fileProfilePicture: event.target.value});
    }

    onSubmitChangeProfilePicture(event) {
        event.preventDefault();
        let file = event.target[0].files[0];
        let type = file.type.slice(0, file.type.indexOf('/'));
        if (type != 'image') {
            this.props.onMessage('danger', 'Not a valid image.')
            return;
        }

        fileToDataURI(file, (b64file) => {
            server.request('POST', '/upload_file',
                {data: encodeURIComponent(b64file), title: '--', description: '--'}, (response) => {
                    if (response.success) {
                        server.request('POST', '/set_profile_picture', {id: response.data.id}, (response) => {
                            if (response.success) {
                                this.props.onMessage('success', response.message);
                                this.props.updateCachedUser(this.props.userId);
                            } else {
                                this.props.onMessage('danger', response.message);
                            }
                        });
                    } else {
                        this.props.onMessage('danger', response.message);
                    }
                });
        });
    }

    render() {
        return (
            <div className='row'>
                <div className='row'>
                    <div className='col-xs-3'>
                        <img src={this.props.b64ProfilePicture}
                             className='img-thumbnail'/>
                    </div>
                    <div className='col-xs-9'>
                        <h4>Change profile picture</h4>
                        <ChangePictureForm onSubmit={this.onSubmitChangeProfilePicture}
                                           onChange={this.onChangeFileProfilePicture}/>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-xs-3'>

                    </div>
                    <div className='col-xs-9'>
                        <h4>Change profile picture</h4>
                        <ChangePasswordForm onSubmit={this.onSubmitChangePassword}
                                            onChange={this.onChangePassword}
                                            password={this.state.password}
                                            newPassword={this.state.newPassword}
                                            reNewPassword={this.state.reNewPassword}/>
                    </div>
                </div>
            </div>
        );
    }
}