<script>
export default {
    name: 'TaskForm',
    props: {
        task: Object,
        available_users: Array,
        available_projects: Array,
        status_enum: Array,
        priority_enum: Array,
    },
    data() {
        return {
            task_copy: '',
            assigned_user: '',
            assigned_project: '',
        };
    },
    methods: {
        async addTask() {
            // create an object called data
            // spread the task data
            // the user is stored in assigned_user and needs to be added
            // the project are stored in assigned_project and needs to be added
            const data = {
                ...this.task_copy,
                user_id: this.assigned_user,
                project_id: this.assigned_project,
            };

            // view this console.log in your browser
            console.log(JSON.stringify(data));

            // attempt to create this task!
            // load up the projects that are possible
            const createTaskRes = await fetch(`http://localhost:3000/tasks`, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (createTaskRes.status != 200)
                this.$emit('error', await createTaskRes.json());
            // if successful, emit a modalClose event, else inform user
            // via emit error
            else this.$emit('closeModal');
        },

        async updateTask() {
            // create a data object just like in addTask
            const data = {
                ...this.task_copy,
                user_id: this.assigned_user._id,
                project_id: this.assigned_project._id,
            };

            // strip out unneeded fields (for api)
            delete data._id;
            delete data.__v;
            delete data.timeline._id;

            // check if any of the fields match already (and remove)
            for (let [key, value] of Object.entries(data)) {
                if (value === this.task[key]) delete data[key];
            }

            // view this console.log in your browser
            console.log(JSON.stringify(data));

            // attempt to create this task!
            // load up the projects that are possible
            const createTaskRes = await fetch(
                `http://localhost:3000/tasks/${this.task._id}`,
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

        async deleteTask() {
            // attempt to create this task!
            // load up the projects that are possible
            const createTaskRes = await fetch(
                `http://localhost:3000/tasks/${this.task._id}`,
                {
                    method: 'delete',
                }
            );
            if (createTaskRes.status != 200)
                this.$emit('error', await createTaskRes.json());
            // if successful, emit a modalClose event, else inform user
            // via emit error
            else this.$emit('closeModal');
        },
    },
    moveToProjectView(id = null) {
        this.$router.push(
            `/projects?id=${id}` //&project_id=${project_id}` was going to do filters too
        );
    },
    created() {
        if (this.task && this.task._id) {
            this.task_copy = { ...this.task };
            this.assigned_user = this.task_copy.user_id._id;
            this.assigned_project = this.task_copy.project_id._id;
        } else {
            // graph the URL param if one exists
            if (this.$route.query.project_id)
                this.assigned_project = this.$route.query.project_id;

            const date = Date.now();

            this.task_copy = {
                name: '',
                details: '',
                status: '',
                priority: '',
                timeline: {
                    date_due: Date(date).toLocaleString(),
                    date_assigned: Date(date).toLocaleString(),
                },
            };
        }
    },
};
</script>

<template>
    <form>
        <div class="form-container">
            <div>
                <label>Task Name</label>
                <input v-model="task_copy.name" type="text" name="name" />
            </div>
            <div>
                <label>Details</label>
                <textarea v-model="task_copy.details" name="details"></textarea>
            </div>
            <div>
                <label>Status</label>
                <select v-model="task_copy.status">
                    <option
                        v-for="status in status_enum"
                        :value="status"
                        :selected="status === task_copy.status"
                    >
                        {{ status }}
                    </option>
                </select>
            </div>
            <div>
                <label>Priority</label>
                <select v-model="task_copy.priority">
                    <option
                        v-for="priority in priority_enum"
                        :value="priority"
                        :selected="priority === task_copy.priority"
                    >
                        {{ priority }}
                    </option>
                </select>
            </div>
            <div>
                <label>Assignee</label>
                <select v-model="assigned_user">
                    <option
                        v-for="user in available_users"
                        :value="user._id"
                        :selected="assigned_user === user._id"
                    >
                        {{ user.first_name }} {{ user.last_name }}
                    </option>
                </select>
            </div>
            <div>
                <label>Project</label>
                <select v-model="assigned_project">
                    <option
                        v-for="project in available_projects"
                        :value="project._id"
                        :selected="assigned_project === project._id"
                    >
                        {{ project.name }}
                    </option>
                </select>
            </div>
            <div>
                <div class="left">
                    <label>Date Assigned</label>
                    <input
                        type="text"
                        v-model="task_copy.timeline.date_assigned"
                        name="date-assigned"
                    />

                    <label>Date Due</label>
                    <input
                        type="text"
                        v-model="task_copy.timeline.date_due"
                        name="date-assigned"
                    />
                </div>
            </div>
            <div>
                <input
                    v-if="task_copy._id"
                    type="button"
                    @click="updateTask"
                    value="Update"
                />

                <input
                    v-if="task_copy._id"
                    type="button"
                    @click="deleteTask"
                    value="Delete"
                />
                <input v-else type="button" @click="addTask" value="Add" />
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
