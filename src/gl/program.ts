import { ext_vao, gl } from "./canvas";

function compileShader(type: number, source: string) {
  const shader = gl.createShader(type)!;
  try {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader)!);
    }
  } catch (e) {
    gl.deleteShader(shader);
    throw e;
  }
  return shader;
}

const stack: Program[] = [];

export default class Program {
  #program?: WebGLProgram;
  #attributes = new Map<string, number>();
  #uniforms = new Map<string, WebGLUniformLocation | null>();
  #vaos = new Map<string, WebGLVertexArrayObjectOES>();

  constructor() {}

  recompile(vert: string, frag: string) {
    this.#attributes.clear();
    this.#uniforms.clear();
    for (const [, vao] of this.#vaos) {
      ext_vao.deleteVertexArrayOES(vao);
    }
    this.#vaos.clear();
    this.#program = gl.createProgram()!;
    try {
      gl.attachShader(this.#program, compileShader(gl.VERTEX_SHADER, vert));
      gl.attachShader(this.#program, compileShader(gl.FRAGMENT_SHADER, frag));
      gl.linkProgram(this.#program);
      if (!gl.getProgramParameter(this.#program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(this.#program)!);
      }
    } catch (e) {
      gl.deleteProgram(this.#program);
      throw e;
    }
  }

  attribute(name: string): number {
    return (
      this.#attributes.get(name) ??
      (() => {
        const ret = gl.getAttribLocation(this.#program!, name);
        this.#attributes.set(name, ret);
        return ret;
      })()
    );
  }

  uniform(name: string): WebGLUniformLocation | null {
    return this.#uniforms.has(name)
      ? this.#uniforms.get(name)!
      : (() => {
          const ret = gl.getUniformLocation(this.#program!, name);
          this.#uniforms.set(name, ret);
          return ret;
        })();
  }

  delete_vao(id: string) {
    const vao = this.#vaos.get(id);
    if (vao) {
      this.#vaos.delete(id);
      ext_vao.deleteVertexArrayOES(vao);
    }
  }

  vao(
    id: string,
    initializer?: (vao: WebGLVertexArrayObjectOES) => void
  ) {
    const got = this.#vaos.get(id);
    if (got) {
      ext_vao.bindVertexArrayOES(got);
    } else {
      const ret = ext_vao.createVertexArrayOES()!;
      ext_vao.bindVertexArrayOES(ret);
      initializer?.(ret);
      this.#vaos.set(id, ret);
    }
  }

  use(cb: () => void) {
    stack.unshift(this);
    gl.useProgram(this.#program!);
    cb();
    stack.shift();
  }

  static get current() {
    return stack[0];
  }
}
