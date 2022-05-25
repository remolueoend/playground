export type Ctx = {
    gl: WebGLRenderingContext
    program: WebGLProgram
    attrs: {
        a_color: number
        a_position: number
        u_resolution: WebGLUniformLocation
        u_transform: WebGLUniformLocation
    }
}

/**
 * @param type {"vertex" | "fragment"}
 * @returns {string}
 */
export function getShaderSource(type: "vertex" | "fragment"): string {
    return document.querySelector(`script[data-shader=${type}]`).textContent
}

/**
 * @param vertexShaderSource {string}
 * @param fragmentShaderSource {string}
 */
export function initGl(
    canvas: HTMLCanvasElement,
    vertexShaderSource: string,
    fragmentShaderSource: string,
): Ctx {
    const gl = canvas.getContext("webgl")

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSource,
    )

    const program = createProgram(gl, vertexShader, fragmentShader)

    gl.useProgram(program)

    const a_position = gl.getAttribLocation(program, "a_position")
    const a_color = gl.getAttribLocation(program, "a_color")
    const u_resolution = gl.getUniformLocation(program, "u_resolution")
    const u_transform = gl.getUniformLocation(program, "u_transform")
    gl.enableVertexAttribArray(a_position)
    gl.enableVertexAttribArray(a_color)

    gl.enable(gl.DEPTH_TEST)

    return {
        gl,
        program,
        attrs: {
            a_position,
            a_color,
            u_resolution,
            u_transform,
        },
    }
}

/**
 * @param gl {WebGLRenderingContext}
 * @params type {number}
 * @params source {string}
 * @returns {WebGLShader}
 */
export function createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string,
): WebGLShader {
    const shaderType = type === gl.VERTEX_SHADER ? "vertex" : "fragment"
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if (success) {
        return shader
    }

    console.error(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    throw new Error(`Shader [${shaderType}] compilation error`)
}

/**
 * @param gl {WebGLRenderingContext}
 * @param vertexShader {WebGLShader}
 * @param fragmentShader {WebGLShader}
 */
export function createProgram(
    gl: WebGLRenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
): WebGLProgram {
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if (success) {
        return program
    }

    console.error(gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
}
