<template>
    <v-timeline side="end" class="mt-8">
        <v-timeline-item v-for="item in items" :key="item.id" dot-color="teal-lighten-2" size="small">
            <v-container class="timeline__container d-flex justify-center align-center mr-12 ml-16">
                <img :src=item.image :alt="item.alt">
                <div class="timeline-text-box ml-md-16 text-white">
                    <h3 class="text-h4 text-uppercase">{{ item.title }}</h3>
                    <p class="text-h6 pt-5">
                        {{ item.description }}
                    </p>
                </div>
            </v-container>
        </v-timeline-item>
    </v-timeline>
</template>

<script>
export default {
    name: "timeLine",
    data() {
        return {
            items: [
                {
                    id: 1,
                    icon: 'mdi-information',
                    image: require('@/assets/homePage/timeline/inwentaryzacja.png'),
                    title: "Inwentaryzuj",
                    alt: "Proces inwentaryzacji",
                    description: "Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sedeuismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae."
                },
                {
                    id: 2,
                    icon: 'mdi-alert-circle',
                    image: require('@/assets/homePage/timeline/sprawdzanie.png'),
                    title: "Sprawdzaj",
                    alt: "Sprawdzanie",
                    description: "Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sedeuismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae."
                },
                {
                    id: 3,
                    icon: 'mdi-alert-circle',
                    image: require('@/assets/homePage/timeline/dokumentacja.png'),
                    title: "Dokumentuj",
                    alt: "Tworzenie dokumentacji",
                    description: "Lorem ipsum dolor sit amet, no nam oblique veritus. Commune scaevola imperdiet nec ut, sedeuismod convenire principes at. Est et nobis iisque percipit, an vim zril disputando voluptatibus, vix an salutandi sententiae."
                },
            ]
        };
    },
};
</script>

<style scoped>
.v-timeline--vertical.v-timeline {
    height: 70%;
}

.timeline__container {
    max-width: 80%;
    background-color: rgb(50, 220, 158);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    padding: 16px;
    border-radius: 8px;
}

.timeline-text-box {
    width: 70%;
    padding: 10px;
}

.timeline-text-box h3 {
    width: 100%;
    font-weight: bold;
}

.timeline-text-box p {
    width: 100%;
}

.timeline__container img {
    max-width: 350px;
    width: 100%;
    margin-right: 16px;
    border-radius: 8px;
}

@media (max-width: 768px) {
    .timeline__container {
        flex-direction: column;
        align-items: center;
        margin-left: 0px !important;
        margin-right: 0px !important;
    }

    .v-timeline--vertical.v-timeline {
        height: 50%;
    }

    .timeline-text-box {
        width: 100%;
        margin-top: 10px;
    }

    .timeline__container img {
        max-width: 100%;
        margin-right: 0;
    }

    .timeline-text-box h3 {
        font-size: 1.6rem !important;
    }

    .timeline-text-box p {
        font-size: 1.1rem !important;
    }
}

@media (max-width: 400px) {
    .timeline-text-box h3 {
        font-size: 1.2rem !important;
    }
}
</style>