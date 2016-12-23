// Daniel Shiffman
// http://codingrainbow.com
// http://patreon.com/codingrainbow
// Code for: https://youtu.be/hacZU523FyM

function Asteroid(world, params) {
  var levelmanager = params.levelmanager;
  params.pos = params.pos !== undefined ? params.pos : createVector(random(-world.halfwidth, world.halfwidth), random(-world.halfheight, world.halfheight));
  params.r = params.r !== undefined ? params.r : random(60, 80);
  params.mass = params.mass !== undefined ? params.mass : PI * params.r * params.r;
  Entity.call(this, params);
  this.vel = params.vel !== undefined ? params.vel : createVector(0, 0);
  Entity.prototype.applyForce.call(this, params.force !== undefined ? params.force : p5.Vector.random2D().mult(5000));
  Entity.prototype.applyTorque.call(this, random(-0.03, 0.03));
  this.heading = params.heading !== undefined ? params.heading : 0;
  this.c = params.c !== undefined ? params.c : color(255);
  const minArea = 750;

  if (params.shape === undefined) {
    vertices = [];
    this.total = floor(random(7, 15));
    var range = this.r * 0.5;
    for (var i = 0; i < this.total; i++) {
      var angle = map(i, 0, this.total, 0, TWO_PI);
      var r = this.r - random(0, range);
      vertices.push(createVector(r * cos(angle), r * sin(angle)));
    }
    this.shape = new Shape(vertices);
  } else {
    this.shape = params.shape;
    var offset = this.shape.centroid;
    this.pos.add(offset.rotate(this.heading));
    this.shape.recenter();
  }
  
  if(params.debris === true) {
    this.shape.breakAnime();
    this.canCollide = false;
    this.rotation = 0;
  }
  else {
    levelmanager.recordAsteroidCreation();
  }

  this.render = function() {
    push();
    strokeWeight(3);
    colorMode(RGB);
    noFill();
    if (this.canCollide) {
      stroke(255);
    } else {
      stroke(red(this.c), green(this.c), blue(this.c), this.shape.fade());
    }
    translate(this.pos.x, this.pos.y);
    
    //For debugging
    if (this.canCollide) {
      point(0, 0);
      ellipse(0, 0, this.r*2);
    }
    //
    
    rotate(this.heading);
    if (!this.shape.draw()) this.dead = true;
    pop();
  }

  this.collides = function(entity) { }

  this.collision = function(entity) {
    if (!this.dead && entity.toString() === "[object Laser]") {
      playSoundEffect(explosionSoundEffects[floor(random(0, explosionSoundEffects.length))]);

      var destroyedArea = 0;
      if (this.shape.area < minArea * 2) {
        this.c = entity.c;
        this.shape.breakAnime();
        this.canCollide = false;
        this.rotation = 0;
        destroyedArea = this.shape.area;
      } else {
        this.intersectionPoints = this.shape.intersections(p5.Vector.sub(p5.Vector.sub(entity.pos, entity.vel), this.pos).rotate(-this.heading), entity.vel.heading()-this.heading);
        if(this.intersectionPoints.length > 0) {
          var impact = this.intersectionPoints[0].copy().rotate(this.heading);
          impact.add(this.pos);
          
          vertices = [];
          for (var i = 0; i < TWO_PI; i += TWO_PI / 10) {
            var r = 30 + random(10);
            vertices.push(createVector(r * cos(i), r * sin(i)));
          }
          crateShape = new Shape(vertices);
          
          var newShapes = this.shape.sub(this.pos, this.heading, impact, 0, crateShape);
          
          newShapes = Shape.makeAsteroidSized(newShapes);
          
          while(newShapes[0].length == 1) {
            newShapes[0] = newShapes[0][0].splitAtWeakestPoint();
            newShapes = Shape.makeAsteroidSized(newShapes);
          }
          
          var scope = this;
          world.addEndFrameTask(function() {
            for(var j = 0; j < newShapes[0].length; j++) {
              world.createEntity(Asteroid, {
                pos: scope.pos.copy(),
                r: newShapes[0][j].r,
                shape: newShapes[0][j],
                vel: scope.vel.copy(),
                heading: scope.heading,
                force: newShapes[0][j].centroid.copy().mult(50),
                levelmanager: levelmanager
              });
            }
            for(j = 0; j < newShapes[1].length; j++) {
              world.createEntity(Asteroid, {
                pos: scope.pos.copy(),
                r: newShapes[1][j].r,
                shape: newShapes[1][j],
                vel: scope.vel.copy(),
                heading: scope.heading,
                debris: true,
                force: createVector(0, 0),
                c: entity.c,
                levelmanager: levelmanager
              });
            }
          });
          
          destroyedArea = this.shape.area;
          for( var j = 0; j < newShapes[0].length; j++ ) {
            destroyedArea -= newShapes[0][j].area;
          }
          
          this.dead = true;
        }
      }
      levelmanager.recordKill(entity.owner, destroyedArea);
    }
  }

  this.globalVertices = function() {
    return this.shape.globalVertices(this.pos, this.heading);
  }

  this.toString = function() {
    return "[object Asteroid]";
  }
}


Asteroid.prototype = Object.create(Entity.prototype);