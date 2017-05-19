class UserInfoItem extends React.Component {
    render() {
        return (
            <li className='list-group-item'>
                <h4 className='list-group-item-heading'>{this.props.heading}</h4>
                <p className='list-group-item-text'>{this.props.text}</p>
            </li>
        )
    }
}

class UserInfo extends React.Component {
    render() {
        let userData = this.props.userData;
        const style = {
            margin: '0 auto'
        };
        return (
            <div className='list-group col'>
                <ul className='list-group'>
                    <li className='list-group-item'>
                        <img src={this.props.b64ProfilePicture}
                             className='img-responsive'
                             style={style}/>
                    </li>
                    <UserInfoItem heading='Email' text={userData.email}/>
                    <UserInfoItem heading='Name' text={userData.given_name + ' ' + userData.family_name}/>
                    <UserInfoItem heading='Location' text={userData.country + ', ' + userData.city}/>
                    <UserInfoItem heading='Gender' text={userData.gender}/>
                </ul>
            </div>
        )
    }
}

class HomePage extends React.Component {
    render() {
        return (
            <div className='row'>
                <div className='col-xs-4'>
                    <UserInfo userId={this.props.userId}
                              userData={this.props.userData}
                              b64ProfilePicture={this.props.b64ProfilePicture}
                              onMessage={this.props.onMessage}
                              liveData={this.props.liveData}/>
                </div>
                <div className='col-xs-8'>
                    <UserMessages userId={this.props.userId}
                                  userMessages={this.props.userMessages}
                                  updateUserMessages={this.props.updateUserMessages}
                                  onMessage={this.props.onMessage}
                                  cachedFiles={this.props.cachedFiles}/>
                </div>
            </div>
        );
    }
}
