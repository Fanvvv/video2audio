import type { App } from "vue"

const components = import.meta.glob("../components/**/*.vue", { eager: true })

export default {
    install(app: App) {
        Object.entries(components).forEach(([path, module]) => {
            const componentName = path.split("/").pop()?.split(".")[0]
            if (componentName) {
                app.component(componentName, (module as any).default)
            }
        })
    },
}
