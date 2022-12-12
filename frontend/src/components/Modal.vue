<script setup>
import ProjectForm from './ProjectForm.vue';
const props = defineProps({
    project: Object,
    task: Object,
    available_users: Array,
    priorities: Array,
    statuses: Array,
    project_name: String,
});
const emit = defineEmits(['closeModal']);
</script>

<template>
    <div class="modal-container">
        <div class="modal">
            <div class="toolbar">
                <button class="modal-button" v-if="project || task">
                    Modify
                </button>
                <button class="modal-button" @click="$emit('closeModal')">
                    Close
                </button>
            </div>

            <!-- <p>{{ project }}</p> -->

            <ProjectForm
                v-if="project"
                v-bind:project="project"
                v-bind:available_users="available_users"
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
    display: block;
    width: 33%;
    padding: 2px;
    margin: 20px auto;
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
