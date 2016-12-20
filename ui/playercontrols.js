function PlayerControls(id) {
  UIElement.call(this, id, {
    pos: createVector(0, 0)
  });
  var keys = {
    right: false,
    left: false,
    up: false,
    down: false,
    f: false,
    space: false,
    spacerepeat: false
  };

  this.update = function (world) {
    world.getLocalPlayer().getEntity().setInputs(
      createVector(mouseX - windowWidth / 2, mouseY - windowHeight / 2),
      keys.up,
      keys.down,
      keys.left,
      keys.right,
      keys.f,
      keys.space || keys.space.repeat
    );
    keys.space = false;
    keys.f = false;
  }

  this.render = function (world) {
    push();
    textSize(32);
    textAlign(LEFT);
    fill(255);
    if (world.getLocalPlayer().getEntity().velDragEnabled) {
      text("Stabilizers ON", 100, 0);
    } else {
      text("Stabilizers OFF", 100, 0);
    }

    pop();
  }

  var scope = this;
  world.registerListener(id, " ".charCodeAt(0), function (char, code, press) {
    keys.spacerepeat = press;
    if (press) {
      keys.space = true;
    }
  });
  world.registerListener(id, "F".charCodeAt(0), function (char, code, press) {
    keys.f = press;
  });
  world.registerListener(id, "D".charCodeAt(0), function (char, code, press) {
    keys.right = press;
  });
  world.registerListener(id, "A".charCodeAt(0), function (char, code, press) {
    keys.left = press;
  });
  world.registerListener(id, "W".charCodeAt(0), function (char, code, press) {
    keys.up = press;
  });
  world.registerListener(id, "S".charCodeAt(0), function (char, code, press) {
    keys.down = press;
  });
}

PlayerControls.prototype = Object.create(UIElement.prototype);
