<script>
import Tile from '../components/Tile.vue';
import Modal from '../components/Modal.vue';

export default {
    name: 'ProjectList',
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
                if (this.$route.query.id) this.setModal(this.$route.query.id);
            }
        );
    },
    data() {
        return {
            projects: [],
            project: null,
            available_users: [],
            isLoaded: false,
            idModal: null,
            showModal: false,
        };
    },
    methods: {
        async openModal() {
            // before opening the modal, check if we have valid data
            if (this.idModal) {
                const projectId = this.idModal;
                const projectRes = await fetch(
                    `http://localhost:3000/projects/${projectId}`
                );
                const project = await projectRes.json();
                this.project = project;

                // we'll load users that can be added to this project
                const userRes = await fetch(`http://localhost:3000/users`);
                const users = await userRes.json();
                this.available_users = users;
            }
            // else this means we should have an empty form for the user
            else {
                this.project = null;
            }
            this.showModal = true;
        },
        async setModal(id) {
            this.idModal = id;
            await this.openModal();
        },
        async setData(projects, modalId = null) {
            this.projects = projects;
            if (modalId) await this.setModal(modalId);
            this.isLoaded = true;
        },
        closeModal() {
            this.$router.push('/projects');
            this.showModal = false;
        },
    },
    // This deals with switches into this page, and checks query params
    // for ID that will need to be loaded in modal if user requested
    async beforeRouteEnter(to, from, next) {
        // fetch all projects anyway, once user exists modal, we'll need to show them
        const projectsRes = await fetch(`http://localhost:3000/projects`);
        const projects = await projectsRes.json();

        next(function (vm) {
            // vm.showModal = true; for DEBUG
            // did the user get here from requesting a specific project?
            return vm.setData(projects, to.query.id);
        });
    },
};
</script>

<template>
    <Tile>
        <template #heading>List of Projects</template>
        <p>
            Click a project to view details or
            <button disabled @click="setModal(null)">
                Add New Project (didn't finish this)
            </button>
        </p>
    </Tile>
    <template v-show="isLoaded" v-for="project in projects">
        <Tile v-bind:type="'projects'" v-bind:link_id="project.id">
            <template #heading>{{ project.name }}</template>
            <p>{{ project.description }}</p>
            <p>{{ project.repository }}</p>
            <p>
                managed by {{ project.manager_id.first_name }}
                {{ project.manager_id.last_name }}
            </p>
        </Tile>
    </template>

    <Modal
        v-if="showModal"
        v-bind:project="project"
        v-bind:available_users="available_users"
        @closeModal="closeModal"
    />
</template>

<style></style>
