<template>
  <v-app>
    <nagivation_bar />
    <v-main>
      <router-view />
    </v-main>
    <scroll v-if="!isWarehousePage" :scrollY="scrollY" />
    <footerComp />
  </v-app>
</template>

<script>
import nagivation_bar from "./components/base/navigationBar.vue";
import footerComp from "./components/base/footerComp.vue";
import scroll from "./components/base/ScrollToTop.vue";
export default {
  name: "App",
  data() {
    return {
      scrollY: 0,
    };
  },
  computed: {
    isWarehousePage() {
      return this.$route.path === "/warehouse";
    },
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
:root {
  --primary-yellow: #ffcd03;
  /* --primary-yellowAlpha: rgba(255, 205, 3,0.7); */
  --primary-blueAlpha: #284f756f;
  --primary-blue:  #284f75;
}

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
