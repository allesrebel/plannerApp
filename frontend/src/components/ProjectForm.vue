<script>
export default {
    name: 'ProjectForm',
    props: {
        project: Object,
        available_users: Array,
    },
    data() {
        return {
            project_copy: {},
            selected_manager: null,
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
                ...this.project_copy,
                manager_id: this.selected_manager,
                users_id: this.selected_users,
            };

            // view this console.log in your browser
            console.log(JSON.stringify(data));

            // attempt to create this task!
            // load up the projects that are possible
            const createTaskRes = await fetch(
                `http://localhost:3000/projects`,
                {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }
            );
            if (createTaskRes.status != 200)
                this.$emit('error', await createTaskRes.json());
            // if successful, emit a modalClose event, else inform user
            // via emit error
            else this.$emit('closeModal');
        },

        async updateProject() {
            // create a data object just like in addProject
            const data = {
                ...this.project_copy,
                manager_id: this.selected_manager,
                users_id: this.selected_users,
            };

            // remove some undeeded fields (not needed for API)
            delete data._id;
            delete data.__v;
            delete data.users_id;

            // check if any of the fields match already (and remove)
            for (let [key, value] of Object.entries(data)) {
                if (value === this.project[key]) delete data[key];
            }

            // view this console.log in your browser
            console.log(JSON.stringify(data));

            // attempt to create this task!
            // load up the projects that are possible
            const createTaskRes = await fetch(
                `http://localhost:3000/projects/${this.project.id}`,
                {
                    method: 'put',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                }
            );
            if (createTaskRes.status != 200)
                this.$emit('error', await createTaskRes.json());
            // if successful, emit a modalClose event, else inform user
            // via emit error
            else this.$emit('closeModal');
        },

        moveToTaskView(task_id = null, project_id = null) {
            this.$router.push(
                `/tasks?id=${task_id}&project_id=${project_id}` // was going to do filters too, ran out of time
            );
        },
    },
    async created() {
        if (this.project && this.project.id) {
            this.selected_manager = this.project.manager_id.id;
            this.project_copy = { ...this.project };
        } else {
            this.project_copy = {
                name: null,
                description: null,
                repository: null,
                manager_id: null,
            };
        }
    },
};
</script>

<template>
    <form>
        <div class="form-container">
            <div>
                <label>Project Name</label>
                <input v-model="project_copy.name" type="text" name="name" />
            </div>
            <div>
                <label>Description</label>
                <textarea
                    v-model="project_copy.description"
                    name="description"
                ></textarea>
            </div>
            <div>
                <label>Repo</label>
                <input
                    v-model="project_copy.repository"
                    type="text"
                    name="repo"
                />
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
            <div v-if="project_copy.id && available_users">
                <label>
                    Users On Project (box indicates current users have
                    tasks)</label
                >
                <select multiple v-model="selected_users">
                    <option v-for="user in available_users" :value="user.id">
                        <input
                            type="checkbox"
                            :checked="user.project_id === project_copy.id"
                        />
                        {{ user.first_name }} {{ user.last_name }}
                    </option>
                </select>
            </div>
            <div v-if="project_copy.id && project_copy.tasks">
                <label>Tasks in Project (click task for details)</label>
                <select multiple>
                    <option
                        v-for="task in project_copy.tasks"
                        @dblclick="moveToTaskView(task._id, project.id)"
                    >
                        {{ task.name }}: {{ task.details }}
                    </option>
                    <option @dblclick="moveToTaskView(null, project.id)">
                        Add Task to this Project (via tasks UI)
                    </option>
                </select>
            </div>
            <div>
                <input
                    v-if="project_copy.id"
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
