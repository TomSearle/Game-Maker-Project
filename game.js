/*----

- Implement usage statistics into the engine.
- Auto-save.
- Potential HCI paper :)
- Stress tests

 Wen TODO: 
 - HCI papers on game design engine and testing.

----*/

var SCALE = 20;
var GRAVITY = new b2Vec2(0,9.8);

(function() {

  var Game = {};
  Game.element = document.getElementById("canvas");
  Game.context = Game.element.getContext("2d");
  Game.scale = SCALE;
  var gravity = GRAVITY;
  Game.world = new b2World(GRAVITY, true);
  Game.physics = window.physics = new Physics(Game.element,Game.world);
  Game.maxEntities = 1000;
  Game.currentID = 1001;

  var lastFrame = new Date().getTime();

  var players = [];

  Game.init = function(){

    // Create array to place all entities
    this.entities = [];
    this.numEntities = 0;

    physics.debug(); // Draw physics objects using debug draw.
    Game.addContactListener();

    // Shim for when levels are implemented.
    var currentLevel = 0;
    this.loadLevel(currentLevel);

    requestAnimationFrame(Game.run);
  };

  // Entities are tracked by the engine for updating and rendering
  Game.addEntity = function(entity) {
      this.entities.push(entity);
      this.numEntities++;
  };
  Game.removeEntity = function(entity) {
      var index = this.entities.indexOf(entity);
      if (index > -1) { 
          this.entities.splice(index, 1);
          this.numEntities--; 
      }
  };
  // Gets a unique id for the object. 
  Game.newID = function(name){
      return {id: this.currentID+=1, name: name};
  };

  Game.update = function(dt) {
    
    physics.step(dt);

    if(isMouseDown) {
      var body = getBodyAtMouse(Game.world);
      if(body) {
        body.GetUserData().onPress();
        body.SetAwake(true);
      } else { // not selecting a body
        isMouseDown = false;
        var newStaticBody = geometryHandler(Game.physics,Game.newID("ground"));
        Game.addEntity(newStaticBody);
      }
    }
    
    for (var i = this.entities.length - 1; i >= 0; i--) {
        if(this.entities[i].update){this.entities[i].update();}
    }
  };

  Game.run = function() {
    var currentTime = new Date().getTime();
    requestAnimationFrame(Game.run);
    var deltaTime = (currentTime - lastFrame) / 1000;
    if(deltaTime > 1/15) { deltaTime = 1/15; }
    Game.update(deltaTime);
    lastFrame = currentTime;
    Game.render();
  };

  // Ajout du listener sur les collisions
  Game.addContactListener = function() {
    var b2Listener = Box2D.Dynamics.b2ContactListener;
    //Add listeners for contact
    var listener = new b2Listener();
    
    // Entrée en contact
    listener.BeginContact = function(contact) {
        var obj1 = contact.GetFixtureA();
        var obj2 = contact.GetFixtureB();
        if (isFootPlayer(obj1) || isFootPlayer(obj2)) {
            if (isGroundOrBox(obj1) || isGroundOrBox(obj2)) {  
                for (var i = players.length - 1; i >= 0; i--) {
                    players[i].jumpContacts++; // Add jump contact to all players
                }
            }
        }
    };
    
    // Fin de contact
    listener.EndContact = function(contact) {
        var obj1 = contact.GetFixtureA();
        var obj2 = contact.GetFixtureB();
        if (isFootPlayer(obj1) || isFootPlayer(obj2)) {
                for (var i = players.length - 1; i >= 0; i--) {
                    players[i].jumpContacts--; // Add jump contact to all players
                }
        }
    };
    listener.PostSolve = function(contact, impulse) {
        // PostSolve
    };
    listener.PreSolve = function(contact, oldManifold) {
        // PreSolve
    };
    Game.world.SetContactListener(listener);
  };

  Game.render = function() {

    // Draw over the context with a rectangle 
    this.context.clearRect(0,0,Game.element.width, Game.element.height);

    // Draw physics debug data if enabled
    if(Game.physics.debugDraw) {
        Game.physics.world.DrawDebugData();
    }

    // Save the context before transformations 
    this.context.save();
    this.context.scale(this.scale,this.scale);

    for (var i = this.entities.length - 1; i >= 0; i--) {
        if(this.entities[i].render) {this.entities[i].render(Game.context);}
    }

    this.context.restore();

  };

  Game.loadLevel = function(level){
    // Create some walls
    if (gameData.levels[level].walls) {
        for (var j = gameData.walls.length - 1; j >= 0; j--) {
            var wall = new Body(physics,gameData.walls[j],Game.newID("ground"));
            wall.id = Game.newID("ground");
        }
    }

    // Looks in the gameData file for objects to add to the level. 
    for (var i = 0; i < gameData.objects[level].length; i++) {
        var newBody;
        var newEnt;
        var name = "";
        for(var x in gameData.objects[level][i]) {
            if (x === "name") {
                name = gameData.objects[level][i][x];
            } else if (x === "shape") {
                newBody = new Body(physics,gameData.objects[level][i][x],Game.newID(name));
                newEnt = new Entity(newBody);
            } else if(newEnt){
                newEnt[x] = gameData.objects[level][i][x];
            } else {
                console.log("object doesn't have a shape!");
            }
        }
        newEnt.id = Game.newID(name);
        newEnt.init();
        Game.addEntity(newEnt);
        if (name == "player") {
            players.push(newEnt);
        }
    }
  };
 
  window.addEventListener("load",Game.init());
}());