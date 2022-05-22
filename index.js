const CELL_SIZE = 20;
const FPS = 60;
const DELTAS = [
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: -1, y: 1 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
];
const STYLES = {
  BACKGROUND_COLOR: "#FFF",
  DEAD_COLOR: "#FFF",
  ALIVE_COLOR: "#000",
  BORDER_COLOR: "#EEE",
  BORDER_WIDTH: "2",
};

const gen = document.getElementById("generation");
const pop = document.getElementById("population");
const icon = document.getElementsByClassName("material-icons")[0];
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let generation = 0,
  population = 0;

class Cell {
  constructor(_x, _y) {
    this.x = _x;
    this.y = _y;
    this.alive = false;
  }

  draw() {
    ctx.strokeStyle = STYLES.BORDER_COLOR;
    ctx.lineWidth = STYLES.BORDER_WIDTH;

    if (this.alive) {
      ctx.fillStyle = STYLES.ALIVE_COLOR;
      ctx.fillRect(
        this.x * CELL_SIZE,
        this.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    } else {
      ctx.fillStyle = STYLES.DEAD_COLOR;
      ctx.rect(this.x * CELL_SIZE, this.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    ctx.stroke();
  }

  update(oldState) {
    let neighbours = 0;

    for (let delta of DELTAS) {
      if (
        !(this.x + delta.x < 0 || this.x + delta.x > 15) &&
        !(this.y + delta.y < 0 || this.y + delta.y > 15)
      ) {
        if (oldState[this.y + delta.y][this.x + delta.x].alive) {
          neighbours++;
        }
      }
    }

    if ((neighbours < 2 || neighbours > 3) && this.alive) {
      this.alive = false;
      population--;
    }

    if (!this.alive && neighbours === 3) {
      this.alive = true;
      population++;
    }
  }
}

class Game {
  constructor() {
    this.table = new Array(16)
      .fill(null)
      .map((_, y) => new Array(16).fill(null).map((_, x) => new Cell(x, y)));
    this.running = false;
  }

  next() {
    generation++;
    gen.innerHTML = generation;
    pop.innerHTML = population;

    let oldState = structuredClone(this.table);

    for (let row of this.table) {
      for (let cell of row) {
        cell.update(oldState);
      }
    }
  }

  draw() {
    canvas.width = canvas.width;
    ctx.fillStyle = STYLES.BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row of this.table) {
      for (let cell of row) {
        cell.draw();
      }
    }
  }

  run() {
    if (this.running) {
      this.draw();
      this.next();
    }
  }
}

const game = new Game();
game.draw();

document.addEventListener("keypress", (ev) => {
  if (ev.key === " ") {
    game.running = !game.running;

    if (game.running) {
      icon.innerHTML = "pause";
      generation = 0;
      gen.innerHTML = 0;
    } else {
      icon.innerHTML = "play_arrow";
    }
  }
});

icon.addEventListener("mousedown", (ev) => {
  game.running = !game.running;

  if (game.running) {
    icon.innerHTML = "pause";
    generation = 0;
    gen.innerHTML = 0;
  } else {
    icon.innerHTML = "play_arrow";
  }
});

canvas.addEventListener("mousedown", (ev) => {
  if (!game.running) {
    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((ev.clientX - rect.left) / CELL_SIZE);
    let y = Math.floor((ev.clientY - rect.top) / CELL_SIZE);

    game.table[y][x].alive = !game.table[y][x].alive;

    if (game.table[y][x].alive) population++;
    else population--;

    pop.innerHTML = population;

    game.draw();
  }
});

setInterval(() => {
  window.requestAnimationFrame(() => game.run());
}, 1000 / FPS);
