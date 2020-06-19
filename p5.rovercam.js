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
 */

// First-person camera control
// Mouse:
//       left/right : pan
//       up/down : tilt
//       click : move forward

// Keys: a/d : left/right
//       w/s : forward/backward
//       e/q : up/down

// First, define a callback system
// a location to store the class instances
var __RoverCam_cbq = [];

// let p5 know that we want a callback at the end of the draw loop.
// we iteratively call each item in the queue with its own context
p5.prototype.registerMethod('post', ()=>{for(let i of __RoverCam_cbq)i.draw.call(i)});

class RoverCam {
  constructor(){
    this.speed = 3.0;
    this.sensitivity = 2.0;
    this.position = createVector(0, 0, 0);
    this.velocity = createVector(0, 0, 0);
    this.up = createVector(0, 1, 0);
    this.right = createVector(1, 0, 0);
    this.forward = createVector(0, 0, 1);
    this.pan = 0.0;
    this.tilt = 0.0;
    this.friction = 0.75;
    this.width = 0;
    this.height = 0;
    // push 'this' onto a callback queue
    __RoverCam_cbq.push(this);
  }
  draw(){
    if(width !== this.width || height !== this.height){
        perspective(PI/3, width/height, 0.01, 1000.0);
        this.width = width;
        this.height = height;
    }

    this.pan += map(mouseX - pmouseX, 0, width, 0, TWO_PI) * this.sensitivity;
    this.tilt += map(mouseY - pmouseY, 0, height, 0, PI) * this.sensitivity;
    this.tilt = this.clamp(this.tilt, -PI/2.01, PI/2.01);

    if (this.tilt == PI/2.0) this.tilt += 0.001;

    this.forward = createVector(cos(this.pan), tan(this.tilt), sin(this.pan));
    this.forward.normalize();
    this.right = createVector(cos(this.pan - PI/2.0), 0, sin(this.pan - PI/2.0));
    if(keyIsDown(65) || keyIsDown(LEFT_ARROW)) this.velocity.add(p5.Vector.mult(this.right, this.speed)); // a
    if(keyIsDown(68) || keyIsDown(RIGHT_ARROW)) this.velocity.sub(p5.Vector.mult(this.right, this.speed)); // d
    if(keyIsDown(87) || keyIsDown(UP_ARROW)) this.velocity.add(p5.Vector.mult(this.forward, this.speed)); // w
    if(keyIsDown(83) || keyIsDown(DOWN_ARROW)) this.velocity.sub(p5.Vector.mult(this.forward, this.speed)); // s
    if(keyIsDown(81)) this.velocity.add(p5.Vector.mult(this.up, this.speed)); // q
    if(keyIsDown(69)) this.velocity.sub(p5.Vector.mult(this.up, this.speed)); // e
    if(mouseIsPressed) this.velocity.add(p5.Vector.mult(this.forward, this.speed));

    this.velocity.mult(this.friction);
    this.position.add(this.velocity);
    let center = p5.Vector.add(this.position, this.forward);
    camera(this.position.x, this.position.y, this.position.z, center.x, center.y, center.z, this.up.x, this.up.y, this.up.z);
  }

  clamp(aNumber, aMin, aMax) {
    return (aNumber > aMax ? aMax
        : aNumber < aMin ? aMin
            : aNumber);
  }
}
