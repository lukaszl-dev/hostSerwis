import home_page from "./components/homePage.vue";
import PageNotFound from "./components/errors/PageNotFound.vue";
import warehousePage from "./components/warehousePage.vue";
import warehouseForm from "./components/warehousePage/warehouseForm.vue";
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
        path: '/warehouse',
    },
    {
        name: 'WarehouseForm',
        component: warehouseForm,
        path: '/warehouseForm/id=:id',
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