- read https://fireship.io/snippets/svelte-electron-setup/

```bash
npx create-electron-app electron-app
cd electron-app
```

- delete index.html and index.css

- create public with favicon.png and global.css
- put this in public/index.html:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf8" />
    <meta name="viewport" content="width=device-width" />

    <title>Svelte app</title>

    <link rel="icon" type="image/png" href="favicon.png" />
    <link rel="stylesheet" href="./global.css" />
    <link rel="stylesheet" href="./build/bundle.css" />
  </head>

  <body>
    <script src="./build/bundle.js"></script>
  </body>
</html>
```

- add packages

```bash
yarn global add sirv-cli
yarn add concurrently electron-reload
yarn add svelte
yarn add -D svelte-loader rollup @rollup/plugin-commonjs @rollup/plugin-node-resolve
yarn add -D rollup-plugin-livereload rollup-plugin-postcss rollup-plugin-svelte rollup-plugin-terser

```

- add scripts to package.json

```json
"scripts": {
    "start": "concurrently \"npm:svelte-dev\" \"electron-forge start\"",
    "svelte-build": "rollup -c",
    "svelte-dev": "rollup -c -w",
    "svelte-start": "sirv public"
  },
```

## Install tailwind

```bash
yarn add -D autoprefixer postcss postcss-cli postcss-import@12 postcss-nested
yarn add -D tailwindcss
```

- create a file src/Tailwind.svelte

```svelte
<style global lang="postcss">
  /* only apply purgecss on utilities, per Tailwind docs */ /* purgecss start
  ignore */ @tailwind base; @tailwind components; /* purgecss end ignore */
  @tailwind utilities;
</style>
```

- modify App.svelte

```svelte
<script>
  import Tailwind from "./Tailwind.svelte";

  export let name;
</script>

<style lang="postcss">
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;

      .tw {
        @apply font-sans text-lg text-center text-green-800;
      }
    }
  }
</style>

<Tailwind />
<main>
  <h1>Hello {name}!</h1>
  <p class="tw">tailwind included<span class="text-red-800">!</span></p>
  <p>
    Visit the
    <a href="https://svelte.dev/tutorial">Svelte tutorial</a>
    to learn how to build Svelte apps.
  </p>
</main>
```

- add rollup.config.js

```javascript
import svelte from 'rollup-plugin-svelte'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import { terser } from 'rollup-plugin-terser'
import postcss from 'rollup-plugin-postcss'
import sveltePreprocess from 'svelte-preprocess'

const production = !process.env.ROLLUP_WATCH

function serve() {
  let server

  function toExit() {
    if (server) server.kill(0)
  }

  return {
    writeBundle() {
      if (server) return
      server = require('child_process').spawn(
        'npm',
        ['run', 'svelte-start', '--', '--dev'],
        {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        },
      )

      process.on('SIGTERM', toExit)
      process.on('exit', toExit)
    },
  }
}

export default {
  input: 'src/svelte.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js',
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess({
        // https://github.com/kaisermann/svelte-preprocess/#user-content-options
        sourceMap: !production,
        postcss: {
          plugins: [
            require('tailwindcss'),
            require('autoprefixer'),
            require('postcss-nested'),
          ],
        },
      }),
      // enable run-time checks when not in production
      dev: !production,
      // we'll extract any component CSS out into
      // a separate file - better for performance
      css: (css) => {
        css.write('bundle.css')
      },
    }),
    postcss({
      extract: 'public/utils.css',
    }),
    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),

    // In dev mode, call `npm run start` once
    // the bundle has been generated
    !production && serve(),

    // Watch the `public` directory and refresh the
    // browser on changes when not in production
    !production && livereload('public'),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
}
```
