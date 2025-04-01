<template>
    <v-snackbar v-model="snackbar" timeout="3000">
        {{ snackbarMessage }}
        <template v-slot:actions>
            <v-btn text class="text-white" @click="snackbar = false">X</v-btn>
        </template>
    </v-snackbar>
    <v-dialog v-model="confirmDialog" max-width="400">
        <v-card>
            <v-card-title class="text-h6">
                Czy na pewno chcesz usunąć kategorię: <br> {{ categoryToDelete?.name }}?
            </v-card-title>
            <v-card-actions class="d-flex justify-end">
                <v-btn color="red" text @click="confirmDialog = false">Nie</v-btn>
                <v-btn color="green" text @click="confirmRemoveItem">Tak</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-sheet class="mx-auto" width="300">
        <v-form ref="form" fast-fail @submit.prevent>
            <v-text-field v-model="categoryName" :rules="categoryNameValidator" label="Nazwa Kategorii"></v-text-field>
            <v-btn class="mt-2 btn-Submit text-h6 text-uppercase" type="submit" block
                @click="addCategory()">Dodaj</v-btn>
        </v-form>
    </v-sheet>
    <h2 class="mt-16 pa-5">Obecne kategorie:</h2>
    <p class="text-body-2"><b>Uwaga!</b> Usuwając kategorię która jest wykorzystywana przez istniejące rekordy, automatycznie zostanie przypisana kategoria "inne" !!!</p>
    <v-container class="d-flex justify-center align-center">
        <v-table class="form-category-table pa-5 text-h6 text-center">
            <thead>
                <tr>
                    <th class="text-center">
                        ID
                    </th>
                    <th class="text-center">
                        Nazwa
                    </th>
                    <th class="text-center">
                        Akcje
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in categories" :key="item.id">
                    <td>{{ item.id }}</td>
                    <td>{{ item.name }}</td>
                    <td>
                        <v-btn v-if="item.id != 1" class="ma-5 text-body-1 drop" @click="askToRemoveItem(item)">
                            <v-icon icon="mdi-delete mr-2" /> Usuń kategorię
                        </v-btn>
                    </td>
                </tr>
            </tbody>
        </v-table>
    </v-container>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';


// formularz
const form = ref(null);

// snackbar [pasek informacyjny pojawiajacy sie po wywaleniu sie bledu]
let snackbar = ref(false);
let snackbarMessage = ref('');
const showSnackbar = (message) => {
    snackbarMessage.value = message;
    snackbar.value = true;
};

// Dialog [pytanie o potwierdzenie usunięcia]
const confirmDialog = ref(false);
const categoryToDelete = ref(null);


// tabela 
const categories = ref([])
const getCategories = async () => {
    try {
        const response = await axios.get(`/api/getCategories`);
        if (response) {
            categories.value = response.data;
        }
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
    }
};

// co uruchomienie pobiera kategorie
onMounted(getCategories);

// formularz (walidacja i pobieranie danych)
const categoryName = ref('')
const categoryNameValidator = [
    value => {
        if (value?.length >= 3) return true
        return 'Nazwa kategorii musi liczyć co najmniej 3 znaki!'
    },
]


// dodawanie 
const addCategory = async () => {
    if (!categoryName.value) return showSnackbar("Podaj nazwę kategorii!");
    try {
        const response = await axios.post("/api/addCategory", {
            nazwa: categoryName.value,
        });

        if (response.status === 201) {
            showSnackbar("Pomyślnie dodano kategorię!");
            await getCategories();
            categoryName.value = "";
            form.value?.reset();
        } else {
            showSnackbar("Wystąpił problem z dodawaniem kategorii!");
        }
    } catch (e) {
        showSnackbar("Błąd serwera podczas dodawania kategorii.");
        console.error(e);
    }
}

// usuwanie 

// Funkcja otwierająca dialog przed usunięciem
const askToRemoveItem = (item) => {
    categoryToDelete.value = item;
    confirmDialog.value = true;
};

// Funkcja wysyłająca rządanie usunięcia
const confirmRemoveItem = async () => {
    if (!categoryToDelete.value) return;

    try {
        const response = await axios.post("/api/dropCategory", {
            id: categoryToDelete.value.id,
        });

        if (response.status === 201) {
            showSnackbar(`Pomyślnie usunięto kategorię "${categoryToDelete.value.name}"!`);
            await getCategories();
        } else {
            showSnackbar("Wystąpił problem z usuwaniem kategorii!");
        }
    } catch (e) {
        showSnackbar("Błąd serwera podczas usuwania kategorii.");
        console.error(e);
    }

    confirmDialog.value = false;
    categoryToDelete.value = null;
};


</script>
<style scoped>
.drop {
    transition: 0.2s ease-in-out;
}

.drop:hover {
    color: red;
}
.form-category-table {
    width: 60%;
    height: auto;
}

.btn-Submit:hover {
    color: var(--primary-yellow);
    background-color: var(--primary-blue);
}

@media (max-width: 768px) {
    .form-category-table {
        width: 100%;
        height: auto;
    }
}
</style>