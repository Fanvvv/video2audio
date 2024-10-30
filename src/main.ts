import { createApp } from "vue"
import App from "./App.vue"

import "virtual:uno.css"
import "./styles/style.css"
import components from "@/utils/components"

createApp(App)
    .use(components)
    .mount("#app")
    .$nextTick(() => {
        postMessage({ payload: "removeLoading" }, "*")
    })
