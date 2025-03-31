
<template>
    <section class="d-flex justify-center flex-column flex-md-row align-center ga-14 mt-15">
        <div class="skew"></div>
        <div class="skew2"></div>
        <v-card v-for="item in items" :key="item.id" class="custom-card" tile>
            <img loading="lazy" class="img__stats" :src=item.imgSrc :alt=item.imgAlt />
            <div class="card-content">
                <p class="count">{{ item.count }}</p>
                <p class="text-body-1">{{ item.description }}</p>
            </div>
        </v-card>
    </section>
</template>
<script>
import axios from 'axios';

export default {
    name: "timeLine",
    data() {
        return {
            items: [
                {
                    id: 1,
                    imgSrc: require('@/assets/homePage/sprzetnastanie.png'),
                    imgAlt: "Sprzęt na stanie",
                    count: 0,
                    description: "Zarejestrowany sprzęt"
                },
                {
                    id: 2,
                    imgSrc: require('@/assets/homePage/sprzetwuzyciu.png'),
                    imgAlt: "Sprzęt w użyciu",
                    count: 0,
                    description: "Sprzęt przypisany do pracowników"
                },
                {
                    id: 3,
                    imgSrc: require('@/assets/homePage/wpisanychpracownikow.png'),
                    imgAlt: "Wpisanych pracowników",
                    count: 0,
                    description: "Wpisanych pracowników"
                },
            ]
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            try {
                const response = await axios.get('/api/getStatistics'); 
                const data = response.data;
                this.items[0].count = data.all
                this.items[1].count = data.przypisane
                this.items[2].count = data.pracownicy
            } catch (error) {
                console.error("Błąd pobierania danych: ", error);
            }
        }
    }
}
</script>
<style scoped>
.img__stats {
    width: 100%;
    max-width: 300px;
    height: auto;
    margin-bottom: 20px;
}

.custom-card {
    max-width: 350px;
    background-color: #f9f9f9;
    padding: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    transition: 0.3s ease-in-out;
}

.custom-card:hover {
    transform: scale(120%);
}

.card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.count {
    font-size: 32px;
    font-weight: bold;
    color: var(--primary-yellow);
    margin-bottom: 10px;
}

.text-body-1 {
    font-size: 16px;
    color: #757575;
    font-weight: 500;
}

.skew {
    position: absolute;
    display: block;
    top: 0;
    left: -150px;
    background-color: var(--primary-yellow);
    width: 100%;
    max-width: 300px;
    transform: skew(30deg);
    height: 100dvh;
}

.skew2 {
    position: absolute;
    display: block;
    top: 0;
    right: -150px;
    background-color: var(--primary-yellow);
    width: 100%;
    max-width: 300px;
    transform: skew(-30deg);
    height: 100dvh;
}


@media (max-width: 1280px) {
    .skew,
    .skew2 {
        display: none;
    }
}

@media (max-width: 768px) {
    .img__stats {
        max-width: 200px;
    }
}
</style>