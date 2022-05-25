const esBuildDevServer = require("esbuild-dev-server")
const { build } = require("./esbuild.config")

esBuildDevServer.start(
	build({ incremental: true }),
	{
		port: "8080", // optional, default: 8080
		watchDir: "src", // optional, default: "src"
		index: "public/index.html", // optional
		staticDir: ".", // optional
		onBeforeRebuild: {}, // optional
		onAfterRebuild: {}, // optional
	}
)