import home_page from "./components/homePage.vue";
import PageNotFound from "./components/errors/PageNotFound.vue";
import warehousePage from "./components/warehousePage.vue";
import scannerPage from "./components/scannerPage.vue";
import employeesPage from "./components/warehousePage/warehouseemployeesPage.vue";
import warehouseForm from "./components/warehousePage/warehouseForm.vue";
import warehouseFormCategory from "./components/warehousePage/warehouseFormCategory.vue";
import warehouseQRModule from "./components/warehousePage/warehouseQRModule.vue";
import {createRouter, createWebHistory} from 'vue-router';


const routes=[
    {
        name: 'Home',
        component: home_page,
        path: '/',
    },
    {
        name: 'Warehouse',
        component: warehousePage,
        path: '/warehouse/:id?',
        props: true
    },
    {
        name: 'WarehouseForm',
        component: warehouseForm,
        path: '/warehouseForm/:id',
        props: true
    },
    {
        name: 'WarehouseFormCategory',
        component: warehouseFormCategory,
        path: '/warehouseFormCategory',
    },
    {
        name: 'WarehouseQRModule',
        component: warehouseQRModule,
        path: '/warehouseQRModule/:id',
        props: true
    },
    {
        name: "WarehouseFormAdd",
        component: warehouseForm, 
        path: '/warehouseForm/-1',
        props: true
    },
    {
        name: "WarehouseEmployeesPage",
        component: employeesPage,
        path: '/warehouseEmployees',
    },
    {
        name: "ScannerPage",
        component: scannerPage,
        path: "/scannerPage"
    },
    {
        name: "notfound",
        component: PageNotFound,
        path: "/:pathMatch(.*)*"
    }
]

const router = createRouter({
    history:createWebHistory(), 
    routes,
    scrollBehavior (to, from, savedPosition) { // savedPosition nie działa!
        if (savedPosition) {
            return savedPosition;
        }else{
            return { top: 0 };
        }
        
    }
})

export default router; 