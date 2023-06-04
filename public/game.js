import { setScore } from "./main.js";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
const p = document.getElementById("username");
const username = p.textContent;

canvas.width = 1000;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

let rotating = false;
let start = false;
let preparingMap = true;
let gameStarted = false;
let gameEnded = false;
let exitingMassege = false;
let userWon = false;
let waitBot = false;

function resetAllShips(ships, map) {
  ships.forEach(function (ship) {
    map.resetOccupiedCells(ship);
    ship.width = ship.originalWidth;
    ship.height = ship.originalHeight;
    ship.position.x = ship.originalX;
    ship.position.y = ship.originalY;
    ship.rotation = 0;
    ship.updateImage();
    rotating = false;
    start = false;
  });
}
function checkAllShipsInsideMap() {
  if (
    ships.find(function (ship) {
      return ship.position.x === ship.originalX;
    })
  ) {
    start = false;
  } else {
    start = true;
  }
}

function addShipsRandomly(ships, map) {
  resetAllShips(ships, map);
  ships.forEach(function (ship) {
    do {
      if (Math.floor(Math.random() * 2) === 1) {
        let temp = ship.width;
        ship.width = ship.height;
        ship.height = temp;
        ship.shipImg.src = "media/images/shape-rotated-id-" + ship.id + ".png";
        ship.rotation = 90;
      } else {
        ship.shipImg.src = "media/images/shape-id-" + ship.id + ".png";
        ship.rotation = 0;
      }
      do {
        let x = Math.floor(Math.random() * (25 * 14) + map.x);
        let y = Math.floor(Math.random() * (25 * 14) + map.y);
        if (
          !(
            x < map.x - 1 ||
            x + ship.width > map.x + map.size * 14 + map.size - 1 ||
            y < map.y ||
            y + ship.height > map.y + map.size * 14 + map.size - 1
          )
        ) {
          ship.position.x = x;
          ship.position.y = y;
          break;
        }
      } while (true);
      map.resetOccupiedCells(ship);
      map.updateShipPosition(ship);
    } while (ship.position.x === ship.originalX && ship.position.y === ship.originalY);
  });
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function playerTurn(event) {
  let x = event.offsetX;
  let y = event.offsetY;
  let xPosition = Math.floor((x - computerMap.x) / computerMap.size);
  let yPosition = Math.floor((y - computerMap.y) / computerMap.size);
  if (computerMap.grid[yPosition][xPosition].shoted) {
    return false;
  } else {
    computerMap.grid[yPosition][xPosition].shoted = true;
    computerMap.grid[yPosition][xPosition].occupied = false;
    computerMap.cellsShotted.push({ y: yPosition, x: xPosition });
    computerMap.grid[yPosition][xPosition].id !== null
      ? computerMap.checkIfShipDestroyed(
          computerMap.grid[yPosition][xPosition].id,
          computerShips
        )
      : "";
  }
  if (computerMap.cheksAllShipShotted()) {
    winner.text = "The winner is " + username + " congratulations!";
    userWon = true;
    gameStarted = false;
    exitingMassege = true;
    gameEnded = true;
  }
  waitBot = true;
  return true;
}

// bot AI

let goLeft = false;
let goRight = false;
let goDown = false;
let goUp = false;
let casual = true;
let bigShip = false;
let leftForBig = true;
let rightForBig = false;

var xForBot;
var yForBot;
let originalXBot;
let originalYBot;

async function botTurn() {
  if (goLeft) {
    map.grid[yForBot][xForBot].id === 6 ? (bigShip = true) : "";
    if (xForBot > 0 && map.grid[yForBot][xForBot - 1].shoted === false && bigShip === false) {
      xForBot -= 1;
      if (map.grid[yForBot][xForBot].occupied === false) {
        goLeft = false;
        goRight = true;
      }
    } else if (!bigShip) {
      goLeft = false;
      xForBot = originalXBot;
      if (xForBot < 13 && map.grid[yForBot][xForBot + 1].shoted === false) {
        xForBot += 1;
        if (map.grid[yForBot][xForBot].occupied === false) {
          goDown = true;
        } else {
          goRight = true;
        }
      } else if (originalYBot < 13 && map.grid[yForBot + 1][originalXBot].shoted === false ) {
        yForBot = originalYBot + 1;
        if (map.grid[yForBot][xForBot].occupied === false) {
          goUp = true;
        } else {
          goDown = true;
        }
      } else {
        yForBot = originalYBot - 1;
        goUp = true;
      }
    } else {
      if (leftForBig) {
        if (xForBot > 0 && map.grid[yForBot][xForBot - 1].occupied === true) {
          xForBot -= 1;
        } else {
          xForBot = originalXBot;
          if (
            xForBot < 13 &&
            map.grid[yForBot][xForBot + 1].occupied === true
          ) {
            leftForBig = false;
            rightForBig = true;
            xForBot += 1;
          } else {
            if (
              yForBot > 0 &&
              map.grid[yForBot - 1][xForBot].occupied === true
            ) {
              yForBot -= 1;
            } else {
              yForBot = originalYBot + 1;
              originalYBot = yForBot;
            }
          }
        }
      } else if (rightForBig) {
        xForBot < originalXBot ? (xForBot = originalXBot + 1) : "";
        if (xForBot < 13 && map.grid[yForBot][xForBot + 1].occupied === true) {
          xForBot += 1;
        } else {
          xForBot = originalXBot;
          if (yForBot > 0 && map.grid[yForBot - 1][xForBot].occupied === true) {
            yForBot -= 1;
          } else {
            yForBot = originalYBot + 1;
            originalYBot = yForBot;
          }
          rightForBig = false;
          leftForBig = true;
        }
      }
    }
  } else if (goRight) {
    xForBot < originalXBot ? (xForBot = originalXBot) : "";
    if (xForBot < 13 && map.grid[yForBot][xForBot + 1].shoted === false) {
      xForBot += 1;
      if (map.grid[yForBot][xForBot].occupied === false) {
        goRight = false;
        goDown = true;
      }
    } else {
      goRight = false;
      if (originalYBot < 13 && map.grid[yForBot + 1][xForBot].shoted === false) {
        yForBot = originalYBot + 1;
        if (map.grid[yForBot][xForBot].occupied === false) {
          goUp = true;
        } else {
          goDown = true;
        }
      } else {
        yForBot = originalYBot - 1;
        goUp = true;
      }
    }
  } else if (goDown) {    
    xForBot = originalXBot;
    if (yForBot < 13 && map.grid[yForBot + 1][xForBot].shoted === false) {
      yForBot += 1;
      if (map.grid[yForBot][xForBot].occupied === false) {
        goDown = false;
        goUp = true;
      }
    } else {
      goDown = false;
      yForBot = originalYBot;
      if (yForBot > 0 && map.grid[yForBot - 1][xForBot].shoted === false) {
        yForBot = originalYBot - 1;
        goUp = true;
      } else {
        casual = true;
      }
    }
  } else if (goUp) {
    yForBot > originalYBot ? (yForBot = originalYBot) : "";
    if (yForBot > 0 && map.grid[yForBot - 1][xForBot].shoted === false && xForBot >= 0) {
      yForBot -= 1;
      if (map.grid[yForBot][xForBot].occupied === false) {
        goUp = false;
        casual = true;
      }
    }
  } else if (casual) {
    do {
      if (Math.floor(Math.random() * 12) === 6) {
        do {
          xForBot = Math.floor(Math.random() * 14);
          yForBot = Math.floor(Math.random() * 14);
          goLeft = true;
          casual = false;
          originalXBot = xForBot;
          originalYBot = yForBot;
        } while (map.grid[yForBot][xForBot].occupied === false);
      } else {
        xForBot = Math.floor(Math.random() * 14);
        yForBot = Math.floor(Math.random() * 14);
        map.grid[yForBot][xForBot].occupied === true
          ? ((goLeft = true),
            (originalXBot = xForBot),
            (originalYBot = yForBot),
            (casual = false))
          : "";
      }
    } while (map.grid[yForBot][xForBot].shoted === true);
  }
  map.cellsShotted.push({ y: yForBot, x: xForBot });
  map.grid[yForBot][xForBot].shoted = true;
  map.grid[yForBot][xForBot].occupied = false;
  if (
    map.grid[yForBot][xForBot].id !== null &&
    map.checkIfShipDestroyed(map.grid[yForBot][xForBot].id, ships)
  ) {
    map.grid[yForBot][xForBot].id === 6 ? (bigShip = false) : ""
    goLeft = false;
    goRight = false;
    goDown = false;
    goUp = false;
    casual = true;
  }

  if (map.cheksAllShipShotted()) {
    winner.text = "The bot is the winner, good luck in the next time";
    gameStarted = false;
    exitingMassege = true;
    await sleep(2000)
    gameEnded = true;
  }
  waitBot = false;
}
class Text {
  constructor(text, x, y, font, color, spacing) {
    this.text = text;
    this.x = x;
    this.y = y;
    this.font = font;
    this.color = color;
    this.spacing = spacing;
  }
  drawText() {
    c.strokeStyle = "black";
    c.lineWidth = 2;
    c.font = this.font;
    c.fillStyle = this.color;
    c.textAlign = "center";
    c.fillText(this.text, this.x, this.y);
    c.letterSpacing = this.spacing;
  }
}

const title = new Text(
  "YOUR STRATEGY",
  440,
  50,
  "bold 30px Friz Quadrata Std Medium",
  "#1ef400",
  "2px"
);

const iconDelete = new Text("\uf1f8", 700, 200, "50px FontAwesome", "#1ef400");

const iconRandomPositions = new Text(
  "\uf074",
  700,
  300,
  "50px FontAwesome",
  "#1ef400"
);

const iconStart = new Text("\uf04b", 700, 400, "50px FontAwesome", "#1ef400");

const lableUser = new Text(
  username + "'s map",
  780,
  40,
  "bold 30px Friz Quadrata Std Medium",
  "#1ef400",
  "2px"
);

const lableBot = new Text(
  "Bot map",
  220,
  40,
  "bold 30px Friz Quadrata Std Medium",
  "#1ef400",
  "2px"
);

const winner = new Text(
  null,
  480,
  220,
  "bold 30px Friz Quadrata Std Medium",
  "#1ef400",
  "2px"
);

const massegeCell = new Text(
  "At least one cell between two ships",
  400,
  450,
  "bold 14px Friz Quadrata Std Medium",
  "#1ef400",
  "2px"
);

const massege = new Text(
  "play again",
  480,
  350,
  "bold 16px Friz Quadrata Std Medium",
  "#1ef400",
  "2px"
);

const iconRestart = new Text("\uf04b", 485, 320, "50px FontAwesome", "#1ef400");

const endGameMassege = new Text(
  "Click to exit the game",
  400,
  450,
  "bold 14px Friz Quadrata Std Medium",
  "#1ef400",
  "2px"
);

class Ship {
  constructor({ position, width, height, id, size }) {
    this.position = position;
    this.width = width;
    this.height = height;
    this.id = id;
    this.originalWidth = width;
    this.originalHeight = height;
    this.isDragging = false;
    this.originalX = position.x;
    this.originalY = position.y;
    this.size = size;
    this.startXmap = 0;
    this.endXmap = 0;
    this.startYmap = 0;
    this.endYmap = 0;
    this.rotation = 0;
    this.iconRotate = new Text(
      "\uf2f1",
      700,
      100,
      "50px FontAwesome",
      "#1ef400"
    );
    this.shipImg = new Image();
    this.shipImg.src = "media/images/shape-id-" + this.id + ".png";
  }
  draw() {
    this.shipImg.onload = function () {
      c.drawImage(
        this.shipImg,
        this.position.x,
        this.position.y,
        1 * this.width,
        1 * this.height
      );
    }.bind(this);
    c.drawImage(
      this.shipImg,
      this.position.x,
      this.position.y,
      1 * this.width,
      1 * this.height
    );
  }
  update() {
    this.draw();
  }
  checkIfMouseOver(x, y) {
    return (
      x >= this.position.x &&
      x <= this.position.x + this.width &&
      y >= this.position.y &&
      y <= this.position.y + this.height
    );
  }
  handleMouseMove(event) {
    if (this.isDragging) {
      var x = event.offsetX - this.width / 2;
      var y = event.offsetY - this.height / 2;
      this.position.x = x;
      this.position.y = y;
      rotating = true;
    }
  }
  handleMouseUp(event) {
    if (!this.isDragging) return;
    this.isDragging = false;
    var x = event.offsetX - this.width / 2;
    var y = event.offsetY - this.height / 2;
    if (
      x < map.x - 2 ||
      x + this.width > map.x + map.size * 14 + map.size - 2 ||
      y < map.y - 2 ||
      y + this.height > map.y + map.size * 14 + map.size - 2
    ) {
      this.width = this.originalWidth;
      this.height = this.originalHeight;
      this.position.x = this.originalX;
      this.position.y = this.originalY;
      this.rotation = 0;
      this.updateImage();
      rotating = false;
      map.resetOccupiedCells(this);
      checkAllShipsInsideMap();
    } else {
      map.resetOccupiedCells(this);
      map.updateShipPosition(this);
    }
  }
  handleMouseClick(event) {
    const textWidth = c.measureText(this.iconRotate.text).width;
    const textHeight = parseInt(this.iconRotate.font, 10);
    const rect = {
      x: this.iconRotate.x - textWidth / 2,
      y: this.iconRotate.y - textHeight / 2,
      width: textWidth,
      height: textHeight,
    };
    const x = event.offsetX;
    const y = event.offsetY;
    if (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y - 20 &&
      y <= rect.y + rect.height - 20 &&
      rotating
    ) {
      this.rotate();
    }
  }
  rotate() {
    let temp = this.width;
    this.width = this.height;
    this.height = temp;
    var x = this.position.x;
    var y = this.position.y;
    if (
      x < map.x - 1 ||
      x + this.width > map.x + map.size * 14 + map.size - 1 ||
      y < map.y ||
      y + this.height > map.y + map.size * 14 + map.size - 1
    ) {
      this.width = this.originalWidth;
      this.height = this.originalHeight;
      this.position.x = this.originalX;
      this.position.y = this.originalY;
      this.rotation = 0;
      this.updateImage();
      map.resetOccupiedCells(this);
      rotating = false;
    } else {
      this.rotation += 90;
      if (this.rotation === 180) {
        this.rotation = 0;
      }
      map.resetOccupiedCells(this);
      map.updateShipPosition(this);
      this.updateImage();
    }
  }
  updateImage() {
    if (this.rotation === 0) {
      this.shipImg.src = "media/images/shape-id-" + this.id + ".png";
    } else {
      this.shipImg.src = "media/images/shape-rotated-id-" + this.id + ".png";
    }
  }
}

class Map {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.grid = [];
    this.cellsShotted = [];
    this.createGrid();
  }

  createGrid() {
    for (let y = 0; y < 14; y++) {
      this.grid[y] = [];
      for (let x = 0; x < 14; x++) {
        this.grid[y][x] = {
          x: this.x + x * this.size,
          y: this.y + y * this.size,
          occupied: false,
          id: null,
          shoted: false,
        };
      }
    }
  }
  updatePostionGrid() {
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 14; x++) {
        this.grid[y][x].x = this.x + x * this.size;
        this.grid[y][x].y = this.y + y * this.size;
      }
    }
  }
  draw() {
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 14; x++) {
        c.beginPath();
        c.rect(
          this.x + x * this.size,
          this.y + y * this.size,
          this.size,
          this.size
        );
        c.lineWidth = 1;
        c.strokeStyle = "#1ef400";
        c.stroke();
      }
    }
  }
  drawInMatching(x, y) {
    this.x = x;
    this.y = y;
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 14; x++) {
        c.beginPath();
        c.rect(
          this.x + x * this.size,
          this.y + y * this.size,
          this.size,
          this.size
        );
        c.lineWidth = 1;
        c.strokeStyle = "#1ef400";
        c.stroke();
      }
    }
  }
  updateShipPosition(ship) {
    ship.startXmap = Math.floor((ship.position.x - this.x) / this.size);
    ship.endXmap = ship.startXmap + Math.ceil(ship.width / this.size);
    ship.startYmap = Math.floor((ship.position.y - this.y) / this.size);
    ship.endYmap = ship.startYmap + Math.ceil(ship.height / this.size);
    ship.startXmap <= -1
      ? (ship.startXmap = 0)
      : ship.startXmap >= 14
      ? (ship.startXmap = 13)
      : "";
    ship.startYmap <= -1
      ? (ship.startYmap = 0)
      : ship.startYmap >= 14
      ? (ship.startYmap = 13)
      : "";
    ship.position.x = this.grid[ship.startYmap][ship.startXmap].x;
    ship.position.y = this.grid[ship.startYmap][ship.startXmap].y;

    if (!this.checkDistance(ship)) {
      ship.width = ship.originalWidth;
      ship.height = ship.originalHeight;
      ship.position.x = ship.originalX;
      ship.position.y = ship.originalY;
      ship.rotation = 0;
      ship.updateImage();
      rotating = false;
    } else {
      for (let y = ship.startYmap; y < ship.endYmap; y++) {
        for (let x = ship.startXmap; x < ship.endXmap; x++) {
          this.grid[y][x].occupied = true;
          this.grid[y][x].id = ship.id;
        }
      }
    }
    checkAllShipsInsideMap();
  }
  resetOccupiedCells(ship) {
    for (let y = ship.startYmap; y < ship.endYmap; y++) {
      for (let x = ship.startXmap; x < ship.endXmap; x++) {
        if (ship.id === this.grid[y][x].id) {
          this.grid[y][x].occupied = false;
          this.grid[y][x].id = null;
        }
      }
    }
  }
  checkIfShipDestroyed(id, ships) {
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 14; x++) {
        if (this.grid[y][x].id === id && this.grid[y][x].occupied === true) {
          return false;
        }
      }
    }
    let startingX = ships[id - 1].startXmap;
    let startingY = ships[id - 1].startYmap;
    let shipWidth = ships[id - 1].width / this.size;
    let shipHeight = ships[id - 1].height / this.size;
    for (let y = startingY - 1; y <= startingY + shipHeight; y++) {
      for (let x = startingX - 1; x <= startingX + shipWidth; x++) {
        if (x <= 13 && x >= 0 && (y >= 0) & (y <= 13)) {
          if (this.grid[y][x].shoted === false) {
            this.cellsShotted.push({ y: y, x: x });
            this.grid[y][x].shoted = true;
          }
        }
      }
    }
    return true;
  }
  checkDistance(ship) {
    let startX = Math.floor((ship.position.x - this.x) / this.size);
    let startY = Math.floor((ship.position.y - this.y) / this.size);
    let shipWidth = ship.width / this.size;
    let shipHeight = ship.height / this.size;
    for (let y = startY - 1; y <= startY + shipHeight; y++) {
      for (let x = startX - 1; x <= startX + shipWidth; x++) {
        if (this.grid[y] && this.grid[y][x] && this.grid[y][x].occupied) {
          return false;
        }
      }
    }
    return true;
  }
  draw() {
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 14; x++) {
        c.beginPath();
        c.rect(
          this.x + x * this.size,
          this.y + y * this.size,
          this.size,
          this.size
        );
        c.lineWidth = 1;
        c.strokeStyle = "#1ef400";
        c.stroke();
      }
    }
  }
  fillCells() {
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 14; x++) {
        let currCell = this.grid[y][x];
        let hasSurrounding = false;
        if (x > 0 && y > 0 && this.grid[y - 1][x - 1].id !== null) {
          hasSurrounding = true;
        }
        if (x > 0 && y < 13 && this.grid[y + 1][x - 1].id !== null) {
          hasSurrounding = true;
        }
        if (x < 13 && y < 13 && this.grid[y + 1][x + 1].id !== null) {
          hasSurrounding = true;
        }
        if (x < 13 && y > 0 && this.grid[y - 1][x + 1].id !== null) {
          hasSurrounding = true;
        }
        if (y > 0 && this.grid[y - 1][x].id !== null) {
          hasSurrounding = true;
        }
        if (y < 13 && this.grid[y + 1][x].id !== null) {
          hasSurrounding = true;
        }
        if (x > 0 && this.grid[y][x - 1].id !== null) {
          hasSurrounding = true;
        }
        if (x < 13 && this.grid[y][x + 1].id !== null) {
          hasSurrounding = true;
        }
        if (hasSurrounding || currCell.id !== null) {
          let xForFill = currCell.x;
          let yForFill = currCell.y;
          c.beginPath();
          c.rect(xForFill + 1, yForFill + 1, this.size - 2, this.size - 2);
          c.fillStyle = "#1a7306";
          c.fill();
        }
      }
    }
  }
  shot() {
    this.cellsShotted.forEach(
      function (cell) {
        let x = cell.x;
        let y = cell.y;
        c.beginPath();
        c.rect(
          this.grid[y][x].x + 1,
          this.grid[y][x].y + 1,
          this.size - 2,
          this.size - 2
        );
        if (this.grid[y][x].shoted && this.grid[y][x].id) {
          c.fillStyle = "#6b0e04";
          this.grid[y][x].occupied = false;
          c.fill();
          c.beginPath();
          c.moveTo(this.grid[y][x].x + 2, this.grid[y][x].y + 2);
          c.lineTo(
            this.grid[y][x].x + this.size - 2,
            this.grid[y][x].y + this.size - 2
          );
          c.moveTo(this.grid[y][x].x + this.size - 2, this.grid[y][x].y + 2);
          c.lineTo(this.grid[y][x].x + 2, this.grid[y][x].y + this.size - 2);
          c.lineWidth = 2;
          c.strokeStyle = "#b60803";
          c.stroke();
        } else {
          c.fillStyle = "#1c8004";
          c.fill();
        }
      }.bind(this)
    );
  }
  cheksAllShipShotted() {
    for (let y = 0; y < 14; y++) {
      for (let x = 0; x < 14; x++) {
        if (
          this.grid[y][x].occupied === true &&
          this.grid[y][x].shoted === false
        ) {
          return false;
        }
      }
    }
    return true;
  }
}

const map = new Map(250, 70, 25);

const computerMap = new Map(40, 80, 25);

const ships = [
  new Ship({
    position: {
      x: 80,
      y: 75,
    },
    width: 25,
    height: 75,
    id: 1,
    size: 3,
  }),
  new Ship({
    position: {
      x: 140,
      y: 50,
    },
    width: 25,
    height: 100,
    id: 2,
    size: 4,
  }),
  new Ship({
    position: {
      x: 80,
      y: 200,
    },
    width: 25,
    height: 100,
    id: 3,
    size: 4,
  }),
  new Ship({
    position: {
      x: 140,
      y: 175,
    },
    width: 25,
    height: 125,
    id: 4,
    size: 5,
  }),
  new Ship({
    position: {
      x: 80,
      y: 320,
    },
    width: 25,
    height: 150,
    id: 5,
    size: 6,
  }),
  new Ship({
    position: {
      x: 140,
      y: 345,
    },
    width: 50,
    height: 125,
    id: 6,
    size: 10,
  }),
];

const computerShips = [
  new Ship({
    position: {
      x: 80,
      y: 75,
    },
    width: 25,
    height: 75,
    id: 1,
    size: 3,
  }),
  new Ship({
    position: {
      x: 140,
      y: 50,
    },
    width: 25,
    height: 100,
    id: 2,
    size: 4,
  }),
  new Ship({
    position: {
      x: 80,
      y: 200,
    },
    width: 25,
    height: 100,
    id: 3,
    size: 4,
  }),
  new Ship({
    position: {
      x: 140,
      y: 175,
    },
    width: 25,
    height: 125,
    id: 4,
    size: 5,
  }),
  new Ship({
    position: {
      x: 80,
      y: 320,
    },
    width: 25,
    height: 150,
    id: 5,
    size: 6,
  }),
  new Ship({
    position: {
      x: 140,
      y: 345,
    },
    width: 50,
    height: 125,
    id: 6,
    size: 10,
  }),
];

let draggedShip;

canvas.addEventListener("mousedown", function (event) {
  ships.forEach(function (ship) {
    if (ship.checkIfMouseOver(event.offsetX, event.offsetY)) {
      ship.isDragging = true;
      draggedShip = ship;
    }
  });
});

canvas.addEventListener("mousemove", function (event) {
  if (draggedShip && preparingMap) {
    draggedShip.handleMouseMove(event);
  }
});

canvas.addEventListener("mouseup", function (event) {
  if (draggedShip && preparingMap) {
    draggedShip.handleMouseUp(event);
  }
});

canvas.addEventListener("click", function (event) {
  if (draggedShip && preparingMap) {
    draggedShip.handleMouseClick(event);
  }
});

canvas.addEventListener("click", function (event) {
  const textWidth = c.measureText(iconDelete.text).width;
  const textHeight = parseInt(iconDelete.font, 10);
  const rect = {
    x: iconDelete.x - textWidth / 2,
    y: iconDelete.y - textHeight / 2,
    width: textWidth,
    height: textHeight,
  };
  const x = event.offsetX;
  const y = event.offsetY;
  if (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y - 20 &&
    y <= rect.y + rect.height - 20
  ) {
    resetAllShips(ships, map);
  } else if (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y + 80 &&
    y <= rect.y + rect.height + 80
  ) {
    addShipsRandomly(ships, map);
  } else if (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y + 160 &&
    y <= rect.y + rect.height + 160
  ) {
    preparingMap = false;
    gameStarted = true;
    map.x = 600;
    map.y = 80;
    map.updatePostionGrid();
    addShipsRandomly(computerShips, computerMap);
  } else if (gameStarted) {
    if (
      x > computerMap.x &&
      x < computerMap.x + computerMap.size * 14 &&
      y > computerMap.y &&
      y < computerMap.y + computerMap.size * 14 &&
      !waitBot
    ) {
      if (playerTurn(event)) {
        botTurn();
      }
    }
  } else if (gameEnded) {
    const rect1 = {
      x: massege.x - textWidth / 2,
      y: massege.y - textHeight / 2,
      width: textWidth,
      height: textHeight,
    };
    if (
      x >= rect1.x - 20 &&
      x <= rect1.x + rect1.width &&
      y >= rect1.y - 30 &&
      y <= rect1.y + rect1.height - 30
    ) {
      if (userWon) {
        setScore();
      }
      location.reload();
    }
  }
});
function animate() {
  window.requestAnimationFrame(animate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  if (preparingMap) {
    title.drawText();
    iconDelete.drawText();
    map.fillCells();
    massegeCell.drawText();
    iconRandomPositions.drawText();
    map.draw();
    ships.forEach(function (ship) {
      ship.update();
      if (rotating) {
        ship.iconRotate.drawText();
      }
    });
    if (start) {
      iconStart.drawText();
    }
  } else if (gameStarted) {
    map.draw();
    computerMap.draw();
    lableUser.drawText();
    lableBot.drawText();
    computerMap.shot();
    map.shot();
    if (exitingMassege) {
      endGameMassege.drawText();
    }
  } else if (gameEnded) {
    winner.drawText();
    massege.drawText();
    iconRestart.drawText();
  }
}

animate();
