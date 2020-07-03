## p5.RoverCam
A super-simple first-person perspective camera library for p5.js in WEBGL mode.

RoverCam supports p5.js global and multi-instance modes.

The position and orientation of an instance of RoverCam can be controlled using the mouse and WASD / Arrow keys (as well as E and Q for upward and downward motion).

### Release path

- [CDN: p5.rovercam.min.js](https://cdn.jsdelivr.net/gh/freshfork/p5.RoverCam@1.1.1/p5.rovercam.min.js)

### Usage

```javascript
var rover;

function setup() {
  createCanvas(800, 800, WEBGL);
  rover = new RoverCam();
  rover.usePointerLock();    // optional; default is keyboard control only
  rover.setState({           // optional
    position: [-400,-200,-200],
    rotation: [0.4,0.3,0],
    sensitivity: 0.1,
    speed: 0.5
  });
}

function draw() {
  background(0);
  box(200);
}
```

After creating the camera, it can be controlled using the mouse or the keyboard with the following default controls:

```
Mouse: click : toggle pointer lock
       left/right : yaw
       up/down : pitch

 Keys: a/d : yaw | left/right*
       w/s : forward/backward
       e/q : up/down
       r/f : pitch | elevation*
       ←/→ : left/right
       ↑/↓ : forward/backward
       +/- : field of view

* when pointerLock is enabled
```


### Examples

- [MazeRunner on openprocessing](https://www.openprocessing.org/sketch/755273)
- [MazeRunner on editor.p5js.org](https://editor.p5js.org/jwdunn1/sketches/iI-2XX0Hw)
- [Multi-camera](https://editor.p5js.org/jwdunn1/sketches/L6xSzdKM8)
- [Multi-instance](https://editor.p5js.org/jwdunn1/sketches/QzBAQZPVT)
- [Stereo vision](https://editor.p5js.org/jwdunn1/sketches/nxfEMXn-s)
- [Controller](https://editor.p5js.org/jwdunn1/sketches/3IaJbTnkd)

### Utility methods

Mouse pointer lock can be enabled by invoking the `usePointerLock()` method. Pointer lock is global for all instances, thus only one instance needs to set this. See the multi-instance and stereo vision examples above.

```javascript
rover.usePointerLock();

// if using p5.js instance mode, pass the instance variable
rover.usePointerLock(p);
```

The camera can be reset to initialization values with the `reset()` method.

```javascript
rover.reset();
```

Camera state can be set with the `setState()` method. An object argument may contain any of the following optional property/value pairs:

```javascript
rover.setState = {
  active: true,
  enableControl: false,
  position: [-400,50,0],
  rotation: [0,0.1,0],
  offset: [0,20],
  fov: 1,
  speed: 0.1,
  sensitivity: 0.02
};
```

Camera controls can be enabled or disabled by setting the boolean `enableControl` property. This is useful to switch camera controls in a multi-instance scenario. The camera view remains visible. See the multi-instance example above. By default, a camera's controls are enabled.

```javascript
rover.enableControl = true;
```

A camera view can be enabled or disabled with the `setActive()` method. It requires one boolean argument. When disabled, the camera is no longer updated or visible. Another view can take its place. See the multi-camera example above. By default, a camera's view is enabled.

```javascript
rover.setActive(true);
```

### Customization

The RoverCam class can be extended. See the MazeRunner example above.

```javascript
class Player extends RoverCam {
  constructor(){
    super();
    this.speed = 0.04;
    this.dimensions = createVector(1, 3, 1);
    this.velocity = createVector(0, 0, 0);
    this.gravity = createVector(0, 0.03, 0);
    this.grounded = false;
  }
  
  update(){
    this.velocity.add(this.gravity);
    this.position.add(this.velocity);
    
    // extend the keyboard controls by adding a hop behavior
    if (this.grounded && keyIsDown(32)){ // space
      this.grounded = false;
      this.velocity.y = -1.5;
      this.position.y -= 0.2;
    }
  }
}
```

The keyboard can be remapped. The following example replaces the `w,a,s,d` primary movement keys to `k,j,l,h`

```javascript
var rover;

function setup() {
  createCanvas(800, 800, WEBGL);
  rover = new RoverCam();
  rover.keyMap.mx1 = [75, 38];  // k, UP_ARROW
  rover.keyMap.mx2 = [74, 40];  // j, DOWN_ARROW
  rover.keyMap.my1 = [72, 37];  // h, LEFT_ARROW
  rover.keyMap.my2 = [76, 39];  // l, RIGHT_ARROW
}
```


The controller method can be customized. It must call on the primitive translation and rotation methods to move the camera. See the controller example above.

```javascript

  rover.controller = function() { // override
    if (RoverCam.pointerLock) {
      this.yaw(movedX * this.sensitivity / 10);   // mouse left/right
      this.pitch(movedY * this.sensitivity / 10); // mouse up/down
      if(keyIsDown(72) || keyIsDown(LEFT_ARROW))  this.moveY(this.speed); // h
      if(keyIsDown(76) || keyIsDown(RIGHT_ARROW)) this.moveY(-this.speed);// l
    }
    else { // otherwise yaw/pitch with keys
      if (keyIsDown(72) || keyIsDown(LEFT_ARROW)) this.yaw(-0.02); // h
      if (keyIsDown(76) || keyIsDown(RIGHT_ARROW)) this.yaw(0.02); // l
      if (keyIsDown(82)) this.pitch(-0.02); // r
      if (keyIsDown(70)) this.pitch(0.02);  // f
    }
    if (keyIsDown(75) || keyIsDown(UP_ARROW)) this.moveX(this.speed);    // k
    if (keyIsDown(74) || keyIsDown(DOWN_ARROW)) this.moveX(-this.speed); // j
    if (keyIsDown(69)) this.moveZ(this.speed); // e
  };
```
### Primitive internal camera control methods

The following methods control the camera translation and rotation. The camera local axes are X in front/behind, Y to the right/left, and Z above/below.

#### Translation

- `moveX()` translates the camera forward or backward
- `moveY()` translates the camera left or right
- `moveZ()` translates the camera up or down
- `elevate()` adjusts the camera's up/down position by an offset

#### Rotation

- `yaw()` rotates the camera left or right (pan)
- `pitch()` rotates the camera up or right (tilt)
- `roll()` rotates the camera along its X axis (TBD)

#### Field of view

- `fov()` adjusts the camera's fovy perspective value

### History

Source forked from github.com/jrc03c/queasycam and ported to JavaScript.
