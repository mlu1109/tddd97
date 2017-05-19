// Source: https://gist.github.com/marijn/396531
const countries = ["AF|Afghanistan", "AL|Albania", "DZ|Algeria", "AS|American Samoa", "AD|Andorra", "AO|Angola", "AI|Anguilla", "AQ|Antarctica", "AG|Antigua And Barbuda", "AR|Argentina", "AM|Armenia", "AW|Aruba", "AU|Australia", "AT|Austria", "AZ|Azerbaijan", "BS|Bahamas", "BH|Bahrain", "BD|Bangladesh", "BB|Barbados", "BY|Belarus", "BE|Belgium", "BZ|Belize", "BJ|Benin", "BM|Bermuda", "BT|Bhutan", "BO|Bolivia", "BA|Bosnia And Herzegovina", "BW|Botswana", "BV|Bouvet Island", "BR|Brazil", "IO|British Indian Ocean Territory", "BN|Brunei Darussalam", "BG|Bulgaria", "BF|Burkina Faso", "BI|Burundi", "KH|Cambodia", "CM|Cameroon", "CA|Canada", "CV|Cape Verde", "KY|Cayman Islands", "CF|Central African Republic", "TD|Chad", "CL|Chile", "CN|China", "CX|Christmas Island", "CC|Cocos (keeling) Islands", "CO|Colombia", "KM|Comoros", "CG|Congo", "CD|Congo, The Democratic Republic Of The", "CK|Cook Islands", "CR|Costa Rica", "CI|Cote D'ivoire", "HR|Croatia", "CU|Cuba", "CY|Cyprus", "CZ|Czech Republic", "DK|Denmark", "DJ|Djibouti", "DM|Dominica", "DO|Dominican Republic", "TP|East Timor", "EC|Ecuador", "EG|Egypt", "SV|El Salvador", "GQ|Equatorial Guinea", "ER|Eritrea", "EE|Estonia", "ET|Ethiopia", "FK|Falkland Islands (malvinas)", "FO|Faroe Islands", "FJ|Fiji", "FI|Finland", "FR|France", "GF|French Guiana", "PF|French Polynesia", "TF|French Southern Territories", "GA|Gabon", "GM|Gambia", "GE|Georgia", "DE|Germany", "GH|Ghana", "GI|Gibraltar", "GR|Greece", "GL|Greenland", "GD|Grenada", "GP|Guadeloupe", "GU|Guam", "GT|Guatemala", "GN|Guinea", "GW|Guinea-bissau", "GY|Guyana", "HT|Haiti", "HM|Heard Island And Mcdonald Islands", "VA|Holy See (vatican City State)", "HN|Honduras", "HK|Hong Kong", "HU|Hungary", "IS|Iceland", "IN|India", "ID|Indonesia", "IR|Iran, Islamic Republic Of", "IQ|Iraq", "IE|Ireland", "IL|Israel", "IT|Italy", "JM|Jamaica", "JP|Japan", "JO|Jordan", "KZ|Kazakstan", "KE|Kenya", "KI|Kiribati", "KP|Korea, Democratic People's Republic Of", "KR|Korea, Republic Of", "KV|Kosovo", "KW|Kuwait", "KG|Kyrgyzstan", "LA|Lao People's Democratic Republic", "LV|Latvia", "LB|Lebanon", "LS|Lesotho", "LR|Liberia", "LY|Libyan Arab Jamahiriya", "LI|Liechtenstein", "LT|Lithuania", "LU|Luxembourg", "MO|Macau", "MK|Macedonia, The Former Yugoslav Republic Of", "MG|Madagascar", "MW|Malawi", "MY|Malaysia", "MV|Maldives", "ML|Mali", "MT|Malta", "MH|Marshall Islands", "MQ|Martinique", "MR|Mauritania", "MU|Mauritius", "YT|Mayotte", "MX|Mexico", "FM|Micronesia, Federated States Of", "MD|Moldova, Republic Of", "MC|Monaco", "MN|Mongolia", "MS|Montserrat", "ME|Montenegro", "MA|Morocco", "MZ|Mozambique", "MM|Myanmar", "NA|Namibia", "NR|Nauru", "NP|Nepal", "NL|Netherlands", "AN|Netherlands Antilles", "NC|New Caledonia", "NZ|New Zealand", "NI|Nicaragua", "NE|Niger", "NG|Nigeria", "NU|Niue", "NF|Norfolk Island", "MP|Northern Mariana Islands", "NO|Norway", "OM|Oman", "PK|Pakistan", "PW|Palau", "PS|Palestinian Territory, Occupied", "PA|Panama", "PG|Papua New Guinea", "PY|Paraguay", "PE|Peru", "PH|Philippines", "PN|Pitcairn", "PL|Poland", "PT|Portugal", "PR|Puerto Rico", "QA|Qatar", "RE|Reunion", "RO|Romania", "RU|Russian Federation", "RW|Rwanda", "SH|Saint Helena", "KN|Saint Kitts And Nevis", "LC|Saint Lucia", "PM|Saint Pierre And Miquelon", "VC|Saint Vincent And The Grenadines", "WS|Samoa", "SM|San Marino", "ST|Sao Tome And Principe", "SA|Saudi Arabia", "SN|Senegal", "RS|Serbia", "SC|Seychelles", "SL|Sierra Leone", "SG|Singapore", "SK|Slovakia", "SI|Slovenia", "SB|Solomon Islands", "SO|Somalia", "ZA|South Africa", "GS|South Georgia And The South Sandwich Islands", "ES|Spain", "LK|Sri Lanka", "SD|Sudan", "SR|Suriname", "SJ|Svalbard And Jan Mayen", "SZ|Swaziland", "SE|Sweden", "CH|Switzerland", "SY|Syrian Arab Republic", "TW|Taiwan, Province Of China", "TJ|Tajikistan", "TZ|Tanzania, United Republic Of", "TH|Thailand", "TG|Togo", "TK|Tokelau", "TO|Tonga", "TT|Trinidad And Tobago", "TN|Tunisia", "TR|Turkey", "TM|Turkmenistan", "TC|Turks And Caicos Islands", "TV|Tuvalu", "UG|Uganda", "UA|Ukraine", "AE|United Arab Emirates", "GB|United Kingdom", "US|United States", "UM|United States Minor Outlying Islands", "UY|Uruguay", "UZ|Uzbekistan", "VU|Vanuatu", "VE|Venezuela", "VN|Viet Nam", "VG|Virgin Islands, British", "VI|Virgin Islands, U.s.", "WF|Wallis And Futuna", "EH|Western Sahara", "YE|Yemen", "ZM|Zambia", "ZW|Zimbabwe"];


class RegisterForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'email': 'test@test.com',
            'password': 'testtest',
            'rePassword': 'testtest',
            'givenName': 'test',
            'familyName': 'test',
            'gender': 'Female',
            'city': 'test',
            'country': 'Afghanistan'
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
        const values = this.state;
        const keyToString = {
            'email': 'Email', 'password': 'Password', 'rePassword': 'Repeat password', 'givenName': 'Given name',
            'familyName': 'Family name', 'gender': 'Gender', 'city': 'City', 'country': 'Country'
        };
        // Verify form data
        for (let key in values) {
            if (!values.hasOwnProperty(key))
                continue;

            if (values[key].length === 0) {
                this.props.onMessage('info', keyToString[key] + ' can not be left empty.');
                return false;
            }
        }

        let atPos = values.email.indexOf('@');
        let dotPos = values.email.lastIndexOf('.');
        if (atPos < 1 || dotPos < atPos + 2 || dotPos + 2 >= values.email.length) {
            this.props.onMessage('info', 'Invalid email address');
            return false;
        }

        if (values.password.length < 8) {
            this.props.onMessage('info', 'Password needs to be at least 8 characters long.');
            return false;
        } else if (values.password !== values.rePassword) {
            this.props.onMessage('info', 'Password does not match the confirm password.');
            return false;
        }
        // Form data verified
        server.request('POST', '/register', this.state, (response) => {
            if (response.success) {
                this.props.onMessage('success', response.message);
                // TODO: Log in
            } else {
                this.props.onMessage('info', response.message);
            }
        });
    }

    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <RegularFormInput type='text' name='email' label='Email'
                                  value={this.state.email} onChange={this.onChange}/>
                <RegularFormInput type='password' name='password' label='Password'
                                  value={this.state.password} onChange={this.onChange}/>
                <RegularFormInput type='password' name='rePassword' label='Re-password'
                                  value={this.state.rePassword} onChange={this.onChange}/>
                <RegularFormInput type='text' name='givenName' label='Given name'
                                  value={this.state.givenName} onChange={this.onChange}/>
                <RegularFormInput type='text' name='familyName' label='Family name'
                                  value={this.state.familyName} onChange={this.onChange}/>
                <RegularFormSelect name='gender' label='Gender' values={['F|Female', 'M|Male']}
                                   value={this.state.gender} onChange={this.onChange}/>
                <RegularFormInput type='text' name='city' label='City'
                                  value={this.state.city} onChange={this.onChange}/>
                <RegularFormSelect name='country' label='Country' values={countries}
                                   value={this.state.country} onChange={this.onChange}/>
                <input type='submit' value='Submit' className='btn btn-primary'/>
            </form>
        )
    }
}