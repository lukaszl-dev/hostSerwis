<script>
import axios from 'axios';
export default {
    data() {
        return {
            itemsPerPage: 10,
            currentPage: 1,
            headers: [
                { title: 'Sprzęt', align: 'start', sortable: false, key: 'nazwasprzetu' },
                { title: 'Właściciel', key: 'owner', align: 'end' },
                { title: 'Opis urządzenia', key: 'opis', align: 'end' },
                { title: 'Firma urządzenia', key: 'firma', align: 'end' },
                { title: 'Rodzaj urządzenia', key: 'rodzaj', align: 'end' },
                { title: 'Akcje', key: 'actions', align: 'center', sortable: false }
            ],
            search: '',
            serverItems: [],
            loading: true,
            totalItems: 0,
            snackbar: false,
            snackbarMessage: '',
        };
    },
    methods: {
        loadItems(options) {
            this.loading = true;
            this.currentPage = options.page;
            this.itemsPerPage = options.itemsPerPage;

            fetch(`http://localhost:3000/api/getEquipment?page=${this.currentPage}&itemsPerPage=${this.itemsPerPage}`)
                .then(res => {
                    if (!res.ok) throw new Error("Błąd pobierania danych", res);
                    return res.json();
                })
                .then(response => {
                    this.serverItems = response.items.map(item => ({
                        id: item.id_przedmiotu,
                        nazwasprzetu: item.nazwa_przedmiotu,
                        owner: item.daneW,
                        firma: item.firma_przedmiotu,
                        rodzaj: item.rodzaj_przedmiotu,
                        opis: item.opis_przedmiotu,
                    }));
                    this.totalItems = response.total;
                    this.loading = false;
                })
                .catch(error => {
                    console.error("Błąd pobierania danych:", error);
                    this.loading = false;
                });
        },
        editItem(item) {
            this.$router.push({name: "WarehouseForm", params:{id: item.id}});
            console.log('Edytuj', item);
        },
        async removeItem(item) {
            try {
                const response = await axios.post(`http://localhost:3000/api/removeItem?id=${item.id}`);
                if (response) {
                    this.snackbarMessage = `Przedmiot ${item.nazwasprzetu} został usunięty.`;
                    this.snackbar = true;
                    this.loadItems({ page: this.currentPage, itemsPerPage: this.itemsPerPage });
                }
            } catch (error) {
                console.error('Błąd przy usuwaniu:', error);
            }
        },
    },
    mounted() {
        this.loadItems({ page: this.currentPage, itemsPerPage: this.itemsPerPage });
    }
};

</script>

<template>
    <v-snackbar v-model="snackbar" timeout="3000">
        {{ snackbarMessage }}
        <template v-slot:actions>
            <v-btn text class="text-white" @click="snackbar = false">X</v-btn>
        </template>
    </v-snackbar>
    <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
        :items-length="totalItems" :loading="loading" :search="search" item-value="rodzaj" @update:options="loadItems" itemsPerPageText="Elementów na stronę:" itemPerPageAllText="Wszystkie">
        <template v-slot:[`item.actions`]="{ item }">

            <v-btn class="ma-5 text-body-1 edit" @click="editItem(item)">
                <v-icon icon="mdi-pencil mr-2" /> Edytuj
            </v-btn>

            <v-btn class="ma-5 text-body-1 drop" @click="removeItem(item)">
                <v-icon icon="mdi-delete mr-2" /> Usuń
            </v-btn>
        </template>
    </v-data-table-server>
</template>


<style scoped>
.edit,
.drop {
    transition: 0.2s ease-in-out;
}

.drop:hover {
    color: red;
}

.edit:hover {
    color: #32dc9e;
    background-color: #f0f0f0;
}

.alert__notify {
    background-color: #32dc9e;
}
</style>
