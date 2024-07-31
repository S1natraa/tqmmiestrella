let ctx;
let canvas;
let maze;
let player;
let goal;

class Player {
    constructor() {
        this.reset();
    }
    reset() {
        this.col = 0;
        this.row = 0;
    }
    draw(cellSize) {
        let img = new Image();
        img.src = 'erick.png'; // Asegúrate de que esta ruta sea correcta
        img.onload = () => {
            ctx.drawImage(img, this.col * cellSize, this.row * cellSize, cellSize, cellSize);
        };
    }
}

class Goal {
    constructor(cols, rows) {
        this.col = cols - 1;
        this.row = rows - 1;
    }
    draw(cellSize) {
        let img = new Image();
        img.src = 'ricky.png'; // Asegúrate de que esta ruta sea correcta
        img.onload = () => {
            ctx.drawImage(img, this.col * cellSize, this.row * cellSize, cellSize, cellSize);
        };
    }
}

class Maze {
    constructor(cols, rows, cellSize) {
        this.cols = cols;
        this.rows = rows;
        this.cellSize = cellSize;
        this.cells = [];
        this.generate();
    }

    generate() {
        this.cells = [];
        for (let col = 0; col < this.cols; col++) {
            this.cells[col] = [];
            for (let row = 0; row < this.rows; row++) {
                this.cells[col][row] = new MazeCell(col, row);
            }
        }
        let stack = [];
        let startCell = this.cells[0][0];
        startCell.visited = true;
        stack.push(startCell);
        this.createMaze(stack);

        // Asegurarse de que el objetivo sea accesible
        this.ensurePathToGoal();
        this.redraw();
    }

    createMaze(stack) {
        while (stack.length > 0) {
            let currCell = stack[stack.length - 1];
            let nextCell = this.findUnvisitedNeighbor(currCell);
            if (nextCell) {
                this.removeWalls(currCell, nextCell);
                nextCell.visited = true;
                stack.push(nextCell);
            } else {
                stack.pop();
            }
        }
    }

    findUnvisitedNeighbor(cell) {
        let neighbors = [];
        if (cell.col > 0 && !this.cells[cell.col - 1][cell.row].visited) {
            neighbors.push(this.cells[cell.col - 1][cell.row]);
        }
        if (cell.col < this.cols - 1 && !this.cells[cell.col + 1][cell.row].visited) {
            neighbors.push(this.cells[cell.col + 1][cell.row]);
        }
        if (cell.row > 0 && !this.cells[cell.col][cell.row - 1].visited) {
            neighbors.push(this.cells[cell.col][cell.row - 1]);
        }
        if (cell.row < this.rows - 1 && !this.cells[cell.col][cell.row + 1].visited) {
            neighbors.push(this.cells[cell.col][cell.row + 1]);
        }
        if (neighbors.length > 0) {
            return neighbors[Math.floor(Math.random() * neighbors.length)];
        }
        return null;
    }

    removeWalls(currCell, nextCell) {
        if (currCell.col === nextCell.col && currCell.row === nextCell.row + 1) {
            currCell.northWall = false;
            nextCell.southWall = false;
        } else if (currCell.col === nextCell.col && currCell.row === nextCell.row - 1) {
            currCell.southWall = false;
            nextCell.northWall = false;
        } else if (currCell.col === nextCell.col + 1 && currCell.row === nextCell.row) {
            currCell.westWall = false;
            nextCell.eastWall = false;
        } else if (currCell.col === nextCell.col - 1 && currCell.row === nextCell.row) {
            currCell.eastWall = false;
            nextCell.westWall = false;
        }
    }

    ensurePathToGoal() {
        let goalCell = this.cells[this.cols - 1][this.rows - 1];
        if (!goalCell.visited) {
            let stack = [this.cells[0][0]];
            while (stack.length > 0) {
                let currCell = stack.pop();
                currCell.visited = true;
                let nextCell = this.findUnvisitedNeighbor(currCell);
                if (nextCell) {
                    this.removeWalls(currCell, nextCell);
                    nextCell.visited = true;
                    stack.push(nextCell);
                }
                if (currCell === goalCell) {
                    break;
                }
            }
        }
    }

    redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                let cell = this.cells[col][row];
                if (cell.eastWall) {
                    ctx.beginPath();
                    ctx.moveTo((col + 1) * this.cellSize, row * this.cellSize);
                    ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
                    ctx.stroke();
                }
                if (cell.northWall) {
                    ctx.beginPath();
                    ctx.moveTo(col * this.cellSize, row * this.cellSize);
                    ctx.lineTo((col + 1) * this.cellSize, row * this.cellSize);
                    ctx.stroke();
                }
                if (cell.southWall) {
                    ctx.beginPath();
                    ctx.moveTo(col * this.cellSize, (row + 1) * this.cellSize);
                    ctx.lineTo((col + 1) * this.cellSize, (row + 1) * this.cellSize);
                    ctx.stroke();
                }
                if (cell.westWall) {
                    ctx.beginPath();
                    ctx.moveTo(col * this.cellSize, row * this.cellSize);
                    ctx.lineTo(col * this.cellSize, (row + 1) * this.cellSize);
                    ctx.stroke();
                }
            }
        }
        player.draw(this.cellSize);
        goal.draw(this.cellSize);

        // Verificar si el jugador ha alcanzado el objetivo
        if (player.col === goal.col && player.row === goal.row) {
            endGame();
        }
    }
}

class MazeCell {
    constructor(col, row) {
        this.col = col;
        this.row = row;
        this.eastWall = true;
        this.northWall = true;
        this.southWall = true;
        this.westWall = true;
        this.visited = false;
    }
}

function onKeyDown(event) {
    switch (event.keyCode) {
        case 37:
        case 65: // Left arrow / A
            if (!maze.cells[player.col][player.row].westWall) {
                player.col -= 1;
            }
            break;
        case 39:
        case 68: // Right arrow / D
            if (!maze.cells[player.col][player.row].eastWall) {
                player.col += 1;
            }
            break;
        case 40:
        case 83: // Down arrow / S
            if (!maze.cells[player.col][player.row].southWall) {
                player.row += 1;
            }
            break;
        case 38:
        case 87: // Up arrow / W
            if (!maze.cells[player.col][player.row].northWall) {
                player.row -= 1;
            }
            break;
        default:
            break;
    }
    maze.redraw();
}

function onLoad() {
    canvas = document.getElementById('mainForm');
    ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;
    document.addEventListener('keydown', onKeyDown);

    // Mostrar la caja de bienvenida y asegurar que el canvas y congratsBox estén ocultos
    document.getElementById('welcomeBox').style.display = 'block';
    document.getElementById('mainForm').style.display = 'none';
    document.getElementById('congratsBox').style.display = 'none';
}

function startGame() {
    player = new Player();
    goal = new Goal(20, 20);
    maze = new Maze(20, 20, 40);
    document.getElementById('welcomeBox').style.display = 'none';
    document.getElementById('mainForm').style.display = 'block';
    maze.redraw();
}

function endGame() {
    document.getElementById('mainForm').style.display = 'none';
    document.getElementById('congratsBox').style.display = 'block';
}

function redirect() {
    window.location.href = 'playlist/index.html';
}
