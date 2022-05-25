const { build } = require("esbuild")
const { glsl } = require("esbuild-plugin-glsl")

module.exports.build = ({ incremental }) => build({
	sourcemap: true,
	entryPoints: ["src/index.ts"],
	bundle: true,
	outdir: "dist",
	incremental: incremental,
	plugins: [glsl({ minify: false })]
})
