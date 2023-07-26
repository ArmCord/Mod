import serve from 'rollup-plugin-serve';
import { nodeResolve } from '@rollup/plugin-node-resolve';
const prod = !process.env.ROLLUP_WATCH;
export default [{
    input: './src/index.js',
    output: {
      file: './dist/bundle.js',
      format: 'iife',
      name: 'smartcord',
      freeze: false, 
      sourcemap: false,
      compact: true,
    },
    plugins: [
        !prod && serve({
            contentBase: 'dist',
            port: 1234,
            headers: {
              'Access-Control-Allow-Origin': '*',
            }
          }), nodeResolve()
    ]
  }];
  