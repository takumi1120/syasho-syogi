import { createRouter, createWebHashHistory } from "vue-router";
import LocalLobbyPage from "../pages/localrobypage.vue";
import ModeSelectPage from "../pages/ModeSelectPage.vue";
import OnlineLobbyPage from "../pages/onlinerobypage.vue";
import OnlineUserEntryPage from "../pages/OnlineUserEntryPage.vue";

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "mode-select",
            component: ModeSelectPage,
            alias: ["/mode-select"],
        },

        {
            path: "/onlinebattle",
            component: () => import("../pages/OnlineBattlePage.vue"),

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

        },
        {
            path: "/online-user-entry",
            name: "online-user-entry",
            component: OnlineUserEntryPage,
        },
    ],
});

export default router;
