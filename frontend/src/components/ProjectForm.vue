<script>
export default {
    name: 'ProjectForm',
    props: {
        project: Object,
        available_users: Array,
    },
    data() {
        return {
            selected_manager: '',
            selected_users: [],
        };
    },
    methods: {
        // Did not complete creation of projects!!
        async addProject() {
            // create an object called data
            // spread the project data
            // the manager is stored in selected_manager and needs to be added
            // the users are stored in selected_users and needs to be added
            const data = {
                ...this.project,
                manager: this.selected_manager,
                users: this.selected_users,
            };

            // view this console.log in your browser
            console.log(JSON.stringify(data));
        },

        async updateProject() {
            // create a data object just like in addProject
            const data = {
                ...this.project,
                manager: this.selected_manager,
                users: this.selected_users,
            };

            // view this console.log in your browser
            console.log(JSON.stringify(data));
        },

        moveToTaskView(task_id = null, project_id = null) {
            this.$router.push(
                `/tasks?task_id=${task_id}&project_id=${project_id}`
            );
        },
    },
    async created() {
        if (this.project.id) {
            this.selected_manager = this.project.manager_id.id;
        }
    },
};
</script>

<template>
    <form>
        <div class="form-container">
            <div>
                <label>Project Name</label>
                <input v-model="project.name" type="text" name="name" />
            </div>
            <div>
                <label>Description</label>
                <textarea
                    v-model="project.description"
                    name="description"
                ></textarea>
            </div>
            <div>
                <label>Repo</label>
                <input v-model="project.repository" type="text" name="repo" />
            </div>
            <div>
                <label>Project Manager</label>
                <select v-model="selected_manager">
                    <option
                        v-for="user in available_users"
                        :value="user.manager_id"
                        :selected="selected_manager === user.id"
                    >
                        {{ user.first_name }} {{ user.last_name }}
                    </option>
                </select>
            </div>
            <div v-if="project.id && available_users">
                <label>
                    Users On Project (select additional users below, checkbox
                    indicates current users)</label
                >
                <select multiple v-model="selected_users">
                    <option v-for="user in available_users" :value="user.id">
                        <input
                            type="checkbox"
                            :checked="user.project_id === project.id"
                        />
                        {{ user.first_name }} {{ user.last_name }}
                    </option>
                </select>
            </div>
            <div v-if="project.id && project.tasks">
                <label>Tasks in Project (click task for details)</label>
                <select multiple>
                    <option
                        v-for="task in project.tasks"
                        @click="moveToTaskView(task._id, project.id)"
                    >
                        {{ task.name }}: {{ task.details }}
                    </option>
                    <option disabled @click="moveToTaskView(null, project.id)">
                        Add Task to this Project
                    </option>
                </select>
            </div>
            <div>
                <input
                    v-if="project.id"
                    type="button"
                    @click="updateProject"
                    value="Update"
                />
                <input v-else type="button" @click="addProject" value="Add" />
            </div>
        </div>
    </form>
</template>

<style>
.form-container {
    padding: 25px;
}

form {
    margin: 0px auto;
    width: 100%;
    height: auto;
    background: #fff;
}

form label {
    font-size: 14px;
    color: #888;
    cursor: pointer;
}

form input,
form textarea,
form select {
    margin: 10px 0;
    padding: 10px 10px;
    width: 95%;
    border: 1px solid #333;
    border-radius: 5px;
    display: block;
}

input[type='checkbox'] {
    height: 20px;
    width: 20px;
    accent-color: #000;
    display: inline;
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
</style>
