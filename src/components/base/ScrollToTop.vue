<template>
    <v-btn @click="goToTop()" v-if="scrollY > 700" class="btn-to-top text-h4 d-flex align-center justify-center">
        <v-icon icon="mdi-chevron-up" />
    </v-btn>
</template>
<script>
export default {
    name: "scrollToTop",
    props: {
        scrollY,
    },
    methods: {
        goToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            })
        }
    },
}
</script>
<style scoped>
.btn-to-top {
    position: fixed !important;
    bottom: 20px;
    right: 20px;
    width: 55px;
    height: 55px;
    background-color: rgb(50, 220, 158) !important;
    color: white !important;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.4);
    transition: transform 0.3s ease-in-out;
    z-index: 9999;
    pointer-events: auto;
}

.btn-to-top:hover {
    background-color: rgb(133, 242, 202) !important;
    transform: scale(1.1);
}
</style>