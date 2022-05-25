import { Ctx } from "./lib"
import { vec4, vec2, vec3, mat3 } from "gl-matrix"

const mat3ZERO = () => mat3.fromValues(0, 0, 0, 0, 0, 0, 0, 0, 0)

function concatArrayOfFloat32Arrays(bufs: (vec2 | vec4 | mat3)[]) {
    // https://stackoverflow.com/questions/4554252/typed-arrays-in-gecko-2-float32array-concatenation-and-expansion
    function sum(a) {
        return a.reduce(function (a, b) {
            return a + b
        }, 0)
    }
    var lens = bufs.map(function (a) {
        return a.length
    })
    var aout = new Float32Array(sum(lens))
    for (var i = 0; i < bufs.length; ++i) {
        var start = sum(lens.slice(0, i))
        aout.set(bufs[i], start)
    }
    return aout
}

const trans2 = (vec: vec2) => (m: mat3) => mat3.translate(m, m, vec)
const rot2 = (rad: number) => (m: mat3) => mat3.rotate(m, m, rad)
const scale2 = (f: vec2) => (m: mat3) => mat3.scale(m, m, f)

type Drawer = (ctx: Ctx) => void

const pt2 = (x: number, y: number) => vec2.fromValues(x, y)
const color = (r: number, g: number, b: number, a: number): vec4 =>
    vec4.fromValues(r, g, b, a)

function drawVertices(
    { gl, attrs }: Ctx,
    verts: [vec2, vec4][],
    transforms: ((m: mat3) => mat3)[],
) {
    const vecSize = 2
    const posValues = concatArrayOfFloat32Arrays(verts.map((v) => v[0]))
    const colorValues = concatArrayOfFloat32Arrays(verts.map((v) => v[1]))

    // positions
    const posBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posValues), gl.STATIC_DRAW)
    gl.vertexAttribPointer(attrs.a_position, vecSize, gl.FLOAT, false, 0, 0)

    // colors
    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(colorValues),
        gl.STATIC_DRAW,
    )
    gl.vertexAttribPointer(attrs.a_color, 4, gl.FLOAT, false, 0, 0)

    // transformations

    let transform = mat3.identity(mat3ZERO())
    transforms.reverse()
    transforms.reduce((acc, t) => {
        return mat3.mul(acc, acc, t(acc))
    }, transform)
    console.log(transform)
    const transformBuffer = gl.createBuffer()
    // gl.bindBuffer(gl.ARRAY_BUFFER, transformBuffer)
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(transform), gl.STATIC_DRAW)
    gl.uniformMatrix3fv(attrs.u_transform, false, transform)

    gl.drawArrays(gl.TRIANGLES, 0, verts.length)
}

export const drawTriangle: Drawer = (ctx) => {
    drawVertices(
        ctx,
        [
            [pt2(0, 0), color(1, 0, 0, 1)],
            [pt2(100, 0), color(0, 1, 0, 1)],
            [pt2(0, 100), color(0, 0, 1, 1)],
        ],
        [scale2(pt2(0.5, 0.5)), trans2(pt2(50, 50))],
    )
}

// export const drawRandomRectangles =
//     (count: number): Drawer =>
//     ({ gl, program }: Ctx, posAttrLocation, colorAttrLocation) => {
//         function createRectBuffer(
//             x: number,
//             y: number,
//             width: number,
//             height: number,
//         ) {
//             const x1 = x
//             const x2 = x + width
//             const y1 = y
//             const y2 = y + height

//             return new Float32Array([
//                 x1,
//                 y1,
//                 x2,
//                 y1,
//                 x1,
//                 y2,
//                 x1,
//                 y2,
//                 x2,
//                 y1,
//                 x2,
//                 y2,
//             ])
//         }

//         function randomInt(range: number) {
//             return Math.floor(Math.random() * range)
//         }

//         const size = 2
//         const type = gl.FLOAT
//         const normalize = false
//         const stride = 0
//         const offset = 0
//         gl.vertexAttribPointer(
//             posAttrLocation,
//             size,
//             type,
//             normalize,
//             stride,
//             offset,
//         )

//         const primitiveType = gl.TRIANGLES

//         for (let i = 0; i < count; i++) {
//             const rectPositions = createRectBuffer(
//                 randomInt(300),
//                 randomInt(300),
//                 randomInt(300),
//                 randomInt(300),
//             )
//             gl.bufferData(gl.ARRAY_BUFFER, rectPositions, gl.STATIC_DRAW)

//             gl.uniform4f(
//                 colorAttrLocation,
//                 Math.random(),
//                 Math.random(),
//                 Math.random(),
//                 2,
//             )

//             gl.drawArrays(primitiveType, offset, 6)
//         }
//     }
