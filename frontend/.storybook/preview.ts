import type { Preview } from '@storybook/react-vite'
import '../src/docs/components/docs.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    docs: {
      toc: {
        headingSelector: 'h2, h3',
      },
    },
    options: {
      storySort: {
        order: ['Start', 'Produkt', 'Backend', 'Backlog'],
      },
    },
  },
};

export default preview;
