import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) }
    },
    build: {
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
            fileName: "index",
            cssFileName: "viputy"
        },
        rollupOptions: { external: ["vue"] }
    },
    test: { environment: "happy-dom", include: ["tests/**/*.test.ts"] }
});
