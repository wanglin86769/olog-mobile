import {createRouter, createWebHistory} from 'vue-router';


const routes = [
	{
		path: '/',
		name: 'home',
		component: () => import('./components/Home.vue')
	},
	{
		path: '/logbook/:logbook',
		name: 'logbook',
		meta: { keepAlive: true }, // Enable component cache
		component: () => import('./components/Logbook.vue')
	},
	{
		path: '/logedit/:logbook/:log',
		name: 'logedit',
		component: () => import('./components/LogEdit.vue')
	},
	{
		path: '/logdetail/:logbook/:log',
		name: 'logdetail',
		component: () => import('./components/LogDetail.vue')
	},
	{
		path: '/logbooks',
		name: 'logbooks',
		component: () => import('./components/LogbookList.vue')
	},
	{
		path: '/tags',
		name: 'tags',
		component: () => import('./components/TagList.vue')
	},
	{
		path: '/properties',
		name: 'properties',
		component: () => import('./components/PropertyList.vue')
	},
	{
		path: '/about',
		name: 'about',
		component: () => import('./components/About.vue')
	},
    {
        path: "/:catchAll(.*)",
        name: 'notfound',
        component: () => import('./components/NotFound.vue')
    },
];

const router = createRouter({
	history: createWebHistory(process.env.BASE_URL),
    routes: routes
});


export default router;