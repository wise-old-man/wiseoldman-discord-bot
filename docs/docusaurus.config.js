/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Discord Bot - Wise Old Man',
  tagline: 'Documentation for the Wise Old Man Discord bot.',
  url: 'https://bot.wiseoldman.net/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'wise-old-man',
  projectName: 'discord-bot',
  deploymentBranch: 'deploymentBranch',
  trailingSlash: false,
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          breadcrumbs: false,
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/wise-old-man/discord-bot/tree/master/docs/'
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],
  plugins: [
    // ....
    async function myPlugin(_context, _options) {
      return {
        name: 'docusaurus-tailwindcss',
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer.
          postcssOptions.plugins.push(require('tailwindcss'));
          postcssOptions.plugins.push(require('autoprefixer'));
          return postcssOptions;
        }
      };
    }
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false
      },
      navbar: {
        title: 'Wise Old Man - Discord Bot',
        logo: {
          alt: 'Wise Old Man Logo',
          src: 'img/logo.png'
        },
        items: [
          {
            href: 'https://wiseoldman.net',
            label: 'Wise Old Man',
            position: 'right'
          },
          {
            href: 'https://github.com/wise-old-man/discord-bot',
            label: 'GitHub',
            position: 'right'
          },
          {
            href: 'https://wiseoldman.net/discord',
            label: 'Discord',
            position: 'right'
          }
        ]
      },
      prism: {
        darkTheme: require('prism-react-renderer/themes/dracula')
      }
    })
};

module.exports = config;
