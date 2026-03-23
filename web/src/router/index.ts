import { createRouter, createWebHistory } from "vue-router";
import LocalLobbyPage from "../pages/localrobypage.vue";
import ModeSelectPage from "../pages/ModeSelectPage.vue";
import OnlineLobbyPage from "../pages/onlinerobypage.vue";
import Battlepage from "../pages/battlepage.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            name: "mode-select",
            component: ModeSelectPage,
            alias: ["/mode-select"],
        },
        {
            path: "/local-lobby",
            name: "local-lobby",
            component: LocalLobbyPage,
            alias: ["/start"],
        },
        {
            path: "/online-lobby",
            name: "online-lobby",
            component: OnlineLobbyPage,
        },
        {
            path: "/:pathMatch(.*)*",
            redirect: { name: "mode-select" },


        }, {

            path: "/battle",
            component: () => import("../pages/battlepage.vue"),

        }
    ],
});

export default router;
