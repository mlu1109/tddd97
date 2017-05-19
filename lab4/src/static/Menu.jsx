const nav = ReactBootstrap.nav;

class MenuItem extends React.Component {
    render() {
        if (this.props.domainsArray && this.props.domainsArray[0] === this.props.id) {
            return (
                <li role='presentation' className='active'>
                    <a id={this.props.id} onClick={this.props.onClick}>
                        {this.props.label}
                    </a>
                </li>
            );
        } else {
            return (
                <li role='presentation'>
                    <a id={this.props.id} onClick={this.props.onClick}>
                        {this.props.label}
                    </a>
                </li>
            );
        }
    }
}

class Menu extends React.Component {
    render() {
        return (
            <nav className='navbar navbar-inverse navbar-top'>
                <div className='container'>
                    <ul className='nav navbar-nav'>
                        <MenuItem onClick={this.props.onClick} id={USER_PAGE} label={'Home'}
                                  domainsArray={this.props.domainsArray}/>
                        <MenuItem onClick={this.props.onClick} id={BROWSE_PAGE} label={'Browse'}
                                  domainsArray={this.props.domainsArray}/>
                        <MenuItem onClick={this.props.onClick} id={ACCOUNT_PAGE} label={'Account'}
                                  domainsArray={this.props.domainsArray}/>
                        <MenuItem onClick={this.props.onClick} id={STATS_PAGE} label={'Stats'}
                                  domainsArray={this.props.domainsArray}/>
                        <MenuItem onClick={this.props.onClick} id={LOGOUT_PAGE} label={'Logout'}
                                  domainsArray={this.props.domainsArray}/>
                    </ul>
                </div>
            </nav>
        );
    }
}