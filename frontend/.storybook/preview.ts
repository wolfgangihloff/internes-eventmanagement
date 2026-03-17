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
        order: [
          'Start',
          ['Einführung'],
          'Produkt',
          ['Produkthandbuch', 'Szenarien & Akzeptanzkriterien', 'Agentic Coding — Lessons Learned'],
          'Frontend',
          ['Überblick'],
          'Backend',
          ['Überblick', 'API-Oberfläche', 'Rollen und Berechtigungen'],
          'Infrastruktur',
          ['Hetzner & k3s Baseline'],
          'Operations',
          ['CI-CD Pipeline'],
          'Backlog',
          ['Übersicht', 'Epic Backup & Restore', 'Epic Logging & Monitoring', 'Epic KI-Funktionen'],
        ],
      },
    },
  },
};

export default preview;
