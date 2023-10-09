<template>
	<div class="layout-wrapper" >
        <Toast position="top-center" />
        <div class="above-footer-wrapper">
            <Menubar :model="menu">
                <template #start>
                    <img alt="logo" src="@/assets/olog_logo_white.png" style="vertical-align: middle" height="30" class="mr-2">
                    <span class="logo">Olog</span>
                </template>
                <template #end>
                    <SplitButton v-if="userInfo && userInfo.userName" :label="userInfo.userName" class="p-button-sm" icon="pi pi-user" :model="buttonItems"></SplitButton>
                    <Button v-else label="Login" class="p-button-primary p-button-sm" style="width: 100px" @click="onLoginClick" />
                </template>
            </Menubar>

            <div style="overflow-x: hidden">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" :key="$route.fullPath" v-if="$route.meta.keepAlive"></component>
                    </keep-alive>
                    <component :is="Component" :key="$route.fullPath" v-if="!$route.meta.keepAlive"></component>
                </router-view>
            </div>
        </div>

        <div class="layout-footer" style="text-align: center">
            <span class="footer-text">{{ facility }}</span>
        </div>

        <Dialog id="login_dialog" v-model:visible="loginDialogDisplay" header="Login" :style="{ width: '100vw' }" :modal="true">
            <div class="field">
                <label>Username</label>
                <input type="text" v-model="username" class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full" autofocus @keyup.enter="login" >
            </div>
            <div class="field">
                <label>Password</label>
                <input type="password" v-model="password" class="text-base text-color surface-overlay p-2 border-1 border-solid surface-border border-round appearance-none outline-none focus:border-primary w-full" @keyup.enter="login" >
            </div>
            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="loginDialogDisplay = false" text />
                <Button label="OK" icon="pi pi-check" @click="login()" />
            </template>
        </Dialog>

        <Dialog header="User Info" v-model:visible="userInfoDialogDisplay" :style="{ width: '100vw' }" :modal="true">
            <div class="grid" v-if="currentUser && currentUser.userName">
                <div class="col-6">
                    <span style="font-weight: bold">username: </span>
                </div>
                <div class="col-6">
                    <span style="color: RGB(33, 150, 243)">{{ currentUser.userName }}</span>
                </div>
                <div class="col-6">
                    <span style="font-weight: bold">roles: </span>
                </div>
                <div class="col-6">
                    <div style="color: RGB(33, 150, 243)">
                        <span v-for="(role, index) of currentUser.roles" :key="index" style="margin-bottom: 10px">
                            <span v-if="index !== 0">, </span>
                            <span>{{ role }}</span>
                        </span>
                    </div>
                </div>
            </div>
            <div v-else style="orange">No user data found.</div>

            <template #footer>
                <Button label="Close" icon="pi pi-times" @click="userInfoDialogDisplay=false" class="p-button-text"/>
            </template>
        </Dialog>

        <Dialog header="Logout" v-model:visible="logoutDialogDisplay" :style="{ width: '100vw' }" :modal="true">
            <div>
                <i class="fa fa-exclamation-circle fa-2x" style="vertical-align: middle; color: orange"></i>
                <span class="p-text-center ml-2" style="vertical-align: middle">Are you sure you want to log out?</span>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" @click="logoutDialogDisplay=false" class="p-button-text"/>
                <Button label="OK" icon="pi pi-check" @click="logout" />
            </template>
        </Dialog>

        <Dialog header="Message" v-model:visible="sessionExpireDialogDisplay" :modal="true" :closable="false">
            <div style="color: orange; font-weight: bold">
                <i class="fa fa-exclamation-triangle" style="vertical-align: middle; color: orange"></i>
                <span class="text-center ml-2" style="vertical-align: middle">The session timed out and you are about to log out!</span>
            </div>

            <template #footer>
                <Button label="OK" icon="pi pi-check" @click="logout" />
            </template>
        </Dialog>
	</div>
</template>

<script>
import OlogService from '@/service/OlogService';
import config from './config/configuration.js';

export default {
    data() {
        return {
            intervalId: null,
			sessionExpireDialogDisplay: false,

            loginDialogDisplay: false,
            userInfoDialogDisplay: false,
            logoutDialogDisplay: false,

            username: '',
            password: '',

            currentUser: null,
            facility: config.facility,

			menu: [
                {
                   label:'Home',
                   icon:'pi pi-fw pi-home',
                   to: '/'
                },
                {
                   label:'Logbooks',
                   icon:'pi pi-fw pi-book',
                   to: '/logbooks'
                },
                {
                   label:'Tags',
                   icon:'pi pi-fw pi-tag',
                   to: '/tags'
                },
                {
                   label:'Properties',
                   icon:'pi pi-fw pi-list',
                   to: '/properties'
                },
                {
                   label:'About',
                   icon:'pi pi-fw pi-info-circle',
                   to: '/about'
                },
            ],

            buttonItems: [
                {
                    label: 'User info',
                    icon: 'pi pi-user',
                    command: () => {
                        this.onUserInfoClick();
                    }
                },
                {
                    label: 'Logout',
                    icon: 'pi pi-power-off',
                    command: () => {
                        this.onLogoutClick();
                    }
                },
            ]
        }
    },
    ologService: null,
    created() {
		this.ologService = new OlogService();
        this.checkSessionStatus();
		this.intervalId = setInterval(this.checkSessionStatus, 30000);  // Every 30 seconds
	},
    methods: {
        onLoginClick() {
            this.username = '';
            this.password = '';
            this.loginDialogDisplay = true;
        },
        onLogoutClick() {
            this.logoutDialogDisplay = true;
        },
        onUserInfoClick() {
            this.currentUser = null;
            this.ologService.currentUser()
			.then(data => {
				this.currentUser = data;
                this.userInfoDialogDisplay = true;
			}).catch(error => {
				if(error.response) {
					this.$toast.add({ severity: 'error', summary: 'Failed to load user data', detail: error.response.data.message });
				} else {
					this.$toast.add({ severity: 'error', summary: 'Failed to load user data', detail: error.message });
				}
			});
        },
        login() {
            if(!this.username) {
                this.$toast.add({ severity: 'error', summary: 'Login failed', detail: 'username is required' });
                return;
            }
            if(!this.password) {
                this.$toast.add({ severity: 'error', summary: 'Login failed', detail: 'password is required' });
                return;
            }

            let loader = this.$loading.show();
            this.$store.dispatch('authentication/login', { username: this.username, password: this.password })
            .then(() => {
                this.loginDialogDisplay = false;
                this.$toast.add({ severity: 'info', summary: 'Success', detail: 'Logged in', life: 5000 });
            })
            .catch((error) => {
                if(error.response && error.response.status === 401) {
                    this.$toast.add({ severity: 'error', summary: 'Login failed', detail: 'Username or password is incorrect.' });
                    return;
                }
                if(error.response) {
                    this.$toast.add({ severity: 'error', summary: 'Login failed', detail: error.response.data.message });
                } else {
                    this.$toast.add({ severity: 'error', summary: 'Login failed', detail: error.message });
                }
            }).finally(() => {
				loader.hide();
			});
        },
        logout() {
            this.$store.dispatch('authentication/logout')
            .then(() => {
                this.logoutDialogDisplay = false;
                this.sessionExpireDialogDisplay = false;
                this.$toast.add({ severity: 'info', summary: 'Success', detail: 'Logged out', life: 5000 });
            })
        },
        checkSessionStatus() {
            if(this.userInfo && this.userInfo.userName && !this.sessionExpireDialogDisplay) {
                this.ologService.currentUser()
                .then(() => {
                    // The session cookie is valid 
                }).catch(() => {
                    // The session cookie timed out
                    this.sessionExpireDialogDisplay = true;
                });
            }
        },
    },
    computed: {
        userInfo() {
            return this.$store.state.authentication.user;
        },
    },
	
}
</script>

<style lang="scss">
@import './App.scss';

.logo {
	vertical-align: middle; 
    color: RGB(255,255,255); 
	font-weight: bold; 
	font-size: 1.2em;
    margin-right: 10px;
}

#login_dialog .p-dialog-title {
    color: RGB(33, 150, 243);
}
</style>
