/*
 *
 * The p5.RoverCam library - First-Person 3D CameraControl for p5.js and WEBGL.
 *
 *   Copyright © 2020 by p5.RoverCam authors
 *
 *   Source: https://github.com/freshfork/p5.RoverCam
 *
 *   MIT License: https://opensource.org/licenses/MIT
 *
 *
 * explanatory note:
 *
 * p5.RoverCam is a derivative of the QueasyCam Library by Josh Castle,
 * ported to JavaScript for p5.js from github.com/jrc03c/queasycam
 *
 * updates
 * 20200628 incorporate pointerLock and overridable controller method
 * 20200629 add support for switching between multiple cameras
 * 20200701 v1.1.0 fix registerMethod and allow for p5js instance mode
 * 20200702 v1.1.1 moved pointerLock; added keymap and ocular offsetting
 */

// First-person camera control
// Mouse:
//       left/right : yaw
//       up/down : pitch
//       click : enter/leave pointerLock

// Keys: a/d : yaw or left/right if pointerLock
//       w/s : forward/backward
//       e/q : up/down

class RoverCam {
  constructor(instance) {
    this.sensitivity = 0.02;
    this.friction = 0.8;
    this.speed = 0.1;
    this.reset();
    this.active = true; // use the setActive method
    this.enableControl = true; // used to enable/disable controls
    if(instance !== undefined) this.p5 = instance; 
    else this.p5 = p5.instance;
    if(this.p5 !== null) 
      this.p5.registerMethod('post', () => {if (this.active) this.draw();});
    this.keyMap = {   // maps each control command to a pair of keys
      mx1: [87, 38],  // w, UP_ARROW
      mx2: [83, 40],  // s, DOWN_ARROW
      my1: [65, 37],  // a, LEFT_ARROW
      my2: [68, 39],  // d, RIGHT_ARROW
      mz1: [69, 69],  // e
      mz2: [81, 81],  // q
      y1:  [65, 37],  // a, LEFT_ARROW
      y2:  [68, 39],  // d, RIGHT_ARROW
      p1:  [82, 82],  // r
      p2:  [70, 70],  // f
      r1:  [90, 90],  // z
      r2:  [67, 67],  // c
      f1:  [107,187], // +
      f2:  [109,189], // -
      e1:  [82, 82],  // r
      e2:  [70, 70]   // f
    };
  }

  // Application can override the following method
  controller() { // default behavior
    if (!this.enableControl) return;
    var k = this.keyMap, p = this.p5;
    if (RoverCam.pointerLock) {
      this.yaw(p.movedX * this.sensitivity / 10); // mouse left/right
      this.pitch(p.movedY * this.sensitivity / 10); // mouse up/down
      if (p.keyIsDown(k.my1[0]) || p.keyIsDown(k.my1[1])) this.moveY( this.speed); // a
      if (p.keyIsDown(k.my2[0]) || p.keyIsDown(k.my2[1])) this.moveY(-this.speed); // d
      if (p.keyIsDown(k.e1[0]) || p.keyIsDown(k.e1[1])) this.elevate(-this.speed); // r
      if (p.keyIsDown(k.e2[0]) || p.keyIsDown(k.e2[1])) this.elevate(this.speed); // f
    } else { // otherwise yaw/pitch with keys
      if (p.keyIsDown(k.y1[0]) || p.keyIsDown(k.y1[1])) this.yaw(-this.sensitivity); // a
      if (p.keyIsDown(k.y2[0]) || p.keyIsDown(k.y2[1])) this.yaw(this.sensitivity); // d
      if (p.keyIsDown(k.p1[0]) || p.keyIsDown(k.p1[1])) this.pitch(-this.sensitivity); // r
      if (p.keyIsDown(k.p2[0]) || p.keyIsDown(k.p2[1])) this.pitch(this.sensitivity); // f
    }
    if (p.keyIsDown(k.mx1[0]) || p.keyIsDown(k.mx1[1])) this.moveX(this.speed); // w
    if (p.keyIsDown(k.mx2[0]) || p.keyIsDown(k.mx2[1])) this.moveX(-this.speed); // s
    if (p.keyIsDown(k.mz1[0]) || p.keyIsDown(k.mz1[1])) this.moveZ(this.speed); // e
    if (p.keyIsDown(k.mz2[0]) || p.keyIsDown(k.mz2[1])) this.moveZ(-this.speed); // q

    if (p.keyIsDown(k.f1[0]) || p.keyIsDown(k.f1[1])) this.fov(-this.sensitivity / 10); // +
    if (p.keyIsDown(k.f2[0]) || p.keyIsDown(k.f2[1])) this.fov(this.sensitivity / 10); // -

    // test roll TBD
    //if(p.keyIsDown(k.r1[0]) || p.keyIsDown(k.r1[1])) this.roll(this.sensitivity);  // z
    //if(p.keyIsDown(k.r2[0]) || p.keyIsDown(k.r2[1])) this.roll(-this.sensitivity); // c
  }

  // Primitive internal camera control methods
  moveX(speed) {
    this.velocity.add(p5.Vector.mult(this.forward, speed));
  }
  moveY(speed) {
    this.velocity.add(p5.Vector.mult(this.right, speed));
  }
  moveZ(speed) {
    this.velocity.add(p5.Vector.mult(this.up, -speed));
  }
  yaw(angle) {
    this.pan += angle;
  }
  pitch(angle) {
    this.tilt += angle;
    this.tilt = this.clamp(this.tilt, -Math.PI / 2.01, Math.PI / 2.01);
    if (this.tilt == Math.PI / 2.0) this.tilt += 0.001;
  }
  roll(angle) { // TBD: useful for flight sim or sloped racetracks
    this.rot += angle;
  }
  fov(angle) {
    this.fovy += angle;
    this.width = 0; // trigger a perspective call in the draw loop
  }
  elevate(delta) {
    this.offset[0] += delta;
  }

  // Utility methods
  usePointerLock(instance) {
    if(instance === undefined) instance = p5.instance;
    if(instance === null) return;
    RoverCam.canvas = instance._renderer.elt;
    // ffd8 - click into pointerlock example based on:
    // https://p5js.org/reference/#/p5/exitPointerLock
    document.addEventListener('click', () => {
      if (!RoverCam.pointerLock) {
        RoverCam.pointerLock = true;
        instance.requestPointerLock();
      } else {
        instance.exitPointerLock();
        RoverCam.pointerLock = false;
      }
    }, false);
    document.addEventListener('pointerlockchange', RoverCam.onPointerlockChange, false);
  }
  reset() {
    this.pan = 0.0;
    this.tilt = 0.0;
    this.rot = 0.0;
    this.fovy = 1.0;
    this.width = 0; // trigger a perspective call in the draw loop
    this.height = 0;
    this.position = new p5.Vector(0, 0, 0);
    this.velocity = new p5.Vector(0, 0, 0);
    this.up = new p5.Vector(0, 1, 0);
    this.right = new p5.Vector(1, 0, 0);
    this.forward = new p5.Vector(0, 0, 1);
    this.offset = [0,0]; // ffd8 - adjust height of cam
  }
  setActive(active){ // method to switch between multiple cameras
    this.active = active;
    if(active) this.width=0; // trigger a perspective call in the draw loop
  }
  setState(state){ // state object can have fov,active,rotation,position
    if(state.fov !== undefined) {
      this.fovy = state.fov;
      this.width = 0; // trigger a perspective call in the draw loop;
    }
    if(state.active !== undefined) this.active = state.active;
    if(state.rotation !== undefined) {
      this.pan = state.rotation[0];
      this.tilt = state.rotation[1];
      this.rot = state.rotation[2];
    }
    if(state.position !== undefined) this.position = new p5.Vector(state.position[0],state.position[1],state.position[2]);
    if(state.offset !== undefined) this.offset = state.offset;
    if(state.enableControl !== undefined) this.enableControl = state.enableControl;
    if(state.speed !== undefined) this.speed = state.speed;
    if(state.sensitivity !== undefined) this.sensitivity = state.sensitivity;
  }

  // This method is called after the main p5.js draw loop 
  draw() {
    if (this.p5.width !== this.width || this.p5.height !== this.height) {
      this.p5.perspective(this.fovy, this.p5.width / this.p5.height, 0.01, 10000.0);
      this.width = this.p5.width;
      this.height = this.p5.height;
    }

    // Call the potentially overridden controller method
    this.controller();

    this.forward = new p5.Vector(Math.cos(this.pan), Math.tan(this.tilt), Math.sin(this.pan));
    this.forward.normalize();
    this.right = new p5.Vector(Math.cos(this.pan - Math.PI / 2.0), 0, Math.sin(this.pan - Math.PI / 2.0));
    // TBD: handle roll command (using this.rot)

    this.velocity.mult(this.friction);
    this.position.add(this.velocity);
    let position = p5.Vector.sub(this.position, p5.Vector.mult(this.right,this.offset[1]));
    let center = p5.Vector.add(position, this.forward);
    this.p5.camera(position.x, position.y+this.offset[0], position.z, center.x, center.y+this.offset[0], center.z, this.up.x, this.up.y, this.up.z);
  }

  clamp(aNumber, aMin, aMax) {
    return (aNumber > aMax ? aMax :
      aNumber < aMin ? aMin :
      aNumber);
  }
}
RoverCam.version = "1.1.1";
// Optional pointerLock applies to all RoverCam instances 
RoverCam.pointerLock = false;
// handle exit from pointerLock when user presses ESCAPE
RoverCam.onPointerlockChange = () => {
  if (document.pointerLockElement !== RoverCam.canvas &&
      document.mozPointerLockElement !== RoverCam.canvas) RoverCam.pointerLock = false;
}
p5.prototype.createRoverCam = function(){
  return new RoverCam(this);
}