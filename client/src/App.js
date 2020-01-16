import React, {Component} from 'react';
import AuthService from './AuthService';
import Login from "./Login";
import './css/App.css';
import Cookies from 'js-cookie';

class App extends Component {
    API_URL = process.env.REACT_APP_API_URL;

    constructor(props) {
        super(props);
        this.Auth = new AuthService(`${this.API_URL}/users/authenticate`);
        this.state = {
            kittens: [],      // Data from API
            loginStatus: "",  // Message for the user when not logged in
            loginType: "",    // Type of login used
            displayName: ""     // Display name from social media
        };
    }

    componentDidMount() {
        this.getData();
        this.handleSocialLogin();
    }

    handleSocialLogin() {
        // The cookie is set by the express server after social login (facebook, google)
        const cookie = Cookies.get('value');
        if (cookie) {
            const data = JSON.parse(cookie);
            this.Auth.setToken(data.token);
            this.Auth.setUsername(data.email);
            this.setState({
                loginType: data.loginType,
                displayName: data.username
            })
        }
        // Remove the cookie now that we have the info stored in localStorage.
        Cookies.remove('value');

        // Get data
        this.getData();
    }

    async login(username, password) {
        try {
            const resp = await this.Auth.login(username, password);
            console.log("Authentication for", resp.username);
            this.setState({
                loginType: "username / password",
                displayName: username
            });
            this.getData();
        } catch (e) {
            console.log("Login", e);
        }
    }

    async logout(event) {
        event.preventDefault();
        this.Auth.logout();
        await this.setState({
            kittens: [],
            loginStatus: "You need to login!",
            loginType: ""
        });
    }

    async getData() {
        const resp = await this.Auth.fetch(`${this.API_URL}/kittens`);
        if (resp.status === 401) {
            this.setState({
                loginStatus: "You need to login!"
            })
        } else {
            const data = await resp.json();
            this.setState({
                kittens: data,
                loginStatus: ""
            });
        }
    }

    render() {
        let contents = <p>No kittens to display!</p>;
        if (this.state.kittens.length > 0) {
            contents = <ol>
                {this.state.kittens.map(kitten => <li key={kitten.id}>{kitten.name}</li>)}
            </ol>;
        }

        return (
            <div className="container">
                {this.Auth.getUsername() ?
                    <small>
                        <ul>
                            <li>Logged in!</li>
                            <li>From: {this.state.loginType}</li>
                            <li>Email: {this.Auth.getUsername()}</li>
                            <li>Display name: {this.state.displayName}</li>
                        </ul>
                        <button onClick={(event) => {this.logout(event)}}>Logout.</button>
                    </small>
                    : <Login login={(username, password) => this.login(username, password)}/>}

                <h1>Kittens</h1>

                <p className="alert">{this.state.loginStatus}</p>

                {contents}
            </div>
        );
    }
}

export default App;
