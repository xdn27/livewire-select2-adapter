import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/LivewireSelect2Adapter.js",
      name: "LivewireSelect2Adapter",
      fileName: "livewire-select2-adapter",
    },
    minify: true, // default, tapi bisa juga 'terser' jika perlu
    terserOptions: {
      compress: {
        drop_console: true, // Hapus console.* saat build untuk produksi
        drop_debugger: true,
      },
      format: {
        comments: false, // Hapus semua komentar
      },
    },
    rollupOptions: {
      external: ["jquery", "select2"],
      output: {
        globals: {
          jquery: "$",
          select2: "select2",
        },
      },
    },
  },
});
