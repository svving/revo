/* David Timber's FOR SALE Licence
This file is part of the project that is licensed with
"David Timber's FOR SALE Licence". See 'LICENCE' file for more info.
(c) 2018 David Timber. All rights reserved.
*/
/* global revo */
/* global vec3 */

(function () {
  "use strict";

  Object.defineProperties(revo, {
    BasicSpacetimeModel: {
      value: class BasicSpacetimeModel extends revo.Spacetime {
          constructor () {
            super();

            this.addCallback("collision", function (a, b) {
              // Case breakdown:
              // Both LARGE: merge
              // Both small: remove both
              // LARGE - SMALL: remove SMALL, do nothing on LARGE
              if (a.type === revo.Body.Type.LARGE && b.type === revo.Body.Type.LARGE) {
                a.collide(b, 0);
                a.mass += b.mass;
                this.rmBody(b.id);
                return true;
              }
              else if (a.type === revo.Body.Type.SMALL && b.type === revo.Body.Type.SMALL) {
                this
                  .rmBody(a.id)
                  .rmBody(b.id);
                return true;
              }
              else if ((a.type === revo.Body.Type.SMALL && b.type === revo.Body.Type.LARGE)) {
                this.rmBody(a.id);
                return true;
              }
              else if (a.type === revo.Body.Type.LARGE && b.type === revo.Body.Type.SMALL) {
                this.rmBody(b.id);
                return true;
              }

              return false;
            });
          }

          // TODO
          // static buildSolarSystem () {}

          static getRandomSystemParam () {
            return {
              nb_obj: {
                DARK: 0,
                SMALL: 1000,
                LARGE: 40
              },
              total_mass: {
                DARK: 0,
                SMALL: revo.astro.si.solar(1.0014 * 0.00000000001), // mass for collision energy
                LARGE: revo.astro.si.solar(1.0014) // solar mass
              },
              max_radius: {
                DARK: 0,
                SMALL: 10000,
                LARGE: 70000000
              },
              radius: revo.astro.si.au(50)
            };
          }
          static buildRandomSystem (param) {
            let ret, arr, sm, n, i, bt, a, d, body, counter;

            if (param) {
              // TODO: fill in the missing prop
            }
            else {
              param = this.getRandomSystemParam();
            }
            ret = new revo.BasicSpacetimeModel();
            counter = 0;

            for (bt in revo.Body.Type) {
              if (bt in param.nb_obj && bt in param.total_mass) {
                arr = [];
                sm = 0;
                for (i = 0; i < param.nb_obj[bt]; i += 1) {
                  n = Math.random();
                  arr.push(n);
                  sm += n;
                }

                for (n of arr) {
                  body = new revo.Body();
                  counter += 1;
                  body.id = counter;
                  body.type = revo.Body.Type[bt];
                  body.mass = n / sm * param.total_mass[bt];

                  do {
                    body.radius = param.max_radius[bt] * Math.random();
                    a = 2 * Math.PI * Math.random();
                    d = param.radius * Math.random();
                    vec3.set(body.pos, Math.sin(a) * d, Math.cos(a) * d, 0);
                    // TODO: 'accel' and 'vel' randomisation
                    vec3.set(body.accel, 0, 0, 0);
                    vec3.set(body.vel, 0, 0, 0);

                    if (ret.hasBodyInRadius(body)) {
                      continue;
                    }
                  } while (false);

                  ret.addBody(body);
                }
              }
            }

            return ret;
          }
      }
    }
  });
})();
