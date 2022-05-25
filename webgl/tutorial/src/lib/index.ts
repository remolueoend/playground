import { Ctx } from "../lib"

type RenderObjectUniform<T> = {
    loc: number
    loader: (loc: WebGLUniformLocation, value: T) => void
}

let gl: WebGLRenderingContext
let u: RenderObjectUniform<number> = {
    loc: 1,
    loader: gl.uniform1f,
}
const x = f({ foo: u })

type RenderObjectAttributes<Attributes extends string> = {
    [A in Attributes]: {
        loc: number
        buffer: WebGLBuffer
        vecSize: number
        elemType: number
        offset: number
        stride: number
    }
}

type RenderObject<
    UniformTypes,
    Uniforms extends [string, UniformTypes],
    Attributes extends string,
> = {
    program: Program<Uniforms, Attributes>
}
type Program<
    UniformTyes,
    Uniforms extends [string, UniformTyes],
    Attributes extends string,
> = {
    wglProgram: WebGLProgram
}

export function renderObject<
    Attributes extends string,
    Uniforms extends string,
>({ gl }: Ctx, obj: RenderObject<Uniforms, Attributes>) {
    const wglProg = obj.program.wglProgram
    gl.useProgram(wglProg)
    for (const attrName in obj.attributes) {
        const attr = obj.attributes[attrName]
        gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer)
        gl.vertexAttribPointer(
            attr.loc,
            attr.vecSize,
            attr.elemType,
            false,
            attr.stride,
            attr.offset,
        )
        gl.enableVertexAttribArray(attr.loc)
    }

    for (const uniformName in obj.uniforms) {
        const uniform = obj.uniforms[uniformName as Extract<Uniforms, string>]

        gl.uniform1f(uniform.loc, 1)
    }
}
