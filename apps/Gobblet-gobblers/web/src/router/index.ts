import { createRouter, createWebHistory } from "vue-router";
import ModeSelectPage from "../pages/ModeSelectPage.vue";
import StartPage from "../pages/StartPage.vue";
import ResultPage from "../pages/ResultPage.vue";
import UserCreate from "../pages/UserCreate.vue";
import BattlePage from "../pages/BattlePage.vue";
import OnlineLobbyPage from "../pages/OnlineLobbyPage.vue";
import OnlineBattlePage from "../pages/OnlineBattlePage.vue";

const routes = [
    {
        path: "/",
        component: ModeSelectPage,
    },
    {
        path: "/start",
        component: StartPage,
    },
    {
        path: "/result",
        component: ResultPage,
    },
    {
        path: "/battle",
        component: BattlePage,
    },
    {
        path: "/online",
        component: OnlineLobbyPage,
    },
    {
        path: "/online/room/:roomId",
        component: OnlineBattlePage,
    },
    {
        path: "/user",
        component: UserCreate,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;