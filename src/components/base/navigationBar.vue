<template>
  <v-app-bar class="nav" color="white" elevation="2" app>
    <router-link class="routerLink" to="/">
      <div class="text-h6 no-wrap d-flex justify-center align-center"><img class="logoImg" src="../../assets/logo.png"></div>
    </router-link>
    <v-spacer></v-spacer>
    <v-container class="d-none d-md-flex justify-end">
      <router-link activeClass="active" class="routerLink" to="/">
        <v-btn class="mr-5 text-body-1 ">
          <v-icon icon="mdi-home mr-2" /> Home
        </v-btn>
      </router-link>
      <router-link activeClass="active" class="routerLink" to="/warehouse">
        <v-btn class="mr-5 text-body-1">
          <v-icon icon="mdi-widgets mr-2" /> Magazyn
        </v-btn>
      </router-link>
      <router-link activeClass="active" class="routerLink" to="/scannerPage">
        <v-btn class="mr-5 text-body-1">
          <v-icon icon="mdi-qrcode mr-2" /> Skaner Kodów
        </v-btn>
      </router-link>
    </v-container>
    <v-app-bar-nav-icon class="d-sm-flex d-md-none" @click="drawer = !drawer"
      :class="drawer ? 'active-hamburger' : ''"></v-app-bar-nav-icon>
  </v-app-bar>
  <v-navigation-drawer v-model="drawer" app temporary>
    <v-list>
      <v-list-item>

        <router-link activeClass="active" class="routerLink" to="/">
          <v-btn @click="toggleDrawer()" class="text-body-1 custom-btn active">
            <v-icon icon="mdi-home mr-2" /> Home
          </v-btn>
        </router-link>

      </v-list-item>

      <v-list-item>

        <router-link activeClass="active" class="routerLink" to="/warehouse">
          <v-btn @click="toggleDrawer()" class="text-body-1 custom-btn">
            <v-icon icon="mdi-widgets mr-2" /> Magazyn
          </v-btn>
        </router-link>

      </v-list-item>

      <v-list-item>

        <router-link activeClass="active" class="routerLink" to="/scannerPage">
          <v-btn @click="toggleDrawer()" class="text-body-1 custom-btn">
            <v-icon icon="mdi-qrcode mr-2" /> Skaner Kodów
          </v-btn>
        </router-link>

      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "nagivation_bar",
  data() {
    return {
      drawer: false,
    };
  },
  methods: {
    toggleDrawer() {
      this.drawer = false;
    },
  },
};
</script>
<style scoped>
.custom-btn {
  text-align: left;
  width: 100%;
  padding: 10px 20px;
  background-color: transparent;
  border: none;
  box-shadow: none;
  color: #000;
  display: flex;
  justify-content: flex-start;
  font-size: 16px;
}

.custom-btn:hover {
  background-color: #f0f0f0;
}

.custom-btn .v-icon {
  font-size: 20px;
}

.nav {
  user-select: none;
}

.active>.v-btn {
  color: var(--primary-blue);
  background-color: var(--primary-blueAlpha);
}

.nonactive {
  color: black;
  background-color: white;
}

.no-wrap {
  white-space: nowrap;
}

.logoImg {
  width: 100%;
  max-width: 140px;
  height: auto;
  margin: 15px;
}

.active-hamburger {
  color: var(--primary-blue);
}

.v-btn {
  transition: 0.2s ease-in;
}

.routerLink {
  color: black;
  text-decoration: none;
}

.v-btn:not(.active):hover {
  color: var(--primary-blue);
  background-color: #f0f0f0;
}
</style>