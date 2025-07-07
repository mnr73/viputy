import { defineConfig } from 'vitepress';
import tailwindcss from '@tailwindcss/vite';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  title: 'Viputy',
  description: 'Simple and useful input components for vue3 + tailwind4',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'Components', link: '/components' }
    ],

    sidebar: {
      '/guide/': [
        {
          items: [
            { text: 'What is Viputy', link: '/guide' },
            { text: 'Installation', link: '/guide/installation' }
          ]
        }
      ],
      '/components/': [
        {
          items: [
            { text: 'Component Architecture', link: '/components' },
            { text: 'ViInput', link: '/components/input' },
            { text: 'ViSelect', link: '/components/select' },
            { text: 'ViSimpleSelect', link: '/components/simple-select' },
            { text: 'Checkbox & Radio', link: '/components/checkbox-radio' },
            { text: 'ViTag', link: '/components/tag' },
            { text: 'ViText', link: '/components/text' },
            { text: 'ViSimpleDate', link: '/components/simpledate' },
            { text: 'ViDropdown', link: '/components/dropdown' },
            { text: 'ViFrame', link: '/components/frame' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
});
