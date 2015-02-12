var gameData = {
	currentLevel : 0,
	levels : [ 
		{		
			levelID:1,
			levelName:"steven",
			timeLimit:0,
			walls:true,
			gravity:{x:0,y:9.8}
		}
		
	],
	objects : [[
		{
			name: "player",
			shape: {shape: "block",color:"black",width:0.75, height:2 , x: 5, y: 8, fixedRotation:true },
			init: function(){

				// create foot http://www.iforce2d.net/b2dtut/jumpability
				// Add the "feet"
			    var footDef = new b2FixtureDef();
			    footDef.friction = 2;
			    footDef.userData = {id:0,name:"footPlayer"};
			    footDef.shape = new b2PolygonShape();
			    footDef.shape.SetAsOrientedBox (10 / 30, 10 / 30,
			            new b2Vec2 (0, 2),   // body position relative to the center
			            0    );                                        // orientation angle
			    footDef.isSensor = true;
			    this.physicsComponent.body.CreateFixture(footDef);

				this.maxSpeed = 15;
				this.input = new PlayerInputComponent(this.maxSpeed);
				this.anim = new SpriteSheet('img/spritesheet.png',125,125,3,16);

				this.jumpContacts = 0; // Jump contacts are set to the foot.
			},
			update: function(){
				var inputReturn = this.input.update(this.physicsComponent);
				this.anim.update(this.physicsComponent);

				if (inputReturn && (this.jumpContacts > 0)) {
					this.physicsComponent.body.SetAwake(true);
					this.physicsComponent.body.ApplyImpulse(new b2Vec2(0,-20),this.physicsComponent.body.GetWorldCenter()); 
				}
			},
			render: function(context){
				var pos = this.physicsComponent.body.GetPosition(),
				angle = this.physicsComponent.body.GetAngle();

				this.anim.render(context,pos,angle);
			}
			
		}]],
	walls: [
		{ type: "static", x: 0, y: 0, height: 25,  width: 0.5 },
		{ type: "static", x:51, y: 0, height: 25,  width: 0.5},
		{ type: "static", x: 0, y: 0, height: 0.5, width: 60 },
		{ type: "static", x: 0, y:25, height: 0.5, width: 60 }
	]
};