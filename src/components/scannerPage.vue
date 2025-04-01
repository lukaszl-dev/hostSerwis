<template>
    <v-snackbar v-model="snackbar" timeout="3000">
        {{ snackbarMessage }}
        <template v-slot:actions>
            <v-btn text class="text-white" @click="snackbar = false">X</v-btn>
        </template>
    </v-snackbar>
    <div class="d-flex justify-center">
        <div class="autocomplete">
            <input type="text" v-model="searchTerm" @input="filterSuggestions" @focus="showSuggestions = true"
                @blur="handleBlur" placeholder="Wprowadź numer kodu" :aria-expanded="showSuggestions.toString()" />
            <ul v-if="showSuggestions && filteredSuggestions.length" class="suggestions-list">
                <li v-for="(suggestion, index) in filteredSuggestions" :key="index"
                    @mousedown.prevent="selectSuggestion(suggestion)" class="suggestion-item">
                    {{ suggestion }}
                </li>
            </ul>
        </div>
        <v-btn class="btn-Submit" @click="checkCode()">Sprawdź</v-btn>
    </div>
</template>
<script>
import axios from 'axios';

export default {
    data() {
        return {
            searchTerm: '',
            suggestions: [],
            filteredSuggestions: [],
            showSuggestions: false,
            snackbar: false,
            snackbarMessage: '',
        };
    },
    methods: {

        filterSuggestions() {
            if (this.searchTerm.length < 1) {
                this.filteredSuggestions = [];
                this.showSuggestions = false;
                return;
            }

            this.filteredSuggestions = this.suggestions.filter((suggestion) =>
                suggestion.toLowerCase().startsWith(this.searchTerm.toLowerCase())
            );
            this.showSuggestions = this.filteredSuggestions.length > 0;
        },


        selectSuggestion(suggestion) {
            this.searchTerm = suggestion;
            this.filteredSuggestions = [];
            this.showSuggestions = false;
        },


        handleBlur() {
            setTimeout(() => {
                this.showSuggestions = false;
            }, 200);
        },


        async fetchData() {
            try {
                const response = await axios.get('/api/getBarcodes');
                if (response) {
                    this.suggestions = response.data.map(item => item.kod_przedmiotu);
                }
            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            }
        },

        async checkCode() {
            try {
                const response = await axios.post("/api/getBarcodeId", {
                    code: this.searchTerm
                });
                if (response) {
                    if (response.data.length > 0) {
                        this.$router.push({ name: "WarehouseForm", params: { id: response.data[0].id_przedmiotu } });
                    } else {
                        this.snackbarMessage = "Brak przedmiotu o podanym kodzie!";
                        this.snackbar = true;
                    }
                }
            } catch (error) {
                console.error("Błąd pobierania danych:", error);
            }
        }

    },
    mounted() {
        this.fetchData();
    }
};
</script>

<style scoped>
.d-flex {
    display: flex;
    align-items: center;
}

.autocomplete {
    position: relative;
    width: 100%;
    max-width: 280px;
    margin-right: 8px;
}

input {
    width: 100%;
    max-width: 280px;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.suggestions-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    border: 1px solid #ccc;
    border-top: none;
    background-color: white;
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin: 0;
    padding: 0;
}

.suggestion-item {
    padding: 8px;
    cursor: pointer;
}

.suggestion-item:hover {
    background-color: #f0f0f0;
}

.btn-Submit {
    margin-left: 8px;
}

.btn-Submit:hover {
    color: var(--primary-blue);
    background-color: var(--primary-yellow);
}

@media (max-width: 768px) {
    .autocomplete {
        max-width: 200px;
    }

    .btn-Submit {
        margin-right: 15px;
    }
}
</style>