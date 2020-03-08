'use strict'

class Settings {
  constructor() {
    this.animate = true;
    this.showDiagnostics = true;
    this.drawFlowfield = false;
    this.rows = 15;
    this.columns = 15;
    this.octaves = 4;
    this.falloff = 0.65;
    this.xy_increment = 0.05;
    this.z_increment = 0.001;
    this.count = 300;
  }
}

let gui = null;
let settings = new Settings();

let sclx, scly;
let zoff = 0;
let particles = [];
let flowfield;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('display', 'block');

  textFont('monospace');

  initializeFlowField();
  initializeParticles();
  initializeGuiControls();

  background(0);
}

function initializeFlowField() {
  sclx = floor(width / settings.columns);
  scly = floor(height / settings.rows);
  
  flowfield = new Array(settings.columns, settings.rows);
}

function initializeGuiControls() {
  gui = new dat.GUI()
  gui.add(settings, 'animate');
  gui.add(settings, 'drawFlowfield');

  gui.add(settings, 'rows', 1, 50).onFinishChange(n => setup());
  gui.add(settings, 'columns', 1, 50).onFinishChange(n => setup());
  gui.add(settings, 'octaves', 1, 10);
  gui.add(settings, 'falloff', 0, 1);
  gui.add(settings, 'xy_increment', 0, 0.2);
  gui.add(settings, 'z_increment', 0, 0.05);
  gui.add(settings, 'count', 1, 1000).onFinishChange(n => initializeParticles());

  gui.close();
}

function initializeParticles() {
  particles = [];

  for (var i = 0; i < settings.count; i++)
    particles[i] = new Particle(random(windowWidth), random(windowHeight));
}

function windowResized() {
  setup();
}

function mouseDragged() {
  if (mouseButton === LEFT) {
    particles.push(new Particle(mouseX, mouseY));
    settings.count++;
  }
}

function keyTyped() {
  switch (key) {
    case "a":
      settings.animate = !settings.animate;
      break;

    case "d":
      settings.showDiagnostics = !settings.showDiagnostics;
      break;

    case "h":
      gui.closed ? gui.open() : gui.close();
      break;

    default:
      // Prevent default behavior
      return false;
  }
}

// Main update loop
function draw() {
  updateControls();

  noiseDetail(settings.octaves, settings.falloff);
  background(0, 50);

  if (settings.showDiagnostics)
    drawDiagnostics();

  if (settings.animate) {
    updateFlowfield();
    updateParticles();
  }

  if (settings.drawFlowfield)
    drawFlowfield();
}

function updateFlowfield() {
  let yoff = 0;
  for (let y = 0; y < settings.rows; y++) {
    let xoff = 0;
    for (let x = 0; x < settings.columns; x++) {
      let index = x + y * scly;
      let angle = noise(xoff, yoff, zoff) * TWO_PI * 2;
      let v = p5.Vector.fromAngle(angle);
      flowfield[index] = v;
      
      xoff += (x < (settings.columns / 2) ? settings.xy_increment : -settings.xy_increment);
    }

    yoff += (y < (settings.rows / 2) ? settings.xy_increment : -settings.xy_increment);
  }

  zoff += settings.z_increment;
}

function drawFlowfield() {
  
  stroke(255, 50);
  strokeWeight(1);

  for (let y = 0; y < settings.rows; y++) {
    for (let x = 0; x < settings.columns; x++) {
      push();
      translate(x * sclx + sclx / 2, y * scly + scly / 2);
      let i = x + y * scly;
      rotate(flowfield[i].heading());
      line(0, 0, sclx, 0);
      pop();
    }
  }
}

function updateParticles() {
  for (let particle of particles) {
    particle.update(flowfield, sclx, scly);
    particle.draw();
  }
}

function updateControls() {
  for (let i in gui.__controllers)
    gui.__controllers[i].updateDisplay();
}

function drawDiagnostics() {
  // Clear background
  push();

  fill(0);
  stroke(0);
  rectMode(CORNER)
  rect(5, 5, 80, 40);

  textSize(12);
  fill(255);
  stroke(0);

  let fps = frameRate();
  text("FPS:   " + fps.toFixed(), 10, 20);
  text("Count: " + particles.length.toFixed(), 10, 40);

  pop();
}