// Namespaces for commonly used Box2D objects
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2MassData = Box2D.Collision.Shapes.b2MassData;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2AABB = Box2D.Collision.b2AABB;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2MouseJointDef =  Box2D.Dynamics.Joints.b2MouseJointDef;

// Physics object, runs a loop within the game loop calculating colisions and movement.
var Physics = window.Physics = function(element,world) {
  var gravity = GRAVITY || new b2Vec2(0,9.8);
  this.world = world || new b2World(gravity, true);
  this.context = element.getContext("2d");
  this.scale = SCALE || 20;
  this.dtRemaining = 0;
  this.stepAmount = 1/60;
};

// Debug draw is used to render simple versions of the physics objects on screen
Physics.prototype.debug = function() {
  this.debugDraw = new b2DebugDraw();
  this.debugDraw.SetSprite(this.context);
  this.debugDraw.SetDrawScale(this.scale);
  this.debugDraw.SetFillAlpha(0.3);
  this.debugDraw.SetLineThickness(1.0);
  this.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
  this.world.SetDebugDraw(this.debugDraw);
};

// Steps through the phyiscs
Physics.prototype.step = function(dt) {
  this.dtRemaining += dt;
  while(this.dtRemaining > this.stepAmount) {
    this.dtRemaining -= this.stepAmount;
    this.world.Step(this.stepAmount, 
    10, // velocity iterations
    10);// position iterations
  }
};

// Button selection on website
var UI = function(){

  var buttonSetting = "quad";

  function setSetting(shape) {
    buttonSetting = shape;
    console.log(shape);
  }

  return {
    buttonSetting:buttonSetting,
    setSetting:setSetting
  }
}

// Shortcut for creating bodies
var Body = window.Body = function(physics,details,id) {
  this.details = details = details || {};

  // Create the definition
  this.definition = new b2BodyDef();

  // Set up the definition
  for(var k in this.definitionDefaults) {
    this.definition[k] = details[k] || this.definitionDefaults[k];
  }
  this.definition.position = new b2Vec2(details.x || 0, details.y || 0);
  this.definition.linearVelocity = new b2Vec2(details.vx || 0, details.vy || 0);

  this.definition.userData = this;
  this.id = id.id;
  this.name = id.name;

  switch(details.type) {
    case "static":
      this.definition.type = details.type  = b2Body.b2_staticBody;
    break;
    case "kinematic":
      this.definition.type = details.type = b2Body.b2_kinematicBody;
    break;
    default:
      this.definition.type = details.type = b2Body.b2_dynamicBody;
    break;
  }

  // Create the Body
  this.body = physics.world.CreateBody(this.definition);

  // Create the fixture
  this.fixtureDef = new b2FixtureDef();
  for(var l in this.fixtureDefaults) {
    this.fixtureDef[l] = details[l] || this.fixtureDefaults[l];
  }

  this.fixtureDef.userData = this;

  details.shape = details.shape || this.defaults.shape;

  switch(details.shape) {
    case "circle":
    details.radius = details.radius || this.defaults.radius;
    this.fixtureDef.shape = new b2CircleShape(details.radius);
    break;
    case "polygon":
    this.fixtureDef.shape = new b2PolygonShape();
    this.fixtureDef.shape.SetAsArray(details.points,details.points.length);
    break;
    case "block": /* FALLTHROUGH */
    default:
    details.width = details.width || this.defaults.width;
    details.height = details.height || this.defaults.height;

    this.fixtureDef.shape = new b2PolygonShape();
    this.fixtureDef.shape.SetAsBox(details.width,
      details.height);
    break;
  }

  this.body.CreateFixture(this.fixtureDef);
};

Body.prototype.defaults = {
  shape: "block",
  width: 2,
  height: 2,
  radius: 1
};

Body.prototype.fixtureDefaults = {
  density: 2,
  friction: 1,
  restitution: 0.2
};

Body.prototype.definitionDefaults = {
  active: true,
  allowSleep: true,
  angle: 0,
  angularVelocity: 0,
  awake: true,
  bullet: false,
  fixedRotation: false
};

// Body callback for mouse interaction
Body.prototype.onPress = function(){
};

function Entity(body) {
  this.physicsComponent = body;
  this.alive = true;
}

Entity.prototype.kill = function() { this.alive = false; };
Entity.prototype.render = function(context) {
  var pos = this.physicsComponent.body.GetPosition(),
  angle = this.physicsComponent.body.GetAngle(),
  details = this.physicsComponent.details;

  // Save the context
  context.save();

  // Translate and rotate
  context.translate(pos.x, pos.y);
  context.rotate(angle);

  // Draw the shape outline if the shape has a color
  if (details.color) {
    context.fillStyle = details.color;

    switch (details.shape) {
      case "circle":
      context.beginPath();
      context.arc(0, 0, details.radius, 0, Math.PI * 2);
      context.fill();
      break;
      case "polygon":
      var points = details.points;
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      for (var i = 1; i < points.length; i++) {
        context.lineTo(points[i].x, points[i].y);
      }
      context.fill();
      break;
      case "block":
      default: /* FALLTHROUGH */
      context.fillRect(-details.width, -details.height,
        details.width*2,
        details.height*2);
      
      break;
    }
  }

  // If an image property is set, draw the image.
  if (details.image) {
    context.drawImage(details.image, -details.width / 2, -details.height / 2,
      details.width,
      details.height);
  }

  context.restore();

};

Entity.prototype.init = function() {};
Entity.prototype.update = function() { if (!this.alive) { return; } };

// Animation model from http://gamedevelopment.tutsplus.com/tutorials/an-introduction-to-spritesheet-animation--gamedev-13099
var SpriteSheet = function(path, frameWidth, frameHeight, frameSpd, endFrame) {

  var image = new Image();
  var framesPerRow;

  // calculate the number of frames in a row after the image loads
  var self = this;
  image.onload = function() {
    framesPerRow = Math.floor(image.width / frameWidth);
  };

  image.src = path;

  var currentFrame = 0; // current frame
  var counter = 0;
  var scale = {x: 0.04, y: 0.04};
  var running = true;
  var frameSpeed = frameSpd;
  var flip = false;

  this.update = function(physicsComponent){

    var velocity = physicsComponent.body.GetLinearVelocity();
    var frameSpeed = 3 - Math.abs(Math.round(velocity.x/10));
    var running = (velocity.x === 0) ? false: true;

    this.setSpeed(frameSpeed);
    this.setDirection(velocity.x);
    this.setRunning(running);
    
    if (running) {
      if (counter >= frameSpeed - 1) {
        currentFrame = (currentFrame + 1) % endFrame;
      }

    // update the counter
      counter = ((counter + 1) % frameSpeed) || 0;
    }
  };

  this.setRunning = function(value){
    running = value;
  };

  this.setSpeed = function(value){
    frameSpeed = value;
  };

  this.setDirection = function(value){
    if (value !== 0) {
      flip = (value < 0) ? false:true;
    }
  };

  this.render = function(context, pos, angle){
    // get the row and col of the frame
    var row = Math.floor(currentFrame / framesPerRow);
    var col = Math.floor(currentFrame % framesPerRow);

    context.save();
    context.translate(pos.x, pos.y);
    context.rotate(angle);

    // render depending on direction.
    if (!flip) {
      context.scale(scale.x,scale.y);
    } else {
      context.scale(-scale.x,scale.y);
    }

    context.drawImage(
       image,
       col * frameWidth, row * frameHeight,
       frameWidth, frameHeight,
       -frameWidth/2, -frameWidth/2,
       frameWidth, frameHeight);

    context.restore();
  };

};

var PlayerInputComponent = (function(maxVelocity) {

  function update(container){
    var vel = container.body.GetLinearVelocity();
    var jump = false;

    if(inputHandler.Key.isDown(inputHandler.Key.LEFT)) {
      container.body.SetAwake(true);
      vel.x -= 0.5; 
    }
    if(inputHandler.Key.isDown(inputHandler.Key.RIGHT)) { 
      container.body.SetAwake(true);
      vel.x += 1; 
    }
    if(inputHandler.Key.isDown(inputHandler.Key.UP)) {
      jump = true;
    }
    if(inputHandler.Key.isDown(inputHandler.Key.DOWN) && GRAVITY.y === 0) {
      vel.y += 1;
    }

    if (vel.y > maxVelocity) { vel.y = maxVelocity;}
    if (vel.y < -maxVelocity) { vel.y = -maxVelocity;}
    if (vel.x > maxVelocity) { vel.x = maxVelocity;}
    if (vel.x < -maxVelocity) { vel.x = -maxVelocity;}  

    return jump;
  }

  return {
    update:update
  };

});

var inputHandler = (function () {
  var element = document.getElementById("canvas");
  var Key = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,

    isDown: function(keyCode) {
      return this._pressed[keyCode];
    },

    onKeydown: function(event) {
      this._pressed[event.keyCode] = true;
    },

    onKeyup: function(event) {
      delete this._pressed[event.keyCode];
    }
  };

  window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
  window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);


  return {
    Key:Key
  };

})();

// Dynamic geometry generation
var geometryHandler = function(physics,id){

  var self = this;
  var drawing = true;

  var physicsReference = physics;
  var _id = id;

  var selection = {
    x: mouseX,
    y: mouseY,
    x_end: mouseX,
    y_end: mouseY
  };

  var body;

  buildStart();

  // on Click start
  function buildStart(){
    mouseFunction = self;
  }

  function buildEnd(){

    var  bodyDef = {
      x: selection.x < selection.x_end ? selection.x : selection.x_end,
      y: selection.y > selection.y_end ? selection.y : selection.y_end,
      width: (selection.x - selection.x_end)>0 ? (selection.x - selection.x_end) : -(selection.x - selection.x_end),
      height: (selection.y - selection.y_end)>0 ? (selection.y - selection.y_end) : -(selection.y - selection.y_end)
    };

    body = new Body(physicsReference, { 
      type: "kinematic", 
      x: bodyDef.x + (bodyDef.width/2), 
      y: bodyDef.y - (bodyDef.height/2), 
      height: bodyDef.height/2,  
      width: bodyDef.width/2},_id);
  }

  function update(){

    if (!isMouseMove && drawing) {
      drawing = false;
      buildEnd();
    }

    if (!drawing) { return; }

    selection.x_end = mouseX;
    selection.y_end = mouseY;
  }

  function render(context){
    // Save the context before changing it
    context.save();

    // Translate
    context.translate(selection.x, selection.y);

    context.fillRect(0,0,
      -(selection.x - selection.x_end),
      -(selection.y - selection.y_end));

    context.restore();

  }

  return{
    render:render,
    update:update
  };
};

// Mouse interaction from makenewgames.com

var mouseX, mouseY, mousePVec, isMouseDown, isMouseMove, selectedBody, mouseJoint;
var canvasPosition = getElementPosition(document.getElementById("canvas"));

document.addEventListener("mousedown", function(e) {

  isMouseDown = true;
  isMouseMove = true;
  handleMouseMove(e);
  document.addEventListener("mousemove", handleMouseMove, true);
}, true);

document.addEventListener("mouseup", function() {
  document.removeEventListener("mousemove", handleMouseMove, true);
  isMouseDown = false;
  isMouseMove = false;
  mouseX = undefined;
  mouseY = undefined;

}, true);

function handleMouseMove(e) {
  // Changed scale to current game scale
  mouseX = (e.clientX - canvasPosition.x) / SCALE;
  mouseY = (e.clientY - canvasPosition.y) / SCALE;
  isMouseMove = true;
}

function getBodyAtMouse(world) {
  if (mouseX !== undefined) {
    mousePVec = new b2Vec2(mouseX, mouseY);
    var aabb = new b2AABB();
    aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
    aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);

    // Query the world for overlapping shapes.

    selectedBody = null;
    world.QueryAABB(getBodyCB, aabb);
    return selectedBody;
  }
}

function getBodyCB(fixture) {

  
  if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
    if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
      selectedBody = fixture.GetBody();
      return false;
    }
  }
  return true;
}

// Determine whether object is player.
function isPlayer(object) {
  if (object !== null && object.GetUserData() !== null) {
      return object.GetUserData().name == 'player';
  }
}

// Determine whether object is foot.
function isFootPlayer(object) {
  if (object !== null && object.GetUserData() !== null) {
      return object.GetUserData().name == 'footPlayer';
  }
}

// Determine wheter object is the ground
function isGroundOrBox(object) {
  if (object !== null && object.GetUserData() !== null) {
      return (object.GetUserData().name == 'box' || object.GetUserData().name == 'ground');
  }
}

// disable vertical scrolling from arrows :)
document.onkeydown=function(){
  return event.keyCode!=38 && event.keyCode!=40 && event.ketCode!=37 && event.keyCode!=39;
};

//http://js-tut.aardon.de/js-tut/tutorial/position.html
function getElementPosition(element) {
  var elem=element, tagname="", x=0, y=0;

  while((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
    y += elem.offsetTop;
    x += elem.offsetLeft;
    tagname = elem.tagName.toUpperCase();

    if(tagname == "BODY")
      elem=0;

    if(typeof(elem) == "object") {
      if(typeof(elem.offsetParent) == "object")
        elem = elem.offsetParent;
    }
  }

  return {x: x, y: y};
}

// Lastly, add in the `requestAnimationFrame` shim, if necessary. Does nothing 
// if `requestAnimationFrame` is already on the `window` object.
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = 
    window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());