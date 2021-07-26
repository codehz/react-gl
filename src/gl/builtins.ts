import { gl, ext_vao } from "./canvas";
import { apply, DiffResult } from "./diff";
import type { RenderNode, RenderRoot } from "./reconciler";
import { Color } from "./types";

export abstract class BuiltinNode<Tag extends string> implements RenderNode {
  readonly tag: Tag;
  abstract readonly props: any;
  hidden = false;
  #root?: RenderRoot;

  constructor(tag: Tag) {
    this.tag = tag;
  }
  get children(): RenderNode[] {
    throw new Error(this.tag + " cannot have children");
  }
  notifyChildren(): void {}
  updateProps(diff: DiffResult): void {
    apply(diff, this.props);
  }
  mount(root: RenderRoot): void {
    this.#root = root;
  }
  unmount(): void {}
  commit(): void {}
  render(): void {}
  get root() {
    return this.#root;
  }
}

abstract class NodeWithChildren<Tag extends string> extends BuiltinNode<Tag> {
  #children: RenderNode[] = [];
  get children() {
    return this.#children;
  }
}

class reset extends BuiltinNode<"reset"> {
  static defaultProps = { color: [0, 0, 0, 0] as Color };
  readonly props: { color: Color } = reset.defaultProps;
  constructor() {
    super("reset");
  }

  render() {
    gl.clearColor(
      this.props.color[0],
      this.props.color[1],
      this.props.color[2],
      this.props.color[3]
    );
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
}

class vao extends NodeWithChildren<"vao"> {
  props: {} = {};

  #object?: WebGLVertexArrayObjectOES;

  constructor() {
    super("vao");
  }

  render() {
    ext_vao.bindVertexArrayOES(this.#object!);
  }

  mount() {
    this.#object = ext_vao.createVertexArrayOES()!;
    ext_vao.bindVertexArrayOES(this.#object!);
    for (const child of this.children) {
      child.render();
    }
    ext_vao.bindVertexArrayOES(null);
  }

  notifyChildren() {
    if (!!this.#object) {
      ext_vao.deleteVertexArrayOES(this.#object);
      this.mount();
    }
  }

  unmount() {
    if (this.#object) ext_vao.deleteVertexArrayOES(this.#object);
  }
}

class buffer extends BuiltinNode<"buffer"> {
  props: {
    target?: "array" | "element_array";
    usage?: "static" | "dynamic" | "stream";
    data: TypedArray;
  } = {} as any;
  #object?: WebGLBuffer;
  constructor() {
    super("buffer");
  }

  get target() {
    return this.props.target === "element_array"
      ? gl.ELEMENT_ARRAY_BUFFER
      : gl.ARRAY_BUFFER;
  }

  get usage() {
    return this.props.usage === "static"
      ? gl.STATIC_DRAW
      : this.props.usage === "dynamic"
      ? gl.DYNAMIC_DRAW
      : gl.STREAM_DRAW;
  }

  mount() {
    this.#object = gl.createBuffer()!;
    gl.bindBuffer(this.target, this.#object);
    gl.bufferData(this.target, this.props.data, this.usage);
    gl.bindBuffer(this.target, null);
  }

  render() {
    gl.bindBuffer(this.target, this.#object!);
  }

  unmount() {
    gl.deleteBuffer(this.#object!);
  }
}

class attrib extends BuiltinNode<"attrib"> {
  props:
    | { index: number; fixed: true; value: Float32Array }
    | {
        index: number;
        size: 1 | 2 | 3 | 4;
        type: "byte" | "short" | "unsigned byte" | "unsigned short" | "float";
        normalized?: boolean;
        stride?: number;
        offset?: number;
      } = {} as any;

  #buffer?: WebGLBuffer;

  constructor() {
    super("attrib");
  }

  unmount() {
    if (this.#buffer) {
      gl.deleteBuffer(this.#buffer);
    }
  }

  render() {
    if ("fixed" in this.props) {
      if (this.props.value.length == 1) {
        gl.vertexAttrib1fv(this.props.index, this.props.value);
      } else if (this.props.value.length == 2) {
        gl.vertexAttrib2fv(this.props.index, this.props.value);
      } else if (this.props.value.length == 3) {
        gl.vertexAttrib3fv(this.props.index, this.props.value);
      } else if (this.props.value.length == 4) {
        gl.vertexAttrib4fv(this.props.index, this.props.value);
      } else {
        throw new Error("unsupported attrib size");
      }
    } else {
      gl.enableVertexAttribArray(this.props.index);
      gl.vertexAttribPointer(
        this.props.index,
        this.props.size,
        this.props.type === "byte"
          ? gl.BYTE
          : this.props.type === "short"
          ? gl.SHORT
          : this.props.type === "unsigned byte"
          ? gl.UNSIGNED_BYTE
          : this.props.type === "unsigned short"
          ? gl.UNSIGNED_SHORT
          : gl.FLOAT,
        !!this.props.normalized,
        this.props.stride ?? 0,
        this.props.offset ?? 0
      );
    }
  }
}

class uniform extends BuiltinNode<"uniform"> {
  props: {
    name: string;
    type:
      | "int"
      | "float"
      | "vec2"
      | "ivec2"
      | "vec3"
      | "ivec3"
      | "vec4"
      | "ivec4"
      | "mat2"
      | "mat3"
      | "mat4";
    transpose?: boolean;
    value: any;
  } = {} as any;

  constructor() {
    super("uniform");
  }

  render() {
    if (this.props.type === "int") {
      gl.uniform1i(this.props.name, this.props.value);
    } else if (this.props.type === "float") {
      gl.uniform1f(this.props.name, this.props.value);
    } else if (this.props.type === "vec2") {
      gl.uniform2fv(this.props.name, this.props.value);
    } else if (this.props.type === "ivec2") {
      gl.uniform2iv(this.props.name, this.props.value);
    } else if (this.props.type === "vec3") {
      gl.uniform3fv(this.props.name, this.props.value);
    } else if (this.props.type === "ivec3") {
      gl.uniform3iv(this.props.name, this.props.value);
    } else if (this.props.type === "vec4") {
      gl.uniform4fv(this.props.name, this.props.value);
    } else if (this.props.type === "ivec4") {
      gl.uniform4iv(this.props.name, this.props.value);
    } else if (this.props.type === "mat2") {
      gl.uniformMatrix2fv(
        this.props.name,
        !!this.props.transpose,
        this.props.value
      );
    } else if (this.props.type === "mat3") {
      gl.uniformMatrix3fv(
        this.props.name,
        !!this.props.transpose,
        this.props.value
      );
    } else if (this.props.type === "mat4") {
      gl.uniformMatrix4fv(
        this.props.name,
        !!this.props.transpose,
        this.props.value
      );
    }
  }
}

class shader extends NodeWithChildren<"shader"> {
  props: {
    vert: string;
    frag: string;
    mode:
      | "points"
      | "lines"
      | "line loop"
      | "line strip"
      | "triangles"
      | "triangle strip"
      | "triangle fan";
    offset?: number;
    count: number;
    index?: "unsigned byte" | "unsigned short";
  } = {} as any;

  #program?: WebGLProgram;

  constructor() {
    super("shader");
  }

  #compileShader(type: number, source: string) {
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

  #recompile() {
    this.#program = gl.createProgram()!;
    try {
      gl.attachShader(
        this.#program,
        this.#compileShader(gl.VERTEX_SHADER, this.props.vert)
      );
      gl.attachShader(
        this.#program,
        this.#compileShader(gl.FRAGMENT_SHADER, this.props.frag)
      );
      gl.linkProgram(this.#program);
      if (!gl.getProgramParameter(this.#program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(this.#program)!);
      }
    } catch (e) {
      gl.deleteProgram(this.#program);
      throw e;
    }
  }

  mount() {
    this.#recompile();
  }

  updateProps(diff: DiffResult) {
    super.updateProps(diff);
    if (diff.some(([path]) => path == "vert" || path == "frag")) {
      this.#recompile();
    }
  }

  get mode() {
    return this.props.mode === "points"
      ? gl.POINTS
      : this.props.mode === "lines"
      ? gl.LINES
      : this.props.mode === "line loop"
      ? gl.LINE_LOOP
      : this.props.mode === "line strip"
      ? gl.LINE_STRIP
      : this.props.mode === "triangles"
      ? gl.TRIANGLES
      : this.props.mode === "triangle strip"
      ? gl.TRIANGLE_STRIP
      : this.props.mode === "triangle fan"
      ? gl.TRIANGLE_FAN
      : -1;
  }

  render() {
    gl.useProgram(this.#program!);
    for (const child of this.children) {
      child.render();
    }
    if (!!this.props.index) {
      gl.drawElements(
        this.mode,
        this.props.count,
        this.props.index === "unsigned byte"
          ? gl.UNSIGNED_BYTE
          : gl.UNSIGNED_SHORT,
        this.props.offset ?? 0
      );
    } else {
      gl.drawArrays(this.mode, this.props.offset ?? 0, this.props.count);
    }
  }
}

const exported = {
  reset,
  shader,
  uniform,
  vao,
  attrib,
  buffer,
} as const;
export type Builtins = typeof exported;
export default exported;
