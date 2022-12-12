<script setup>
import ProjectForm from './ProjectForm.vue';
import TaskForm from './TaskForm.vue';
import { useRoute } from 'vue-router';

const props = defineProps({
    project: Object,
    task: Object,
    available_users: Array,
    available_projects: Array,
    priority_enum: Array,
    status_enum: Array,
    project_name: String,
    flashBanner: Object,
});
const emit = defineEmits(['closeModal', 'error']);
const form_type = useRoute().name;

function handleError(message) {
    emit('error', message);
}
</script>

<template>
    <div class="modal-container">
        <div class="modal">
            <div class="toolbar">
                <button class="modal-button" @click="$emit('closeModal')">
                    Close
                </button>
            </div>

            <div class="status" v-if="flashBanner">
                <p>{{ flashBanner.message }}</p>
            </div>
            <TaskForm
                v-if="task"
                v-bind:task="task"
                v-bind:available_users="available_users"
                v-bind:available_projects="available_projects"
                v-bind:status_enum="status_enum"
                v-bind:priority_enum="priority_enum"
                @closeModal="$emit('closeModal')"
                @error="handleError"
            ></TaskForm>
            <TaskForm
                v-else
                v-show="form_type === 'tasks'"
                v-bind:available_users="available_users"
                v-bind:available_projects="available_projects"
                v-bind:status_enum="status_enum"
                v-bind:priority_enum="priority_enum"
                @closeModal="$emit('closeModal')"
                @error="handleError"
            ></TaskForm>

            <ProjectForm
                v-if="project"
                v-bind:project="project"
                v-bind:available_users="available_users"
                @closeModal="$emit('closeModal')"
                @error="handleError"
            ></ProjectForm>
            <ProjectForm
                v-else
                v-show="form_type === 'projects'"
                v-bind:available_users="available_users"
                @closeModal="$emit('closeModal')"
                @error="handleError"
            ></ProjectForm>
        </div>
    </div>
</template>

<style>
.modal-container {
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    position: fixed;
    background-color: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(1px);
}

.modal {
    background-color: #fff;
    border: 1px solid #000;
    width: 700px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.modal-button {
    background: #2b2d42;
    border: 1px solid #000;
    color: #fff;
    border-radius: 50px;
    cursor: pointer;
    font-size: 14px;
    width: 22%;
    padding: 6px;
    margin: 20px 20px;
}
.modal-button:hover {
    background: #8d99ae;
    color: #111;
}

input[type='button'] {
    background: #2b2d42;
    border: 1px solid #000;
    color: #fff;
    border-radius: 50px;
    cursor: pointer;
    font-size: 14px;
    display: inline;
    width: 33%;
    margin-right: 10px;
}

input[type='button']:hover {
    background: #8d99ae;
    color: #111;
}

.toolbar {
    display: flex;
    flex: auto;
}

.modal p {
    font-size: 14px;
    color: rgb(5, 5, 5);
    cursor: pointer;
    text-align: center;
}
</style>
