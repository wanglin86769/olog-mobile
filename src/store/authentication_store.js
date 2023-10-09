import Cookies from 'js-cookie';
import AuthenticationService from '@/service/AuthenticationService';
import config from "@/config/configuration.js";

const authenticationService = new AuthenticationService();

let userDataString = Cookies.get(config.cookieUserData);
const user = userDataString ? JSON.parse(userDataString) : null;
const initialState = { user: user };

export const authentication = {
    namespaced: true,
    state: initialState,
    actions: {
        login({ commit }, { username, password }) {
            return authenticationService.login(username, password)
                .then(
                    result => {
                        // console.log('Login success');
                        commit('loginSuccess', result);
                        Promise.resolve(result);
                    })
                .catch(
                    error => {
                        // console.log('Login error');
                        commit('loginFailure', error);
                        return Promise.reject(error);
                    }
                );
        },

        logout({ commit }) {
            authenticationService.logout();
            commit('logout');
            Promise.resolve();
        }
    },
    mutations: {
        loginSuccess(state, result) {
            state.user = result;
        },
        loginFailure(state) {
            state.user = null;
        },
        logout(state) {
            state.user = null;
        }
    }
}
