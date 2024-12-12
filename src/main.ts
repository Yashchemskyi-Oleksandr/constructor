import './scss/main.scss'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

import {createApp} from 'vue'
import App from './App.vue'
import {QuillEditor} from '@vueup/vue-quill'


const app = createApp(App);
app.component('QuillEditor', QuillEditor)
app.mount('#app')
