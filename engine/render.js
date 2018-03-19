/* David Timber's FOR SALE Licence
This file is part of the project that is licensed with
"David Timber's FOR SALE Licence". See 'LICENCE' file for more info.
(c) 2018 David Timber. All rights reserved.
*/
/*global revo, window*/
/*eslint no-console: "disable"*/

(function () {
  "use strict";

  Object.defineProperties(revo.ui, {
    Render2D: {
      value: class Render2D {
        constructor () {
          var __gl, __w;
          var __conf; // Config object. state independent
          var
            __gr, // GL resources
            __wr, // Window resources
            __s; // State data for rendering effects
          var // internal functions
            __gwRenderDim,
            __prepGWT;

          __gl = __w = __gr = __wr = __s = null;
          __conf = {
            renderDim: {
              w: 0,
              h: 0
            },
            framerate: 0,
            frameInterval: 0,
            f: {
              gw: true
            }
          };

          __gwRenderDim = function () {
            return {
              w: Math.trunc(__conf.renderDim.w / 3),
              h: Math.trunc(__conf.renderDim.h / 3)
            };
          };
          __prepGWT = function () {
            __gl.bindTexture(__gl.TEXTURE_2D, __gr.f.gw.t);
            __gl.texImage2D(__gl.TEXTURE_2D, 0, __gl.LUMINANCE, gwRenderDim.w, gwRenderDim.h, 0, __gl.LUMINANCE, __gl.FLOAT, null);
            revo.glu.setNPOT(__gl);
          };

          Object.defineProperties(this, {
            attach: {
              value: function (gl, w) {
                let dropExt;

                w = w || window;
                if (!(gl instanceof w.WebGLRenderingContext)) {
                  revo.util.throwFrozen(new TypeError("'gl' is not instance of WebGLRenderingContext."));
                }
                dropExt = function (name) {
                  if (!(name in __gr.ext)) {
                    revo.util.throwFrozen(new revo.error.avail("GL ext '" + name + "' not found."));
                  }
                };

                __gl = gl;
                __w = w;

                // Check essential GL capabilty


                // TODO: init
                __wr = {};
                __gr = {
                  ext: {
                    'OES_texture_float': gl.getExtension('OES_texture_float'),
                    'OES_texture_float_linear': gl.getExtension('OES_texture_float_linear')
                  },
                  f: {}
                };
                __s = {
                  renderDimChange: false,
                  support: {},
                  render: {}
                };

                // Gravity Well
                try {
                  let gwRenderDim;

                  dropExt('OES_texture_float');
                  dropExt('OES_texture_float_linear');

                  __gr.f.gw = {
                    fb: __gl.createFramebuffer(),
                    t: __gl.createTexture()
                  };
                  gwRenderDim = __gwRenderDim();

                  if (gwRenderDim.w * gwRenderDim.h > 0) {
                    __prepGWT();
                    __s.render.gw = revo.glu.noError(__gl);
                    revo.glu.clearError(__gl);
                  }
                  else {
                    __s.render.gw = false;
                  }

                  __gl.bindFramebuffer(__gr.f.gw.fb);
                  __gl.framebufferTexture2D(__gl.FRAMEBUFFER, __gl.COLOR_ATTACHMENT0, __gl.TEXTURE_2D, __gr.f.gw.t, 0);
                  revo.glu.dropError(__gl);

                  __s.support.gravityWell = true;
                }
                catch (e) {
                  console.group("error whilst initialising gravity well");
                  console.warn(e);
                  console.groupEnd();
                  __s.support.gravityWell = false;
                }

                return this;
              },
              configurable: true
            },
            detach: {
              value: function () {
                __gl = __w = __gr = __wr = __s = null;

                // TODO: deinit

                return this;
              },
              configurable: true
            },

            conf: {
              value: {}
            },
            health: {
              value: {}
            },

            attached: {
              value: function () {
                return __gl !== null;
              },
              configurable: true
            },
            ownerWindow: {
              value: function () {
                return __w;
              },
              configurable: true
            }

          });
          Object.defineProperties(this.conf, {
            setRenderDimension: {
              value: function (w, h) {
                if (w !== 'number' || h !== 'number') {
                  revo.util.throwFrozen("arguments must be number type.");
                }
                else if (w <= 0 || h <= 0) {
                  revo.util.throwFrozen("invalid dimension.");
                }

                __conf.renderDim.w = w;
                __conf.renderDim.h = h;
                if(__s) {
                  __s.renderDimChange = true;
                }

                return this;
              },
              configurable: true
            },
            getRenderDimension: {
              value: function () {
                return {
                  w: __conf.renderDim.w,
                  h: __conf.renderDim.h
                };
              },
              configurable: true
            },
            setFramerate: {
              value: function (f) {
                if (typeof f !== 'number') {
                  revo.util.throwFrozen(new TypeError("invalid framerate."));
                }

                if (f < 0) {
                  __conf.framerate = 0;
                  __conf.frameInterval = 0;
                }
                else {
                  __conf.framerate = f;
                  __conf.frameInterval = 1000 / f;
                }

                return this;
              },
              configurable: true
            },
            getFramerate: {
              value: function () {
                return __conf.framerate;
              },
              configurable: true
            },
            setGravityWell: {
              value: function (x) {
                __conf.f.gw = x;
                return this;
              },
              configurable: true
            },
            getGravityWell: {
              value: function () {
                return __conf.f.gw;
              },
              configurable: true
            }
          });
          Object.defineProperties(this.health, {
            gravityWell: {}
          });

        }

        static optimalContextParams () {
          return {
            type: 'webgl',
            attr: {
              alpha: true,
              depth: true,
              stencil: false,
              antialias: true,
              premultipliedAlpha: false,
              preserveDrawingBuffer: false,
              failIfMajorPerformanceCaveat: true
            }
          };
        }
      }
    }
  });
})();
