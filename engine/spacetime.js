/* David Timber's FOR SALE Licence
This file is part of the project that is licensed with
"David Timber's FOR SALE Licence". See 'LICENCE' file for more info.
(c) 2018 David Timber. All rights reserved.
*/
/* global revo */
/* global vec3 */

(function () {
  "use strict";

  var __bodyType__ = {
    // dark bodies: don't gravitate toward anything
    // eg: massive black holes, stationary stars
    DARK: 0,
    // small bodies: gravitate toward large and dark bodies
    // eg: spacecrafts, asteroids
    SMALL: 1,
    // large bodies: gravitate toward large and dark bodies
    // eg: binary stars, planets, satellites, black holes
    LARGE: 2
  };

  Object.freeze(__bodyType__);

  Object.defineProperties(revo, {
    Spacetime: {
      value: class Spacetime {
        constructor () {
          var __idBodyMap = new Map();
          var __typeBodyMap = new Map();
          var __bodyTypeMap = new Map();
          var __cb = {
            collision: revo.util.emptyFunc
          };

          for (let t in __bodyType__) {
            __typeBodyMap.set(__bodyType__[t], new Set());
          }

          Object.defineProperties(this, {
            addBody: {
              value: function (body, replace) {
                let s;

                if (replace) {
                  this.rmBody(body.id);
                }
                else if (__idBodyMap.has(body.id)) {
                  revo.util.throwFrozen(new Error("duplicate body.id."));
                }

                s = __typeBodyMap.get(body.type);
                if (s) {
                  __idBodyMap.set(body.id, body);
                  __bodyTypeMap.set(body, body.type);
                  s.add(body);
                }
                else {
                  revo.util.throwFrozen(new RangeError("'type' not in range."));
                }

                return this;
              },
              configurable: true
            },
            rmBody: {
              value: function (id) {
                let body = __idBodyMap.get(id);

                if (body) {
                  let s = __typeBodyMap.get(body.type);

                  s.delete(body);
                  __bodyTypeMap.delete(body);
                  __idBodyMap.delete(id);
                }

                return this;
              },
              configurable: true
            },
            hasBody: {
              value: function (body) {
                return typeof __bodyType__.get(body) !== 'undefined';
              },
              configurable: true
            },
            hasBodyInRadius: {
              value: function (body) {
                let o;

                for (o of __idBodyMap) {
                  if (o[1].intersecting(body)) {
                    return true;
                  }
                }

                return false;
              },
              configurable: true
            },
            getBodyCollection: {
              value: function () {
                // TODO
              },
              configurable: true
            },
            getBodyArray: {
              value: function () {
                return Array.from(__idBodyMap.values());
              },
              configurable: true
            },

            addCallback: {
              value: function (n, f) {
                if (f === null) {
                  f = revo.util.emptyFunc;
                }
                else if (!(f instanceof Function)) {
                  revo.util.throwFrozen(new TypeError("invalid value 'f'."));
                }
                if (n in __cb) {
                  __cb[n] = f;
                }
                else {
                  revo.util.throwFrozen(new RangeError("'n' is not a valid name of event."));
                }

                return this;
              },
              configurable: true
            },

            advance: {
              value: function (t) {
                let bodySet;
                let bodyI, bodyJ;

                if (typeof t !== 'number') {
                  revo.util.throwFrozen(new TypeError("'t' is not number"));
                }
                bodySet = {
                  dark: __typeBodyMap.get(__bodyType__.DARK),
                  small: __typeBodyMap.get(__bodyType__.SMALL),
                  large: __typeBodyMap.get(__bodyType__.LARGE)
                };

                // Gravitation of large bodies.
                // They will gravitate toward other large bodies only.
                for (bodyI of bodySet.large) {
                  for (bodyJ of bodySet.large) {
                    if (bodyI === bodyJ) {
                      continue;
                    }
                    bodyI.gravitate(bodyJ);
                  }
                  for (bodyJ of bodySet.dark) {
                    bodyI.gravitate(bodyJ);
                  }
                }

                // Gravitation of small bodies.
                // They will gravitate toward large bodies only.
                for (bodyI of bodySet.small) {
                  for (bodyJ of bodySet.large) {
                    bodyI.gravitate(bodyJ);
                  }
                  for (bodyJ of bodySet.dark) {
                    bodyI.gravitate(bodyJ);
                  }
                }

                for (bodyI of __idBodyMap) {
                  bodyI[1].be(t);
                }

                // TODO: make k-d tree of small bodies
                // TODO: do path collision detection using pos and ppos (small bodies)
                cdStart: do {
                  for (bodyI of __idBodyMap) {
                    for (bodyJ of __idBodyMap) {
                      if (bodyI[1] === bodyJ[1]) {
                        continue;
                      }
                      if (bodyI[1].intersecting(bodyJ[1])) {
                        if (__cb.collision(bodyI[1], bodyJ[1])) {
                          continue cdStart;
                        }
                      }
                    }
                  }
                } while (false);

                return true;
              },
              configurable: true
            },

            clear: {
              value: function () {
                // TODO
                return this;
              },
              configurable: true
            },
            from: {
              value: function (st) {
                this.clear();
                // TODO
                return this;
              },
              configurable: true
            }
          });
        }
      }
    },
    Body: {
      value: class Body {
        constructor (src) {
          this.id = null;
          this.type = null;

          // The object's own constant acceleration(like propulsion)
          this.accel = vec3.create();
          this.vel = vec3.create();
          this.mass = 0;
          this.radius = 0;
          this.pos = vec3.create();
          this.ppos = vec3.create();

          // The object's position delta used for gravitation
          this.delta = vec3.create();

          if (src) {
            if (src instanceof revo.Body) {
              this.from(src);
            }
            else {
              revo.util.throwFrozen(new TypeError("'src' not an instance of revo.Body"));
            }
          }
        }

        gravitate (body) {
          let d, v;

          d = vec3.distance(this.pos, body.pos);

          v = [0, 0, 0];
          vec3.sub(v, body.pos, this.pos);
          vec3.normalize(v, v);

          // delta(acceleration) = G * m / d * d
          vec3.scale(v, v, revo.const.G * body.mass / (d * d));
          vec3.add(this.delta, this.delta, v);

          return this;
        }
        collide (body, cr) {
          let tmi, d, pa, pb, mv;

          if (typeof cr === 'number') {
            cr = cr < 0 ? 0 : cr;
          }
          else if (cr) {
            revo.util.throwFrozen(new TypeError("invalid value 'cr'."));
          }
          d = [0, 0, 0];
          pa = [0, 0, 0];
          pb = [0, 0, 0];
          mv = [0, 0, 0];

          tmi = 1 / (this.mass + body.mass);
          vec3.scale(pa, this.vel, this.mass);
          vec3.scale(pb, body.vel, body.mass);
          vec3.add(mv, pa, pb);

          vec3.sub(d, body.vel, this.vel);
          vec3.scale(pa, d, cr * body.mass);
          vec3.add(pa, pa, mv);
          vec3.scale(pa, pa, tmi);

          vec3.sub(d, this.vel, body.vel);
          vec3.scale(pb, d, cr * this.mass);
          vec3.add(pb, pb, mv);
          vec3.scale(pb, pb, tmi);

          vec3.copy(this.vel, pa);
          vec3.copy(body.vel, pb);

          return this;
        }
        be (t) {
          let at = [0, 0, 0];
          let dt = [0, 0, 0];
          let vt = [0, 0, 0];

          vec3.copy(this.ppos, this.pos);

          // Momentum
          vec3.scale(vt, this.vel, t);
          vec3.add(this.pos, this.pos, vt);
          // Force
          vec3.add(this.delta, this.delta, this.accel);
          vec3.scale(at, this.delta, t * t / 2);
          vec3.add(this.pos, this.pos, at);
          // Accumulate velocity
          vec3.scale(dt, this.delta, t);
          vec3.add(this.vel, this.vel, dt);

          vec3.set(this.delta, 0, 0, 0);

          return this;
        }

        distance (body) {
          return vec3.distance(this.pos, body.pos);
        }
        intersecting (body) {
          return this.distance(body) <= this.radius + body.radius;
        }

        from (src) {
          // TODO
        }

        static get Type () {
          return __bodyType__;
        }
      }
    }
  });

})();
