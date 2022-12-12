<script>
import Tile from '../components/Tile.vue';

export default {
    name: 'TaskList',
    components: {
        Tile,
    },
    data() {
        return {
            tasks: [],
            isLoaded: false,
            showModal: false,
        };
    },
    methods: {
        openModal() {
            this.showModal = true;
        },
        setData(tasks) {
            this.tasks = tasks;
            this.isLoaded = true;
        },
        closeModal() {
            this.showModal = false;
        },
    },
    async beforeRouteEnter(to, from, next) {
        const taskRes = await fetch(`http://localhost:3000/tasks`);
        const tasks = await taskRes.json();

        next(function (vm) {
            return vm.setData(tasks);
        });
    },
};
</script>

<template>
    <Tile>
        <template #heading>List of Tasks</template>
        <p>
            Click a task to view details or
            <button>Add New Task</button>
        </p>
    </Tile>
    <template v-show="isLoaded" v-for="task in tasks">
        <Tile>
            <template #heading>{{ task.name }}</template>
            <p>{{ task.details }}</p>
            <button>Modify task</button>
        </Tile>
    </template>
</template>

<style></style>
