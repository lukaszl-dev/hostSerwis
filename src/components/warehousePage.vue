<script>
import axios from 'axios';
import debounce from 'lodash.debounce';
export default {
    data() {
        return {
            itemsPerPage: 10,
            currentPage: 1,
            headers: [
                { title: 'Sprzęt', align: 'center', sortable: false, key: 'nazwasprzetu' },
                { title: 'Użytkownik', key: 'owner', align: 'center' },
                { title: 'Opis urządzenia', key: 'opis', align: 'center' },
                { title: 'Producent urządzenia', key: 'firma', align: 'center' },
                { title: 'Kategoria', key: 'rodzaj', align: 'center' },
                { title: 'Status', key: 'status', align: 'center', sortable: false },
                { title: 'Akcje', key: 'actions', align: 'center', sortable: false }
            ],
            search: '',
            serverItems: [],
            loading: true,
            totalItems: 0,
            snackbar: false,
            snackbarMessage: '',
            confirmDialog: false,
            itemToDelete: null,
            employee: this.$route.params.id || -1,
            columnFilters: {
                nazwasprzetu: '',
                owner: '',
                opis: '',
                firma: '',
                rodzaj: ''
            },
        };
    },
    methods: {
        handleTableChange(options) {
            this.loadItems({
                ...options,
                search: this.search
            });
        },
        onColumnFilter: debounce(function () {
            this.serverItems = [];
            this.loadItems({
                page: 1,
                itemsPerPage: this.itemsPerPage,
                search: this.search
            });
        }, 500),
        async loadItems(options) {
            this.loading = true;
            this.currentPage = options.page;
            this.itemsPerPage = options.itemsPerPage;

            try {
                const response = await axios.get('/api/getEquipment', {
                    params: {
                        page: this.currentPage,
                        itemsPerPage: this.itemsPerPage,
                        employee: this.employee,
                        filter: this.$route.query.filter || null,
                        search: options.search || this.search,
                        ...this.columnFilters 
                    }
                });
                if (response && response.data) {
                    this.serverItems = response.data.items.map(item => ({
                        id: item.id_przedmiotu,
                        nazwasprzetu: item.nazwa_przedmiotu,
                        owner: item.daneW,
                        firma: item.firma_przedmiotu,
                        rodzaj: item.rodzaj_przedmiotu,
                        opis: item.opis_przedmiotu,
                        status: item.status === 0 ? 'nieaktywne' : 'aktywne',
                    }));
                    this.totalItems = response.data.total;
                }
            } catch (error) {
                console.error("Błąd pobierania danych:", error);
                this.$router.push({ name: "Warehouse" });
                this.employee = -1;
                this.loadItems({ page: 1, itemsPerPage: 10 });
            } finally {
                this.loading = false;
            }
        },
        editItem(item) {
            this.$router.push({ name: "WarehouseForm", params: { id: item.id } });
        },
        askToRemoveItem(item) {
            this.itemToDelete = item;
            this.confirmDialog = true;
        },
        async removeItem() {
            if (!this.itemToDelete) return;
            try {
                const response = await axios.post(`/api/removeItem?id=${this.itemToDelete.id}`);
                if (response) {
                    this.snackbarMessage = `Przedmiot ${this.itemToDelete.nazwasprzetu} został usunięty.`;
                    this.snackbar = true;
                    this.loadItems({ page: this.currentPage, itemsPerPage: this.itemsPerPage });
                }
            } catch (error) {
                console.error('Błąd przy usuwaniu:', error);
            }
            this.confirmDialog = false;
            this.itemToDelete = null;
        },
        addCategory() {
            this.$router.push({ name: "WarehouseFormCategory" });
        },
        addEquipment() {
            this.$router.push({ name: "WarehouseFormAdd" });
        },
        EmployeeModule() {
            this.$router.push({ name: "WarehouseEmployeesPage" });
        },
        QRModule(id) {
            this.$router.push({ name: "WarehouseQRModule", params: { id: id } });
        },
    },
    mounted() {
        this.loadItems({ page: this.currentPage, itemsPerPage: this.itemsPerPage });
    }
};
</script>

<template>
    <div>
        <v-snackbar v-model="snackbar" timeout="3000">
            {{ snackbarMessage }}
            <template v-slot:actions>
                <v-btn text class="text-white" @click="snackbar = false">X</v-btn>
            </template>
        </v-snackbar>
        <v-dialog v-model="this.confirmDialog" max-width="400">
            <v-card>
                <v-card-title class="text-h6">
                    Czy na pewno chcesz usunąć sprzęt: <br> {{ this.itemToDelete?.nazwasprzetu }}?
                </v-card-title>
                <v-card-actions class="d-flex justify-end">
                    <v-btn color="red" text @click="confirmDialog = false">Nie</v-btn>
                    <v-btn color="green" text @click="removeItem">Tak</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-responsive>
            <v-btn class="ma-4 text-h6 btn-Add" @click="addEquipment()">
                <v-icon icon="mdi-laptop mr-2" /> Dodaj sprzęt
            </v-btn>
            <v-btn class="ma-4 text-h6 btn-Add" @click="addCategory()">
                <v-icon icon="mdi-file mr-2" /> Zarządzaj Kategoriami
            </v-btn>
            <v-btn class="ma-4 text-h6 btn-Add" @click="EmployeeModule()">
                <v-icon icon="mdi-account-group mr-2" /> Zarządzaj Pracownikami
            </v-btn>
        </v-responsive>


        <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
            :items-length="totalItems" :loading="loading" :search="search" item-value="rodzaj"
            @update:options="handleTableChange" itemsPerPageText="Elementów na stronę:" itemPerPageAllText="Wszystkie">
            <template v-slot:[`item.actions`]="{ item }">

                <v-btn class="ma-5 text-body-1 edit" @click="editItem(item)">
                    <v-icon icon="mdi-pencil mr-2" /> Edytuj
                </v-btn>

                <v-btn class="ma-5 text-body-1 edit" @click="QRModule(item.id)">
                    <v-icon icon="mdi-qrcode mr-2" /> Kod Kreskowy
                </v-btn>

                <v-btn class="ma-5 text-body-1 drop" @click="askToRemoveItem(item)">
                    <v-icon icon="mdi-delete mr-2" /> Usuń
                </v-btn>
            </template>
            <template v-slot:tfoot>
                <tr>
                    <td>
                        <v-text-field v-model="columnFilters.nazwasprzetu" class="ma-2" density="compact"
                            placeholder="Szukaj sprzętu..." hide-details @input="onColumnFilter" />
                    </td>
                    <td>
                        <v-text-field v-model="columnFilters.owner" class="ma-2" density="compact"
                            placeholder="Szukaj użytkownika..." hide-details @input="onColumnFilter" />
                    </td>
                    <td>
                        <v-text-field v-model="columnFilters.opis" class="ma-2" density="compact"
                            placeholder="Szukaj opisu..." hide-details @input="onColumnFilter" />
                    </td>
                    <td>
                        <v-text-field v-model="columnFilters.firma" class="ma-2" density="compact"
                            placeholder="Szukaj producenta..." hide-details @input="onColumnFilter" />
                    </td>
                    <td>
                        <v-text-field v-model="columnFilters.rodzaj" class="ma-2" density="compact"
                            placeholder="Szukaj kategorii..." hide-details @input="onColumnFilter" />
                    </td>
                    <td></td>
                </tr>
            </template>
        </v-data-table-server>
    </div>
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
    color: var(--primary-yellow);
    background-color: var(--primary-blue);
}

.alert__notify {
    color: var(--primary-yellow);
    background-color: var(--primary-blue);
}

.btn-Add {
    width: 100%;
    max-width: 275px;
    height: auto;
    min-height: 50px;
    border-radius: 12px;
    box-shadow: 4px 4px 6px 6px rgba(0, 0, 0, 0.1);
    transition: 0.3s ease-in-out;
    text-align: center;
}

.btn-Add:hover {
    color: var(--primary-yellow);
    background-color: var(--primary-blue);
}

.textField {
    width: 50%;
}

@media (max-width: 768px) {
    .textField {
        width: 95%;
    }
}
</style>
