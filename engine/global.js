/* David Timber's FOR SALE Licence
This file is part of the project that is licensed with
"David Timber's FOR SALE Licence". See 'LICENCE' file for more info.
(c) 2018 David Timber. All rights reserved.
*/
/* eslint-disable no-console */

// eslint-disable-next-line no-unused-vars
var revo = (function () {
  var ret;

  ret = {
    util: {
      throwFrozen: function (x) { throw Object.freeze(x); },
      emptyFunc: function () {},

      PerfStopwatch: class {
        constructor () {
          var tsArr = [];
          var prec = 4;

          Object.defineProperty(this, 'ts', {
            get : function () {
              return tsArr.slice();
            },
            configurable: true
          });
          Object.defineProperty(this, 'last', {
            get: function () {
              if (tsArr.length) {
                return tsArr[tsArr.length - 1];
              }
              return null;
            },
            configurable: true
          });
          Object.defineProperty(this, 'push', {
            value : function (report, msg) {
              let ts = performance.now();

              if (report) {
                let fmtMsg = msg ? ' ' + msg + ' ' : '';

                if (tsArr.length) {
                  console.log('[' + tsArr.length + "]" + fmtMsg + ": " + (ts - tsArr[0]).toFixed(prec) + "ms (diff: " + (ts - tsArr[tsArr.length - 1]).toFixed(prec) + "ms)");
                }
                else {
                  console.log("[0]" + fmtMsg + ": " + (0).toFixed(prec) + "ms");
                }
              }
              tsArr.push(ts);

              return this;
            },
            configurable: true
          });
          Object.defineProperty(this, 'reset', {
            value : function () {
              tsArr = [];
              return this;
            },
            configurable: true
          });
        }
      }
    },
    glu: {
      arrError: function (gl) {
        let err, ret = [];

        while (true) {
          err = gl.getError();
          if (err !== gl.NO_ERROR) {
            ret.push(err);
          }
          else {
            break;
          }
        }

        return ret;
      },
      dropError: function (gl) {
        let error = revo.util.arrGLError(gl);

        if (error.length) {
          let e = new revo.error.gl();
          e
            .set(gl, error)
            .raise();
        }
      },
      clearError: function (gl) {
        while (gl.getError() !== gl.NO_ERROR);
      },
      setNPOT: function (gl) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      },
      noError: function (gl) {
        return gl.NO_ERROR === gl.getError();
      }
    },
    math: {
      clamp: (n, min, max) => Math.min(Math.max(n, min), max)
    },
    astro: {
      const: {
        MASS: {
          SOLAR: 1.98855 * 1000000000000000000000000000000,
          JUPITER: 1.89813 * 1000000000000000000000000000,
          EARTH: 5.9722 * 1000000000000000000000000,
          LUNAR: 7.342 * 10000000000000000000000
        },
        DIST: {
          PC: 3.0857 * 10000000000000000,
          LY: 9.4607 * 1000000000000000,
          AU: 149597870700
        }
      },
      si: {
        solar: (x) => x * 1.98855 * 1000000000000000000000000000000,
        jupiter: (x) => x * 1.89813 * 1000000000000000000000000000,
        earth: (x) => x * 5.9722 * 1000000000000000000000000,
        lunar: (x) => x * 7.342 * 10000000000000000000000,

        pc: (x) => x * 3.0857 * 10000000000000000,
        ly: (x) => x * 9.4607 * 1000000000000000,
        au: (x) => x * 149597870700
      },
      u: {
        solar: (x) => x / 1.98855 * 1000000000000000000000000000000,
        jupiter: (x) => x / 1.89813 * 1000000000000000000000000000,
        earth: (x) => x / 5.9722 * 1000000000000000000000000,
        lunar: (x) => x / 7.342 * 10000000000000000000000,

        pc: (x) => x / 3.0857 * 10000000000000000,
        ly: (x) => x / 9.4607 * 1000000000000000,
        au: (x) => x / 149597870700
      }
    },
    const: {
      C: 299792458,
      G: 6.67408 / 100000000000
    },
    ui: {},
    RevoError: class RevoError extends Error {
      raise (frozen) {
        if (frozen === undefined) {
          frozen = true;
        }

        if (frozen) {
          Object.freeze(this);
        }
        throw this;
      }
    }
  };
  ret.error = {
    avail: class AvailabilityError extends ret.RevoError {},
    state: class StateError extends ret.RevoError {},
    gl: class GLError extends ret.RevoError {
      constructor (msg, a, b) {
        super(msg, a, b);

        Object.defineProperties(this, {
          set: {
            value: function (gl, error) {
              this.gl = gl;
              this.error = error;
              return this;
            },
            configurable: true
          }
        });
      }
    }
  };

  return ret;
})();
