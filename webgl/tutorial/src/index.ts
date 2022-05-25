import { drawTriangle } from "./draw"
import { getShaderSource, initGl } from "./lib"
import { WebGLUtils } from "./types"
const vertexShaderSource = require("./shaders/vertex.glsl")
const fragmentShaderSource = require("./shaders/fragment.glsl")

declare global {
    interface Window {
        webglUtils: WebGLUtils
    }
}

const canvas = document.querySelector("#main") as HTMLCanvasElement
const ctx = initGl(canvas, vertexShaderSource, fragmentShaderSource)
const gl = ctx.gl
gl.clearColor(0, 0, 0, 0)
gl.clear(gl.COLOR_BUFFER_BIT)

render()

function render() {
    setResolution()
    drawTriangle(ctx)
    // draw(ctx, drawRandomRectangles(50))
}

function setResolution() {
    window.webglUtils.resizeCanvasToDisplaySize(gl.canvas)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.uniform2f(ctx.attrs.u_resolution, gl.canvas.width, gl.canvas.height)
}
