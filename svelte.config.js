import adapter from "@sveltejs/adapter-vercel"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter({
      runtime: "experimental_bun1.x"
    }),

    alias: {
      "@/*": "./src/*",
      "@ui/*": "./src/lib/components/ui/*"
    },

    typescript: {
      config: (config) => ({
        ...config,
        include: config.include.concat(["src/**/*.ts", "*.ts"])
      })
    },

    experimental: {
      remoteFunctions: true
    }
  },
  compilerOptions: {
    // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
    runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
    experimental: {
      async: true
    }
  },
  vitePlugin: {
    inspector: {
      toggleKeyCombo: "alt-x",
      showToggleButton: "active",
      toggleButtonPos: "bottom-right"
    }
  }
}

export default config
