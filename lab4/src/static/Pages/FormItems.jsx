class RegularFormInput extends React.Component {
    render() {
        return (
            <div className='form-group'>
                {this.props.label ?
                    <label htmlFor={'input' + this.props.name}>
                        {this.props.label}
                    </label> :
                    <label htmlFor={'input' + this.props.name } className='sr-only'/>
                }
                <input type={this.props.type}
                       name={this.props.name}
                       id={'input' + this.props.name}
                       className='form-control'
                       value={this.props.value}
                       onChange={this.props.onChange}/>
            </div>
        )
    }
}

class RegularFormSelect extends React.Component {
    render() {
        return (
            <div className='form-group'>
                <label htmlFor={'select' + this.props.name}>
                    {this.props.label}
                </label>
                <select name={this.props.name}
                        id={'select' + this.props.name}
                        className='form-control'
                        value={this.props.value}
                        onChange={this.props.onChange}>
                    {
                        this.props.values.map((str) => {
                            let pair = str.split('|');
                            let key = pair[0];
                            let value = pair[1];
                            return (
                                <option key={key.toLowerCase()}>
                                    {value}
                                </option>
                            );
                        })
                    }
                </select>
            </div>
        )
    }
}

class HorizontalSingleLabelessInputForm extends React.Component {
    render() {
        return (
            <form onSubmit={this.props.onSubmit} className='form-inline' style={this.props.style}>
                <label htmlFor={'input' + name} className='sr-only'/>
                <input type={this.props.type}
                       name='message'
                       id={'input' + this.props.name}
                       placeholder={this.props.label}
                       className='form-control'
                       value={this.props.value}
                       onChange={this.props.onChange}
                />
                <input type='submit'
                       value='Submit'
                       className='btn btn-primary'/>

            </form>
        )
    }
}