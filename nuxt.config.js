import webpack from 'webpack';
import middleware from './middleware.config';
import { getRoutes } from './routes';

const {
  integrations: {
    magento: {
      configuration: {
        cookies,
        externalCheckout,
        tax,
        defaultStore,
        websites,
      },
    },
  },
} = middleware;

export default {
  ssr: true,
  dev: process.env.NODE_ENV !== 'production',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'crossorigin',
      },
      {
        rel: 'preload',
        href: 'https://fonts.googleapis.com/css?family=Raleway:300,400,400i,500,600,700|Roboto:300,300i,400,400i,500,700&display=swap',
        as: 'style',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Raleway:300,400,400i,500,600,700|Roboto:300,300i,400,400i,500,700&display=swap',
        media: 'print',
        onload: 'this.media=\'all\'',
      },
    ],
  },
  loading: { color: '#fff' },
  plugins: [
   {
      src: '~/plugins/bonavuenture',
      ssr: false,
    },
    {
      src: '~/plugins/domPurify.js',
      ssr: false,
    },
  ],
  buildModules: [
    // to core
    ['@nuxt/typescript-build', {
      typeCheck: false,
    }],
    '@nuxtjs/style-resources',
    '@nuxtjs/pwa',
    '@nuxtjs/tailwindcss',
    ['@vue-storefront/nuxt', {
      useRawSource: {
        dev: [
          '@vue-storefront/magento',
          '@vue-storefront/core',
        ],
        prod: [
          '@vue-storefront/magento',
          '@vue-storefront/core',
        ],
      },
    }],
    ['@vue-storefront/nuxt-theme', {
      routes: false,
    }],
    ['@vue-storefront/magento/nuxt', {
      i18n: {
        useNuxtI18nConfig: true,
      },
      cookies,
      externalCheckout,
      tax,
      defaultStore,
      websites,
    }],
  ],
  modules: [
    'nuxt-i18n',
    'cookie-universal-nuxt',
    'vue-scrollto/nuxt',
    '@vue-storefront/middleware/nuxt',
  ],
  i18n: {
    currency: 'USD',
    country: 'US',
    currencies: [
      {
        name: 'EUR',
        label: 'Euro',
      },
      {
        name: 'USD',
        label: 'Dollar',
      },
    ],
    locales: [
      {
        code: 'en',
        label: 'English',
        file: 'en.js',
        iso: 'en',
      },
    ],
    defaultLocale: 'en',
    lazy: true,
    seo: true,
    langDir: 'lang/',
    vueI18n: {
      fallbackLocale: 'en',
      numberFormats: {
        en: {
          currency: {
            style: 'currency',
            currency: 'USD',
            currencyDisplay: 'symbol',
          },
        },
      },
    },
    detectBrowserLanguage: {
      cookieKey: 'vsf-locale',
    },
  },
  styleResources: {
    scss: [
      require.resolve('@storefront-ui/shared/styles/_helpers.scss', { paths: [process.cwd()] }),
    ],
  },
  build: {
    cache: true,
    babel: {
      plugins: [
        ['@babel/plugin-proposal-private-methods', { loose: true }]
      ],
    },
    postcss: {
      plugins: {
        'postcss-import': {},
        'postcss-url': {},
        'postcss-preset-env': {
          features: { 'nesting-rules': false }
        },
      },
    },
    extend(config, ctx) {
      // eslint-disable-next-line no-param-reassign
      config.devtool = ctx.isClient ? 'eval-source-map' : 'inline-source-map';

      if (ctx && ctx.isClient) {
        config.optimization = {
          ...config.optimization,
          mergeDuplicateChunks: true,
          splitChunks: {
            ...config.optimization.splitChunks,
            chunks: 'all',
            automaticNameDelimiter: '.',
            maxSize: 128_000,
            maxInitialRequests: Number.POSITIVE_INFINITY,
            minSize: 0,
            maxAsyncRequests: 10,
            cacheGroups: {
              vendor: {
                test: /[/\\]node_modules[/\\]/,
                name: (module) => `${module
                  .context
                  .match(/[/\\]node_modules[/\\](.*?)([/\\]|$)/)[1]
                  .replace(/[.@_]/gm, '')}`,
              },
              graphql: {
                test: /[/\\]node_modules[/\\](apollo-cache-inmemory|apollo-client|graphql|apollo-link|apollo-link-context|apollo-link-http|apollo-link-ws|apollo-utilities)[/\\]/,
                name: 'graphql',
                reuseExistingChunk: true,
              },
            },
          },
        };
      }
    },
    transpile: [
      'vee-validate/dist/rules',
    ],
    plugins: [
      new webpack.DefinePlugin({
        'process.VERSION': JSON.stringify({
          // eslint-disable-next-line global-require
          version: require('./package.json').version,
          lastCommit: process.env.LAST_COMMIT || '',
        }),
      }),
    ],
  },
  router: {
    extendRoutes(routes) {
      getRoutes(`${__dirname}`).forEach((route) => routes.unshift(route));
    },
  },
};
