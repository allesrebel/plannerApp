<script>
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
    <header>
        <div class="wrapper">
            <nav>
                <div class="main">
                    <RouterLink to="/">Made with Vue!</RouterLink>
                </div>
            </nav>
            <nav>
                <RouterLink to="/projects">Projects</RouterLink>
                <RouterLink to="/tasks">Tasks</RouterLink>
            </nav>
        </div>
    </header>
    <main>
        <RouterView />
    </main>
</template>

<style scoped>
header {
    line-height: 1.5;
    max-height: 100vh;
}

nav {
    width: 100%;
    font-size: 20px;
    text-align: center;
}

a.router-link-exact-active {
    color: var(--color-text);
}
a.router-link-exact-active:hover {
    background-color: transparent;
}

a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
}

a:first-of-type {
    border: 0;
}

header .wrapper .main {
    border-left: none;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        place-items: center;
        padding-right: calc(var(--section-gap) / 2);
    }

    .logo {
        margin: 0 2rem 0 0;
    }

    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }
}
</style>
