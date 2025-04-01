<template>
  <statistics/>
  <section class="about d-flex flex-column flex-md-row flex-wrap align-center justify-center ga-16 pa-5">
    <img class="mr-10" src="../assets/homePage/softwareserwisu.png" alt="Software serwisu">
    <v-responsive class="about-text-container text-center text-md-start mr-10">
      <h2 class="text-xs-h5 text-sm-h2 text-h4 pb-10 text-uppercase">Software serwisu</h2>
      <p class="text-h6 pb-10">
        Oprogramowanie do Inwentaryzacji i Zarządzania Magazynem to narzędzie do monitorowania stanów, dokumentowania przepływu towarów i kontrolowania procesów serwisowych. Intuicyjny interfejs i przydatne funkcje umożliwiają szybkie sprawdzanie dostępności produktów oraz rejestrowanie operacji. System obsługuje kody kreskowe, co znacząco ułatwia użytkowanie.
      </p>
    </v-responsive>
    <div class="circle"></div>
  </section>
  <timeline />
</template>

<script>
import timeline from './homePage/timeline.vue';
import statistics from './homePage/statistics.vue';
export default {
  name: "homePage",
  components: {
    timeline,
    statistics
  },
  data() {
    return {
    }
  },
};
</script>

<style scoped>
* {
  user-select: none;
}


section.about {
  position: relative;
  width: 100%;
  min-height: 550px;
  background-color: var(--primary-blue);
  color: var(--primary-yellow);
  margin-top: 100px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

section.about>img {
  width: 100%;
  max-width: 500px;
  height: auto;
  padding: 20px;
}

.about-text-container {
  width: 100%;
  max-width: 750px;
}

.card-image img {
  width: 100%;
  max-width: 450px;
  height: auto;
}


.circle {
  width: 100%;
  max-width: 150px;
  height: auto;
  min-height: 150px;
  position: absolute;
  bottom: -35px;
  left: 50%;
  transform: translateX(-50%) translateY(50%);
  border-radius: 50%;
  background-color: white;
}



@media (max-width: 768px) {

  .circle {
    bottom: -15px;
    max-width: 80px;
    min-height: 80px;
  }
}

@media (min-width: 768px) {
  .about-text-container {
    width: 60%;
  }
}
</style>
