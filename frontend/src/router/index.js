import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '../views/Landing.vue';
import ProjectList from '../views/ProjectList.vue';
import TaskList from '../views/TaskList.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', name: '', component: LandingPage },
        {
            path: '/projects',
            name: 'projects',
            component: ProjectList,
        },
        {
            path: '/tasks',
            name: 'tasks',
            component: TaskList,
        },
    ],
});

export default router;
