<template>
    <div id="app">
        <div class="wrapper">
            <div class="list">
                <p v-for="item in items" :key="item">
                    {{ item }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { getData } from './data.js'

export default {
    name: 'App',
    data() {
        return {
            items: getData(100000)
        }
    }
}
</script>

<style>
#app {
    text-align: center;
    color: #2c3e50;
    margin-top: 1em;
    padding: 1em;
}

.list {
    border: 2px solid red;
    border-radius: 3px;
}
</style>