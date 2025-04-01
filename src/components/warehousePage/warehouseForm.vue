<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useField, useForm } from 'vee-validate';
import { useRouter, useRoute } from 'vue-router';

// Walidacja
const { handleSubmit } = useForm({
    validationSchema: {
        nprzedmiotu() {
            if (nazwaPrzedmiotu.value?.length >= 3 && nazwaPrzedmiotu.value?.length <= 100) return true

            return 'Nazwa przedmiotu nie może być krótsza od 3 znaków i dłuższa od 100 znaków'
        },
        opis() {
            if (opisPrzedmiotu.value?.length >= 10 && opisPrzedmiotu.value?.length <= 500) return true

            return 'Opis przedmiotu nie może być krótszy od 10 znaków i dłuższy od 500 znaków'
        },
        fprzedmiotu() {
            if (firmaPrzedmiotu.value?.length >= 2 && firmaPrzedmiotu.value?.length <= 50) return true

            return 'Producent przedmiotu nie może być krótsza od 2 znaków i dłuższa od 50 znaków'
        },
        pracownik() {
            if (zaznaczonyPracownik.value) return true

            return 'Wybierz pracownika'
        },
        kategoria() {
            if (wybranaKategoria.value) return true

            return 'Wybierz pracownika'
        },
        checkbox(value) {
            if (value === '1') return true

            return 'Musisz potwierdzić zgodność!'
        },
    },
})
const nprzedmiotu = useField('nprzedmiotu');
const opis = useField('opis');
const fprzedmiotu = useField('fprzedmiotu');
const pracownik = useField('pracownik');
const kategoria = useField('kategoria');
const checkbox = useField('checkbox');


// Router/Routing [odebranie parametru id z linka i końcowe przekierowanie na stronę]
const route = useRoute();
const router = useRouter();
const id = route.params.id || -1;
// v-model [ustawienie wartości domyślnych dla zmiennych ktore oblusguja formularz]
const zaznaczonyPracownik = ref(null);
const wybranaKategoria = ref(null);
const nazwaPrzedmiotu = ref(null);
const firmaPrzedmiotu = ref(null);
const opisPrzedmiotu = ref(null);
const employees = ref([]);
const kategorie = ref([]);
// snackbar [pasek informacyjny pojawiajacy sie po wywaleniu sie bledu]
let snackbar = ref(false);
let snackbarMessage = ref('');

// do h1 
let akcja = ref("");

// funkcja pobierająca pracowników do listy a przy okazji dane do formularza
const fetchData = async () => {
    try {
        const response = await axios.get(`/api/getwarehousFormData?id=${id}`);
        if (response) {
            employees.value = response.data.employees;
            // console.log(response.data.nazwa)
            kategorie.value = response.data.kategorie;
            if (id != -1) {
                wybranaKategoria.value = response.data.zaznaczonaKategoria;
                zaznaczonyPracownik.value = response.data.owner;
                nazwaPrzedmiotu.value = response.data.nazwa;
                firmaPrzedmiotu.value = response.data.firma;
                opisPrzedmiotu.value = response.data.opis;
            }
        }
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
        if (error.response && error.response.status === 404) {
            router.push({ name: 'Warehouse' });
        }
    }
};

// wywołanie przy każdym załadowaniu komponentu
onMounted(() => {
    if (id != -1) {
        akcja.value = "Edytowanie ";
    } else {
        akcja.value = "Dodawanie ";
    }
    fetchData(id)
});



// funkcja wysyłająca rządanie o update
const updateItem = async () => {
    try {
        const response = await axios.post('/api/updateItem', {
            id: id,
            nprzedmiotu: nazwaPrzedmiotu.value,
            opis: opisPrzedmiotu.value,
            fprzedmiotu: firmaPrzedmiotu.value,
            pracownik: zaznaczonyPracownik.value,
            wybranaKategoria: wybranaKategoria.value,
        });
        if (response.status == 201) {
            snackbarMessage.value = "Zaktualizowano dane!";
            snackbar.value = true;
            router.push({ name: 'Warehouse' });
        } else {
            router.push({ name: 'Warehouse' });
        }
    } catch (error) {
        console.error('Błąd updatu VUE:', error);
        router.push({ name: 'Warehouse' });
    }
}

// funkcja wysylajac rzadanie o dodanie
const addItem = async () => {
    try {
        const response = await axios.post('/api/addItem', {
            id: id,
            nprzedmiotu: nazwaPrzedmiotu.value,
            opis: opisPrzedmiotu.value,
            fprzedmiotu: firmaPrzedmiotu.value,
            pracownik: zaznaczonyPracownik.value,
            wybranaKategoria: wybranaKategoria.value,
        });
        if (response.status == 201) {
            snackbarMessage.value = "Dodano sprzęt!";
            snackbar.value = true;
            router.push({ name: 'Warehouse' });
        } else {
            router.push({ name: 'Warehouse' });
        }
    } catch (error) {
        console.error('Błąd updatu VUE:', error);
        router.push({ name: 'Warehouse' });
    }
}

// click-handler do buttona
const submit = handleSubmit(() => {
    if (id != -1) {
        updateItem();
    } else {
        addItem();
    }
})


</script>
<template>
    <div>
        <v-snackbar v-model="snackbar" timeout="3000">
            {{ snackbarMessage }}
            <template v-slot:actions>
                <v-btn text class="text-white" @click="snackbar = false">X</v-btn>
            </template>
        </v-snackbar>
        <h1>{{ akcja }} przedmiotu</h1>
        <v-container class="fill-height d-flex align-center justify-center">
            <v-responsive class="d-flex align-center justify-center form-container">
                <form @submit.prevent="submit">
                    <v-text-field v-model="nazwaPrzedmiotu" :counter="100"
                        :error-messages="nprzedmiotu.errorMessage.value" label="Nazwa przedmiotu"></v-text-field>

                    <v-text-field v-model="firmaPrzedmiotu" :counter="50"
                        :error-messages="fprzedmiotu.errorMessage.value" label="Producent przedmiotu"></v-text-field>

                    <v-textarea v-model="opisPrzedmiotu" :counter="500" :error-messages="opis.errorMessage.value"
                        label="Opis przedmiotu"></v-textarea>

                    <v-select v-model="zaznaczonyPracownik" :items="employees" label="Wybierz pracownika"
                        :error-messages="pracownik.errorMessage.value" :menu-props="{ maxHeight: '400' }"></v-select>

                    <v-select v-model="wybranaKategoria" :items="kategorie" label="Wybierz kategorie"
                        :error-messages="kategoria.errorMessage.value" :menu-props="{ maxHeight: '400' }"></v-select>

                    <v-checkbox v-model="checkbox.value.value" :error-messages="checkbox.errorMessage.value"
                        label="Potwierdzam zgodność danych ze stanem faktycznym" type="checkbox" value="1"></v-checkbox>

                    <v-btn class="me-4" type="submit">
                        Zatwierdź
                    </v-btn>

                </form>
            </v-responsive>
        </v-container>
    </div>
</template>
<style scoped>
.form-container {
    width: 60%;
    height: auto;
}

.v-btn:hover {
    color: var(--primary-yellow);
    background-color: var(--primary-blue);
}

.v-checkbox .v-label {
    justify-content: flex-start !important;
    text-align: left !important;
}

@media (max-width: 768px) {

    .form-container {
        width: 85%;
        height: auto;
    }
}
</style>