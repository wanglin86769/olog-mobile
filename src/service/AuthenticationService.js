import axios from 'axios';
import Cookies from 'js-cookie';
import config from '../config/configuration.js';

export default class AuthenticationService {

    login(username, password) {
        let uri = `${config.serverPath}/Olog/login`;
        const loginFormData = new FormData();
        loginFormData.append("username", username)
        loginFormData.append("password", password)

        return axios.post(uri, loginFormData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
            withCredentials : true  // Enable cookie
		}).then((response) => {
            let userData = response.data;
            if(userData && userData.userName) {
                Cookies.set(config.cookieUserData, JSON.stringify(userData));
            }
            return userData;
        }).catch ((error) => {
            return Promise.reject(error);
        });
    }

    logout() {
        let uri = `${config.serverPath}/Olog/logout`;
        return axios.get(uri, {
            withCredentials : true  // Enable cookie
		})
        .then((response) => {
            Cookies.remove(config.cookieUserData);
            return response;
        }).catch ((error) => {
            return Promise.reject(error);
        });
    }

}

