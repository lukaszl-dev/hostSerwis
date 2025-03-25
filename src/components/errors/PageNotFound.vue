<template>
    <v-responsive class="d-flex align-center justify-center">
        <img src="../../assets/errors/404.png" alt="404 page not found">
        <h1 class="text-h1 font-weight-bold pb-10 pt-2 error">Nie znaleziono strony!</h1>
    </v-responsive>
</template>
<script>
export default {
    name: "PageNotFound"
}
</script>
<style scoped>
    img {
        width: 100%;
        max-width: 1050px;
        height: auto;
    }
    @media (max-width: 768px) {
        .error {
            font-size: 2rem !important;
        }
    }
</style>