import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { jsxImagePlugin } from "./vite-plugins/vite-plugin-react-jsx-image/index.ts"; // .ts extension makes vite configLoader happy

export default defineConfig({
  plugins: [jsxImagePlugin(), tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
