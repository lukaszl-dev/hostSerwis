<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Barcode from "vue3-barcode";
import { useRoute } from "vue-router";

const barcodeOptions = {
  format: "CODE128",
  width: 2,
  height: 100,
  displayValue: true,
};

const barcodeValue = ref("123456789");
const route = useRoute();

const generateBarcode = () => {
  const baseId = route.params.id.toString();
  const remainingLength = 9 - baseId.length;
  const randomNumbers = Array.from({ length: remainingLength }, () => Math.floor(Math.random() * 10)).join("");
  barcodeValue.value = baseId + randomNumbers;
};

const checkBarCode = async () => {
  try {
    const response = await axios.get("/api/getBarcode", {
      params: { id: route.params.id },
    });

    if (response.data.length > 0 && response.data[0].kod_przedmiotu) {
      barcodeValue.value = response.data[0].kod_przedmiotu;
    } else {
      generateBarcode();
      try {
        await axios.post("/api/addBarcode", {
          id: route.params.id,
          code: barcodeValue.value,
        });
      } catch (e) {
        console.error("Błąd zapisu kodu kreskowego:", e);
      }
    }
  } catch (error) {
    console.error("Błąd pobierania danych:", error);
  }
};

const printBarcode = () => {
  const barcodeElement = document.querySelector('.barcode-container');
  const printWindow = window.open('', '', 'width=800, height=600');
  printWindow.document.write('<html><head><title>Drukowanie</title></head><body>');
  printWindow.document.write(barcodeElement.outerHTML);  
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.focus();  
  printWindow.print(); 
  printWindow.onafterprint = function () {
    printWindow.close();
  };
};

onMounted(checkBarCode);
</script>


<template>
  <div class="barcode-container">
    <Barcode :value="barcodeValue" v-bind="barcodeOptions" />
  </div>
  <v-btn @click="printBarcode">Drukuj kod kreskowy</v-btn>
</template>

<style scoped>
.barcode-container {
  text-align: center;
  padding: 20px;
}

.v-btn:hover {
  color: var(--primary-yellow);
  background-color: var(--primary-blue);
}
</style>
