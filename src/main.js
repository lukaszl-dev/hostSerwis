import { createApp } from 'vue'
import App from './App.vue'
import router from './routers'

// Material icons
import '@mdi/font/css/materialdesignicons.css'

// Vuetify
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    iconfont: 'mdi',
  },
});

const app = createApp(App);
app.use(router);
app.use(vuetify); 
app.mount('#app');
