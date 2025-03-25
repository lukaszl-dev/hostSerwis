<template>
  <v-app>
    <nagivation_bar />
    <v-main>
      <router-view />
    </v-main>
    <scroll :scrollY="scrollY"/>
    <footerComp/>
  </v-app>
</template>

<script>
import nagivation_bar from "./components/base/navigationBar.vue";
import footerComp  from "./components/base/footerComp.vue";
import scroll from "./components/base/ScrollToTop.vue";
export default {
  name: "App",
  data() {
    return {
      scrollY: 0,
    };
  },
  methods: {
    updateScroll() {
      this.scrollY = window.scrollY;
    },
  },
  mounted() {
    window.addEventListener("scroll", this.updateScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.updateScroll);
  },
  components: {
    nagivation_bar,
    footerComp,
    scroll
  },
};
</script>

<style>
  html {
    scroll-behavior: smooth;
  }
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
