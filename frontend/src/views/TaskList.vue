<script>
import Tile from '../components/Tile.vue';
import Modal from '../components/Modal.vue';

export default {
    name: 'TaskList',
    components: {
        Tile,
        Modal,
    },
    // we'll use the created hook to register for route changes from clicks on same page
    // (meaning no switches via router-link)
    async created() {
        this.$watch(
            () => this.$route.query,
            () => {
                // only open the model if there's a query
                if (this.$route.query.id) this.openModal();
            }
        );
    },
    data() {
        return {
            tasks: [],
            task: null,
            available_users: [],
            available_projects: [],
            isLoaded: false,
            showModal: false,
            status_enum: [],
            priority_enum: [],
            error_msg: null,
        };
    },
    methods: {
        async openModal() {
            // before opening the modal, check if we have valid data
            if (this.$route.query.id) {
                const taskId = this.$route.query.id;
                const taskRes = await fetch(
                    `http://localhost:3000/tasks/${taskId}`
                );
                const task = await taskRes.json();
                this.task = task;
            } else {
                this.task = null;
            }

            // load up the projects that are possible
            // fetch all projects anyway, once user exists modal, we'll need to show them
            const projectsRes = await fetch(`http://localhost:3000/projects`);
            const projects = await projectsRes.json();
            this.available_projects = projects;

            // we'll load users that can be added to this task
            const userRes = await fetch(`http://localhost:3000/users`);
            const users = await userRes.json();
            this.available_users = users;

            // load up the enums too
            const statusEnumRes = await fetch(
                `http://localhost:3000/tasks/enum_status`
            );
            const status_enum = await statusEnumRes.json();
            this.status_enum = status_enum;

            const priorityEnumRes = await fetch(
                `http://localhost:3000/tasks/enum_priority`
            );
            const priority_enum = await priorityEnumRes.json();
            this.priority_enum = priority_enum;

            this.showModal = true;
        },
        handleError(message) {
            this.error_msg = message;
        },
        async setData(tasks) {
            this.tasks = tasks;
            if (this.$route.query.id) await this.openModal();
            this.isLoaded = true;
        },
        async closeModal() {
            this.error_msg = null;
            this.$router.push('/tasks');
            this.showModal = false;

            // attempt to refetch, incase anything changed
            // fetch all tasks anyway, once user exists modal, we'll need to show them
            const tasksRes = await fetch(`http://localhost:3000/tasks`);
            const tasks = await tasksRes.json();
            this.tasks = tasks;
        },
    },
    // This deals with switches into this page, and checks query params
    // for ID that will need to be loaded in modal if user requested
    async beforeRouteEnter(to, from, next) {
        // fetch all tasks anyway, once user exists modal, we'll need to show them
        const tasksRes = await fetch(`http://localhost:3000/tasks`);
        const tasks = await tasksRes.json();

        next(function (vm) {
            // vm.showModal = true; for DEBUG
            // did the user get here from requesting a specific task?
            return vm.setData(tasks);
        });
    },

    // deal with the case where user routes away from tasks, but had
    // data boud to some properties, we'll just delete everything to be
    // save
    async beforeRouteLeave(to, from, next) {
        this.setData(null);
        next();
    },
};
</script>

<template>
    <Tile>
        <template #heading>List of Tasks</template>
        <p>
            Click a Task to view complete details or
            <button @click="openModal">Add New Task</button>
        </p>
    </Tile>
    <template v-show="isLoaded" v-for="task in tasks">
        <Tile v-bind:type="'tasks'" v-bind:link_id="task._id">
            <template #heading>{{ task.name }}</template>
            <p>{{ task.priority }}</p>
            <p>{{ task.status }}</p>
        </Tile>
    </template>

    <Modal
        v-if="showModal"
        v-bind:task="task"
        v-bind:available_users="available_users"
        v-bind:status_enum="status_enum"
        v-bind:priority_enum="priority_enum"
        v-bind:available_projects="available_projects"
        v-bind:flashBanner="error_msg"
        @closeModal="closeModal"
        @error="handleError"
    />
</template>

<style></style>
