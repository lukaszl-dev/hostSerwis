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
                Czy na pewno chcesz usunąć <br> pracownika: {{ employeeToDelete?.name }}?
            </v-card-title>
            <v-card-actions class="d-flex justify-end">
                <v-btn color="red" text @click="confirmDialog = false">Nie</v-btn>
                <v-btn color="green" text @click="removeEmployee">Tak</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-sheet class="mx-auto mt-10" width="300">
        <v-form fast-fail @submit.prevent>
            <v-text-field v-model="employeeFirstname" :rules="employeeFirstnameValidator" label="Imie"></v-text-field>
            <v-text-field v-model="employeeLastname" :rules="employeeLastnameValidator" label="Nazwisko"></v-text-field>
            <v-btn class="mt-2 btn-Submit text-h6 text-uppercase" type="submit" block
                @click="addEmployee()">Dodaj</v-btn>
        </v-form>
    </v-sheet>

    <p class="text-body-1 mt-10"><b>Uwaga!</b> Usuwając pracownika który jest wykorzystywany przez istniejące rekordy,
            automatycznie zostanie przypisany pracownik "Firma Host" !!!</p>
    <p class="text-h6 mt-2">⭐ Naciśnij na dane pracownika aby otworzyć powiązane z nim przedmioty 🎉</p>

    <v-container class="d-flex justify-center align-center">
        <v-table class="form-category-table pa-5 text-h6 text-center" height="800px">
            <thead>
                <tr>
                    <th class="text-center">
                        ID
                    </th>
                    <th class="text-center">
                        Dane:
                    </th>
                    <th class="text-center">
                        Akcje
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in employees" :key="item.id">
                    <td>{{ item.id }}</td>
                    <td> <router-link class="links" :to="{ name: 'Warehouse', params: { id: item.id } }">{{ item.name
                            }}</router-link></td>
                    <td>
                        <v-btn v-if="item.id != 1" class="ma-5 text-body-1 drop" @click="askToRemoveItem(item)">
                            <v-icon icon="mdi-delete mr-2" /> Usuń pracownika
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

// Snackbar
const snackbar = ref(false);
const snackbarMessage = ref('');

// Dialog [pytanie o potwierdzenie usunięcia]
const confirmDialog = ref(false);
const employeeToDelete = ref(null);

// tabela 
const employees = ref([])
const getEmployeess = async () => {
    try {
        const response = await axios.get(`http://localhost:3000/api/getEmployeess`);
        if (response) {
            employees.value = response.data;
        }
    } catch (error) {
        console.error("Błąd pobierania danych:", error);
    }
};


// co uruchomienie pobiera pracowników
onMounted(getEmployeess);

// Usuwanie
const askToRemoveItem = (item) => {
    employeeToDelete.value = item;
    confirmDialog.value = true;
}

const removeEmployee = async () => {
    if (!employeeToDelete.value) return;
    try {
        const response = await axios.post(`http://localhost:3000/api/removeEmployee?id=${employeeToDelete.value.id}`);
        if (response) {
            snackbarMessage.value = `Pracownik ${employeeToDelete.value.name} został usunięty.`;
            snackbar.value = true;
            await getEmployeess();
        }
    } catch (error) {
        console.error('Błąd przy usuwaniu:', error);
    }
    confirmDialog.value = false;
    employeeToDelete.value = null;
}

// formularz (walidacja i pobieranie danych i obłsuga)
const employeeFirstname = ref('')
const employeeLastname = ref('')
const employeeFirstnameValidator = [
    value => {
        if (value?.length >= 3) return true
        return 'Imie musi liczyć co najmniej 3 znaki!'
    },
]
const employeeLastnameValidator = [
    value => {
        if (value?.length >= 3) return true
        return 'Nazwisko musi liczyć co najmniej 3 znaki!'
    },
]

const addEmployee = async() => {
    if (!employeeFirstname.value){
        snackbarMessage.value = `Podaj imie pracownika`;
        snackbar.value = true;
        return ;
    } 
    if (!employeeLastname.value){
        snackbarMessage.value = `Podaj nazwisko pracownika!`;
        snackbar.value = true;
        return ;
    } 
    try {
        const response = await axios.post("http://localhost:3000/api/addEmployee", {
            imie: employeeFirstname.value,
            nazwisko: employeeLastname.value
        });

        if (response.status === 201) {
            snackbarMessage.value = `Pomyślnie dodano pracownika!`;
            snackbar.value = true;
            await getEmployeess();
            employeeFirstname.value = "";
            employeeLastname.value = "";
        } else {
            snackbarMessage.value = `Wystąpił problem!`;
            snackbar.value = true;
        }
    } catch (e) {
        snackbarMessage.value = `Wystąpił problem!`;
        snackbar.value = true;
        console.error(e);
    }
}




</script>
<style scoped>
.drop {
    transition: 0.2s ease-in-out;
}

.drop:hover {
    color: red;
}

.links {
    text-decoration: none;
    color: black;
}

.btn-Submit:hover {
    color: var(--primary-blue);
    background-color: var(--primary-yellow);
}
</style>