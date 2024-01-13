// import dts from 'bun-plugin-dts'
export {}

await Bun.build({
  entrypoints: ['./src/index.js'],
  outdir: './dist',
  // plugins: [dts()],
})
