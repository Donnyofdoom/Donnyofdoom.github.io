window.onload = function() {
    document.body.addEventListener('keydown', function(event) {
        const key = event.key;
        if (key === 'n') {
            document.getElementById("mirror").checked = !document.getElementById("mirror").checked;
        }
    });
    dimChange();
}

let cells = [];
let dim = {height: 0, width: 0};

function dimChange() {
    let width = parseInt(document.getElementById("width").value, 10);
    let height = parseInt(document.getElementById("height").value, 10);

    // document.getElementById("circle").disabled = width !== height || width%2 === 0 || height%2 === 0;

    if (cells.length === 0) {
        for (let i = 0; i < height; i++) {
            cells[i] = Array(width).fill(0);
        }
    }

    if (height < cells.length) cells = cells.slice(0, height);
    if (height > cells.length) cells.push(Array(width).fill(0));
    if (width < cells[0].length) cells.map((v) => v.slice(0, width));
    if (width > cells[0].length) cells.map((v) => {v.push(0); return v;});

    dim = {height, width};
    draw();
}

function mouseClicked() {
    if (mouseY < 0 || mouseX < 0) return;

    let cellHeight = 800 / dim.height;
    let cellWidth = 800 / dim.width;
    let i = floor(mouseY / cellHeight);
    let j = floor(mouseX / cellWidth);

    cells[i][j] = cells[i][j] === 0 ? 1 : 0;

    if (document.getElementById("mirror").checked) {
        let jp = (dim.width - 1) - j;
        cells[i][jp] = cells[i][j];
    }

    draw();
}
function makeCSV() {
    let string = ""
    for (let line of cells) {
        for (let cell of line) {
            string += cell.toString() + ','
        }
        string = string.substring(0, string.length - 1) + "\n"
    }
    return string.substring(0, string.length - 1);
}

function setup() {
    createCanvas(800, 800);
    noLoop();
}
function draw() {
    let cellHeight = 800 / dim.height;
    let cellWidth = 800 / dim.width;

    background(0);
    strokeWeight(5);
    stroke(150);
    for (let i = 0; i < dim.height; i++) {
        for (let j = 0; j < dim.width; j++) {
            if (cells[i][j] === 1) fill(205);
            else fill(50);
            quad(j * cellWidth, i * cellHeight, (j + 1) * cellWidth, i*cellHeight, (j + 1) * cellWidth, (i + 1) * cellHeight, j * cellWidth, (i + 1) * cellHeight);
        }
    }
}