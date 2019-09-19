## p5.RoverCam
A super-simple first-person persepective camera library for p5.js

An instance of RoverCam can be controlled using the mouse and WASD keys (as well as E and Q for upward and downward motion).

Source forked from github.com/jrc03c/queasycam and ported to JavaScript.

### Usage

```javascript
let rover = new RoverCam();

var rover;

function setup() {
	createCanvas(800, 800, WEBGL);
	rover = new RoverCam(this);
	rover.speed = 5;              // optional; default is 3
	rover.sensitivity = 0.5;      // optional; default is 2
}

function draw() {
	background(0);
	box(200);
}
```

RoverCam can be extended:

```javascript
class Player extends RoverCam {
  constructor(){
    super();
    this.speed = 0.04;
    this.dimensions = createVector(1, 3, 1);
    this.velocity = createVector(0, 0, 0);
    this.gravity = createVector(0, 0.015, 0);
    this.grounded = false;
  }
  
  update(){
    this.velocity.add(this.gravity);
    this.position.add(this.velocity);
    
    if (this.grounded && keyIsPressed && keyCode == 32){ // space
      this.grounded = false;
      this.velocity.y = -1.5;
      this.position.y -= 0.2;
    }
  }
}
```

Example:
- [MazeRunner on openprocessing](https://www.openprocessing.org/sketch/755273)
