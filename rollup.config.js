import terser from '@rollup/plugin-terser';

export default [
  // ES Module build
  {
    input: 'core/ModernTable.js',
    output: {
      file: 'dist/modern-table.esm.js',
      format: 'es',
      sourcemap: true
    }
  },
  
  // UMD build (for browsers)
  {
    input: 'core/ModernTable.js',
    output: {
      file: 'dist/modern-table.js',
      format: 'umd',
      name: 'ModernTable',
      sourcemap: true,
      globals: {
        // No external dependencies
      }
    }
  },
  
  // Minified UMD build
  {
    input: 'core/ModernTable.js',
    output: {
      file: 'dist/modern-table.min.js',
      format: 'umd',
      name: 'ModernTable',
      sourcemap: true
    },
    plugins: [
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        mangle: {
          reserved: ['ModernTable']
        }
      })
    ]
  }
];