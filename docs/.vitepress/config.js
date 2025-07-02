import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Viputy',
  description: 'Simple and useful input components for vue3 + tailwind4',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Examples', link: '/markdown-examples' },
      { text: 'Guide', link: '/guide' }
    ],

    sidebar: {
      '/guide/': [
        {
          items: [
            { text: 'What is Viputy', link: '/guide' },
            { text: 'Installation', link: '/guide/installation' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
});
