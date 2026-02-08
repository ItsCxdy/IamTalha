import React, { useEffect, useRef } from 'react';

const useFluidCursor = (canvas: HTMLCanvasElement, theme: 'dark' | 'light') => {
  if (!canvas) return;

  // Accessibility check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1440,
    CAPTURE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 3.5,
    VELOCITY_DISSIPATION: 2,
    PRESSURE: 0.1,
    PRESSURE_ITERATIONS: 20,
    CURL: 3,
    SPLAT_RADIUS: 0.2,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false,
    BACK_COLOR: { r: 0, g: 0, b: 0 },
    TRANSPARENT: true,
  };

  // Theme-based adjustments
  // Light mode: High brightness for subtractive/difference blending against white
  // Dark mode: Moderate brightness for additive blending against black
  const colorMult = theme === 'light' ? 1.0 : 0.3;

  function pointerPrototype(this: any) {
    this.id = -1;
    this.texcoordX = 0;
    this.texcoordY = 0;
    this.prevTexcoordX = 0;
    this.prevTexcoordY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.down = false;
    this.moved = false;
    this.color = [30, 0, 300]; // Initial color placeholder
  }

  const pointers: any[] = [];
  pointers.push(new (pointerPrototype as any)());

  let gl: WebGL2RenderingContext | null = null;
  let ext: any = null;
  let animationFrameId: number;
  let lastUpdateTime = Date.now();
  let colorUpdateTimer = 0.0;
  
  // State to track resources for cleanup
  const programs: any[] = [];
  const framebuffers: any[] = [];
  const textures: any[] = [];

  // --- WebGL Context Initialization ---
  function initWebGL() {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };

    // Try WebGL 2 first
    gl = canvas.getContext('webgl2', params) as WebGL2RenderingContext | null;
    const isWebGL2 = !!gl;

    if (!gl) {
      gl = (canvas.getContext('webgl', params) ||
            canvas.getContext('experimental-webgl', params)) as unknown as WebGL2RenderingContext;
    }

    if (!gl) {
      console.warn('WebGL not supported');
      return false;
    }

    let supportLinearFiltering;
    let halfFloatTexType;
    let halfFloat;

    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
      halfFloatTexType = gl.HALF_FLOAT;
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
      halfFloatTexType = halfFloat?.HALF_FLOAT_OES;
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // Format support lookup
    const formatRGBA = getSupportedFormat(gl, isWebGL2 ? gl.RGBA16F : gl.RGBA, gl.RGBA, halfFloatTexType, isWebGL2);
    const formatRG = getSupportedFormat(gl, isWebGL2 ? gl.RG16F : gl.RGBA, isWebGL2 ? gl.RG : gl.RGBA, halfFloatTexType, isWebGL2);
    const formatR = getSupportedFormat(gl, isWebGL2 ? gl.R16F : gl.RGBA, isWebGL2 ? gl.RED : gl.RGBA, halfFloatTexType, isWebGL2);

    ext = {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering,
    };

    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }
    
    return true;
  }

  function getSupportedFormat(gl: any, internalFormat: any, format: any, type: any, isWebGL2: boolean): any {
    if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
      if (isWebGL2) {
        switch (internalFormat) {
          case gl.R16F: return getSupportedFormat(gl, gl.RG16F, gl.RG, type, isWebGL2);
          case gl.RG16F: return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type, isWebGL2);
          default: return null;
        }
      } else {
        switch (internalFormat) {
          case gl.RGBA: return getSupportedFormat(gl, gl.RGBA, gl.RGBA, type, isWebGL2);
          default: return null;
        }
      }
    }
    return { internalFormat, format };
  }

  function supportRenderTextureFormat(gl: any, internalFormat: any, format: any, type: any) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    
    // Cleanup check resources
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(fbo);
    
    return status === gl.FRAMEBUFFER_COMPLETE;
  }

  // --- Shader & Program Classes ---

  class Material {
    vertexShader: any;
    fragmentShaderSource: any;
    programs: any[];
    activeProgram: any;
    uniforms: any;

    constructor(vertexShader: any, fragmentShaderSource: any) {
      this.vertexShader = vertexShader;
      this.fragmentShaderSource = fragmentShaderSource;
      this.programs = [];
      this.activeProgram = null;
      this.uniforms = [];
    }

    setKeywords(keywords: any) {
      let hash = 0;
      for (let i = 0; i < keywords.length; i++) hash += hashCode(keywords[i]);

      let program = this.programs[hash];
      if (program == null) {
        let fragmentShader = compileShader(gl!, gl!.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
        program = createProgram(gl!, this.vertexShader, fragmentShader);
        this.programs[hash] = program;
      }

      if (program == this.activeProgram) return;

      this.uniforms = getUniforms(gl!, program);
      this.activeProgram = program;
    }

    bind() {
      gl!.useProgram(this.activeProgram);
    }
  }

  class Program {
    uniforms: any;
    program: any;

    constructor(vertexShader: any, fragmentShader: any) {
      this.uniforms = {};
      this.program = createProgram(gl!, vertexShader, fragmentShader);
      this.uniforms = getUniforms(gl!, this.program);
    }

    bind() {
      gl!.useProgram(this.program);
    }
  }

  function createProgram(gl: WebGL2RenderingContext, vertexShader: any, fragmentShader: any) {
    let program = gl.createProgram();
    if (!program) throw new Error("Failed to create program");
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(program));
    }
    
    programs.push(program);
    return program;
  }

  function getUniforms(gl: WebGL2RenderingContext, program: any) {
    let uniforms: any = [];
    let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      let activeUniform = gl.getActiveUniform(program, i);
      if (activeUniform) {
        let uniformName = activeUniform.name;
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
      }
    }
    return uniforms;
  }

  function compileShader(gl: WebGL2RenderingContext, type: any, source: any, keywords?: any) {
    source = addKeywords(source, keywords);
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Failed to create shader");
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  function addKeywords(source: any, keywords: any) {
    if (keywords == null) return source;
    let keywordsString = '';
    keywords.forEach((keyword: any) => {
      keywordsString += '#define ' + keyword + '\n';
    });
    return keywordsString + source;
  }

  // --- Shaders Source ---
  // (Inlined for simplicity and self-containment)
  const baseVertexShaderSource = `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const copyShaderSource = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    void main () { gl_FragColor = texture2D(uTexture, vUv); }
  `;

  const clearShaderSource = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () { gl_FragColor = value * texture2D(uTexture, vUv); }
  `;

  const displayShaderSource = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform vec2 texelSize;
    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
    #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
    #endif
        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
    }
  `;

  const splatShaderSource = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
  `;

  const advectionShaderSource = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;
    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
    void main () {
    #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
    #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }
  `;

  const divergenceShaderSource = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
  `;

  const curlShaderSource = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
  `;

  const vorticityShaderSource = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `;

  const pressureShaderSource = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
  `;

  const gradientSubtractShaderSource = `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
  `;

  // --- Globals for simulation ---
  let blit: any;
  let dye: any;
  let velocity: any;
  let divergence: any;
  let curl: any;
  let pressure: any;

  let copyProgram: Program;
  let clearProgram: Program;
  let splatProgram: Program;
  let advectionProgram: Program;
  let divergenceProgram: Program;
  let curlProgram: Program;
  let vorticityProgram: Program;
  let pressureProgram: Program;
  let gradienSubtractProgram: Program;
  let displayMaterial: Material;
  let baseVertexShader: any;

  function initPrograms() {
    baseVertexShader = compileShader(gl!, gl!.VERTEX_SHADER, baseVertexShaderSource);
    const blurVertexShader = compileShader(gl!, gl!.VERTEX_SHADER, baseVertexShaderSource); // Reusing base for simplicity or define blur if needed
    
    copyProgram = new Program(baseVertexShader, compileShader(gl!, gl!.FRAGMENT_SHADER, copyShaderSource));
    clearProgram = new Program(baseVertexShader, compileShader(gl!, gl!.FRAGMENT_SHADER, clearShaderSource));
    splatProgram = new Program(baseVertexShader, compileShader(gl!, gl!.FRAGMENT_SHADER, splatShaderSource));
    advectionProgram = new Program(baseVertexShader, compileShader(gl!, gl!.FRAGMENT_SHADER, advectionShaderSource, ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']));
    divergenceProgram = new Program(baseVertexShader, compileShader(gl!, gl!.FRAGMENT_SHADER, divergenceShaderSource));
    curlProgram = new Program(baseVertexShader, compileShader(gl!, gl!.FRAGMENT_SHADER, curlShaderSource));
    vorticityProgram = new Program(baseVertexShader, compileShader(gl!, gl!.FRAGMENT_SHADER, vorticityShaderSource));
    pressureProgram = new Program(baseVertexShader, compileShader(gl!, gl!.FRAGMENT_SHADER, pressureShaderSource));
    gradienSubtractProgram = new Program(baseVertexShader, compileShader(gl!, gl!.FRAGMENT_SHADER, gradientSubtractShaderSource));

    displayMaterial = new Material(baseVertexShader, displayShaderSource);
  }

  function initBlit() {
    gl!.bindBuffer(gl!.ARRAY_BUFFER, gl!.createBuffer());
    gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl!.STATIC_DRAW);
    gl!.bindBuffer(gl!.ELEMENT_ARRAY_BUFFER, gl!.createBuffer());
    gl!.bufferData(gl!.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl!.STATIC_DRAW);
    gl!.vertexAttribPointer(0, 2, gl!.FLOAT, false, 0, 0);
    gl!.enableVertexAttribArray(0);

    return (target: any, clear = false) => {
      if (target == null) {
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      } else {
        gl!.viewport(0, 0, target.width, target.height);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
      }
      if (clear) {
        gl!.clearColor(0.0, 0.0, 0.0, 0.0);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
      }
      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    };
  }

  function initFramebuffers() {
    let simRes = getResolution(config.SIM_RESOLUTION);
    let dyeRes = getResolution(config.DYE_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const rg = ext.formatRG;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl!.LINEAR : gl!.NEAREST;

    gl!.disable(gl!.BLEND);

    if (dye == null)
      dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    else
      dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

    if (velocity == null)
      velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    else
      velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

    divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST);
    curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST);
    pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl!.NEAREST);
  }

  function createFBO(w: any, h: any, internalFormat: any, format: any, type: any, param: any) {
    gl!.activeTexture(gl!.TEXTURE0);
    let texture = gl!.createTexture();
    gl!.bindTexture(gl!.TEXTURE_2D, texture);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, param);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, param);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    let fbo = gl!.createFramebuffer();
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0);
    gl!.viewport(0, 0, w, h);
    gl!.clear(gl!.COLOR_BUFFER_BIT);

    let texelSizeX = 1.0 / w;
    let texelSizeY = 1.0 / h;

    textures.push(texture);
    framebuffers.push(fbo);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX,
      texelSizeY,
      attach(id: any) {
        gl!.activeTexture(gl!.TEXTURE0 + id);
        gl!.bindTexture(gl!.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  function createDoubleFBO(w: any, h: any, internalFormat: any, format: any, type: any, param: any) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = createFBO(w, h, internalFormat, format, type, param);

    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() { return fbo1; },
      set read(value) { fbo1 = value; },
      get write() { return fbo2; },
      set write(value) { fbo2 = value; },
      swap() {
        let temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      },
    };
  }

  function resizeFBO(target: any, w: any, h: any, internalFormat: any, format: any, type: any, param: any) {
    let newFBO = createFBO(w, h, internalFormat, format, type, param);
    copyProgram.bind();
    gl!.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
    blit(newFBO);
    return newFBO;
  }

  function resizeDoubleFBO(target: any, w: any, h: any, internalFormat: any, format: any, type: any, param: any) {
    if (target.width == w && target.height == h) return target;
    target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
    target.write = createFBO(w, h, internalFormat, format, type, param);
    target.width = w;
    target.height = h;
    target.texelSizeX = 1.0 / w;
    target.texelSizeY = 1.0 / h;
    return target;
  }

  function updateKeywords() {
    let displayKeywords = [];
    if (config.SHADING) displayKeywords.push('SHADING');
    displayMaterial.setKeywords(displayKeywords);
  }

  function update() {
    if (!gl) return; // Cleanup check
    
    const dt = calcDeltaTime();
    
    // Resize check moved inside update loop for simplicity, but throttled?
    // Actually, just checking if size matches.
    if (resizeCanvas()) {
        initFramebuffers();
    }

    updateColors(dt);
    applyInputs();
    step(dt);
    render(null);
    animationFrameId = requestAnimationFrame(update);
  }

  function calcDeltaTime() {
    let now = Date.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastUpdateTime = now;
    return dt;
  }

  function resizeCanvas() {
    // If canvas is not in DOM or hidden
    if (canvas.clientWidth === 0 || canvas.clientHeight === 0) return false;

    let width = scaleByPixelRatio(canvas.clientWidth);
    let height = scaleByPixelRatio(canvas.clientHeight);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  function updateColors(dt: any) {
    colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorUpdateTimer >= 1) {
      colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
      pointers.forEach((p) => {
        p.color = generateColor();
      });
    }
  }

  function applyInputs() {
    pointers.forEach((p) => {
      if (p.moved) {
        p.moved = false;
        splatPointer(p);
      }
    });
  }

  function step(dt: any) {
    gl!.disable(gl!.BLEND);

    curlProgram.bind();
    gl!.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl!.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    vorticityProgram.bind();
    gl!.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl!.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl!.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    gl!.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl!.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    divergenceProgram.bind();
    gl!.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl!.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    clearProgram.bind();
    gl!.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    gl!.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    pressureProgram.bind();
    gl!.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl!.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl!.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    gradienSubtractProgram.bind();
    gl!.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl!.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
    gl!.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    advectionProgram.bind();
    gl!.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!ext.supportLinearFiltering)
      gl!.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    let velocityId = velocity.read.attach(0);
    gl!.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
    gl!.uniform1i(advectionProgram.uniforms.uSource, velocityId);
    gl!.uniform1f(advectionProgram.uniforms.dt, dt);
    gl!.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    if (!ext.supportLinearFiltering)
      gl!.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl!.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl!.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
    gl!.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
  }

  function render(target: any) {
    gl!.blendFunc(gl!.ONE, gl!.ONE_MINUS_SRC_ALPHA);
    gl!.enable(gl!.BLEND);
    drawDisplay(target);
  }

  function drawDisplay(target: any) {
    let width = target == null ? gl!.drawingBufferWidth : target.width;
    let height = target == null ? gl!.drawingBufferHeight : target.height;

    displayMaterial.bind();
    if (config.SHADING)
      gl!.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
    gl!.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
    blit(target);
  }

  function splatPointer(pointer: any) {
    let dx = pointer.deltaX * config.SPLAT_FORCE;
    let dy = pointer.deltaY * config.SPLAT_FORCE;
    splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
  }

  function splat(x: any, y: any, dx: any, dy: any, color: any) {
    splatProgram.bind();
    gl!.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl!.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    gl!.uniform2f(splatProgram.uniforms.point, x, y);
    gl!.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
    gl!.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
    blit(velocity.write);
    velocity.swap();

    gl!.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    gl!.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(dye.write);
    dye.swap();
  }

  function correctRadius(radius: any) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) radius *= aspectRatio;
    return radius;
  }
  
  // Helpers
  function generateColor() {
    let c = HSVtoRGB(Math.random(), 1.0, 1.0);
    c.r *= colorMult;
    c.g *= colorMult;
    c.b *= colorMult;
    return c;
  }
  
  function HSVtoRGB(h: any, s: any, v: any) {
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    return { r, g, b };
  }
  
  function wrap(value: any, min: any, max: any) {
    const range = max - min;
    if (range == 0) return min;
    return ((value - min) % range) + min;
  }
  
  function getResolution(resolution: any) {
    let aspectRatio = gl!.drawingBufferWidth / gl!.drawingBufferHeight;
    if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);
    if (gl!.drawingBufferWidth > gl!.drawingBufferHeight) return { width: max, height: min };
    else return { width: min, height: max };
  }
  
  function scaleByPixelRatio(input: any) {
    const pixelRatio = window.devicePixelRatio || 1;
    return Math.floor(input * pixelRatio);
  }
  
  function hashCode(s: any) {
    if (s.length == 0) return 0;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = (hash << 5) - hash + s.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  // --- Input Listeners ---
  const listeners: { target: Window | HTMLElement; event: string; handler: any }[] = [];
  const addListener = (target: Window | HTMLElement, event: string, handler: any) => {
    target.addEventListener(event, handler);
    listeners.push({ target, event, handler });
  };
  
  const mousemoveHandler = (e: any) => {
    let pointer = pointers[0];
    let posX = scaleByPixelRatio(e.clientX);
    let posY = scaleByPixelRatio(e.clientY);
    
    // Update pointer logic
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
  };
  
  function correctDeltaX(delta: any) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
  }
  function correctDeltaY(delta: any) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
  }

  // --- BOOTSTRAP ---
  if (initWebGL()) {
      blit = initBlit();
      initPrograms();
      initFramebuffers();
      updateKeywords();
      
      // Events
      addListener(window, 'mousemove', mousemoveHandler);
      // Touch events ommitted for brevity, assume similar logic if needed or can be added back
      // Keeping it simple to fix the core crash first.

      // Start loop
      update();
  }

  // Cleanup
  return () => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    listeners.forEach(({ target, event, handler }) => {
      target.removeEventListener(event, handler);
    });
    
    // Manual Resource Cleanup
    // This is crucial for theme switching to not hit context limit
    if (gl) {
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) {
        loseContext.loseContext();
      }
    }
  };
};

const FluidBackground = ({ theme }: { theme: 'dark' | 'light' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Delay start slightly to ensure layout is settled
    const timeoutId = setTimeout(() => {
        // We track cleanup separately
    }, 0);

    const cleanup = useFluidCursor(canvas, theme);
    
    return () => {
        cleanup();
        clearTimeout(timeoutId);
    }
  }, [theme]); 

  // Use mix-blend-exclusion for light mode to create visible 'ink' effect
  // Use mix-blend-screen for dark mode to create 'glow' effect
  const blendMode = theme === 'dark' ? 'mix-blend-screen' : 'mix-blend-exclusion';

  return <canvas ref={canvasRef} className={`fixed inset-0 z-[1] pointer-events-none w-full h-full ${blendMode}`} />;
};

export default FluidBackground;