import React, {Component} from 'react';
import facebookButton from './img/continue_with_facebook.png';
import googleButton from './img/btn_google_signin_dark_normal_web.png';
import twitchLogo from './img/twitch_logo.png';

export default class Login extends Component {
    API_URL = process.env.REACT_APP_API_URL;

    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: ""
        }
    }

    handleChange(event) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    handleLogin() {
        this.props.login(this.state.username, this.state.password);
    }

    render() {
        return (
            <>
                <h3>Login with your username / password:</h3>
                <input onChange={event => this.handleChange(event)} type="text" name="username" placeholder="email"/>
                <input onChange={event => this.handleChange(event)} type="text" name="password" placeholder="password"/>
                <button onClick={_ => this.handleLogin()}>Login</button>
                <br/>

                <h3>Login with your social media profile of choice:</h3>
                <a href={`${this.API_URL}/users/authenticate/facebook`}>
                <img src={facebookButton} alt="Continue with Facebook" style={{width: '200px', marginTop: '0.2em'}}/>
                </a>

                <a href={`${this.API_URL}/users/authenticate/google`}>
                    <img src={googleButton} alt="Login with Google" style={{marginTop: '0.2em'}}/>
                </a>

                <a href={`${this.API_URL}/users/authenticate/twitch`}>
                    <img src={twitchLogo} alt="Login with Twitch" style={{marginTop: '0.2em'}}/>
                </a>
            </>
        )
    };
}