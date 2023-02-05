
// Veriable intialization
let rect_board = [];
let board = [];
let x_turn = true;
let winner = {true: null};
let intervalId;
let isFirstAI = -1;

// Check for WebGL support
let type = "WebGL";
if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
}

PIXI.utils.sayHello(type);

// Textures

let texture_rect = PIXI.Texture.from("images/baseRect.png");
let texture_x = PIXI.Texture.from("images/x.png");
let texture_o = PIXI.Texture.from("images/o.png");

let texture_smile = PIXI.Texture.from("images/smile.png");
let texture_omg = PIXI.Texture.from("images/omg.png");

// Creating an application and renderer
const app = new PIXI.Application();

app.renderer.autoDensity = true
app.renderer.resize(window.innerWidth, window.innerHeight);

document.body.appendChild(app.view);

// Setting up on-window-resize
window.addEventListener('resize', resize);

function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
}

// Creating a board of rectangles
for(let y = 0; y < 3; y++) {
    board.push([]);
    rect_board.push([]);
    for(let x = 0; x < 3; x++) {
            let rect = new PIXI.Sprite(texture_rect);
            rect.interactive = true;
            rect.buttonMode = true;

            rect.x = 200 * (x + 1);
            rect.y = 200 * (y + 1);
            rect.arr_x = x;
            rect.arr_y = y;

            rect
                .on("mouseover", onMouseOver)
                .on("mouseout", onMouseOut)
                .on("click", onClick)

            app.stage.addChild(rect);

            board[y].push([]);
            rect_board[y].push([]);

            board[y][x] = "*";
            rect_board[y][x] = rect;
    }  
}

// Function for checking if game is over
function checkWinner(arr) {
    // Horizontal
    for(let i = 0; i < 3; i++) {
        if(arr[i][0] != "*" && arr[i][0] == arr[i][1] && arr[i][1] == arr[i][2]) {
            return {type: arr[i][0], moves: [[i, 0], [i, 1], [i, 2]]};
        }
    }

    // Vertical
    for(let i = 0; i < 3; i++) {
        if(arr[0][i] != "*" && arr[0][i] == arr[1][i] && arr[1][i] == arr[2][i]) {
            return {type: arr[0][i], moves: [[0, i], [1, i], [2, i]]};
        }
    }

    // Diagonal
    if(arr[0][0] != "*" && arr[0][0] == arr[1][1] && arr[1][1] == arr[2][2]) {
        return {type: arr[0][0], moves: [[0, 0], [1, 1], [2, 2]]};
    } else if(arr[0][2] != "*" && arr[0][2] == arr[1][1] && arr[1][1] == arr[2][0]) {
        return {type: arr[0][2], moves: [[0, 2], [1, 1], [2, 0]]};
    }

    // No Winner
    for(let curr_row of arr) {
        for(let curr_box of curr_row) {
            if(curr_box == "*") {
                return {type: null};
            }
        }
    }

    // Tie
    return {type: "-"};
}

// Mouse events
function onMouseOver() {
    //console.log("onMouseOver:", this); 

    if(this.texture == texture_rect && winner["type"] == null) {
        if(x_turn) {
            this.overlay = new PIXI.Sprite(texture_x);

        } else {
            this.overlay = new PIXI.Sprite(texture_o);
        }
        this.overlay.x = this.x, this.overlay.y = this.y;
        this.overlay.alpha = 0.5;
        app.stage.addChild(this.overlay);
    }
}

function onMouseOut() {
    app.stage.removeChild(this.overlay);
}

function playersTurn(self) {
    if(x_turn) {
        board[self.arr_y][self.arr_x] = "X";
        self.texture = texture_x;
    } else {
        board[self.arr_y][self.arr_x] = "O";
        self.texture = texture_o;
    }
}

function AIsTurn(player) {
    let ai_move = minimax(board, true, player)["move"];
    if(ai_move != undefined) {
        board[ai_move[0]][ai_move[1]] = player;
        rect_board[ai_move[0]][ai_move[1]].texture = player == "O" ? texture_o : texture_x;
    }
}

function onClick() {
    //console.log("onClick:", this);
    app.stage.removeChild(this.overlay);

    if(this.texture == texture_rect && winner["type"] == null) {
        playersTurn(this);
        if(isFirstAI != -1) {
            AIsTurn(x_turn ? "O" : "X");
        }
        
        winner = checkWinner(board);
        if(winner["type"] != null) {
            smile.texture = texture_omg;
            if(winner["type"] == "X") {
                console.log("X won!");
                text.text = "X won!";
            } else if(winner["type"] == "O") {
                console.log("O won!");
                text.text = "O won!";
            } else if(winner["type"] == "-") {
                console.log("Tie");
                text.text = "Tie!";
                return;
            }

            let increment = 1 / 100;
            let curr_alpha = 1;
            intervalId = window.setInterval(function() {
                curr_alpha += increment;
                if (curr_alpha > 1 || curr_alpha < 0.5) increment = -increment;
                rect_board[winner["moves"][0][0]][winner["moves"][0][1]].alpha = curr_alpha;
                rect_board[winner["moves"][1][0]][winner["moves"][1][1]].alpha = curr_alpha;
                rect_board[winner["moves"][2][0]][winner["moves"][2][1]].alpha = curr_alpha;
            }, 10);
        } else if(isFirstAI == -1) {
            x_turn = !x_turn;
        }
    }
}

// Loading sprites

PIXI.Loader.shared
    .add("images/smile.png")
    .load(setup);

function setup() {
    smile = new PIXI.Sprite(PIXI.loader.resources["images/smile.png"].texture);
    smile.width = 400, smile.height = 400;
    smile.x = rect_board[0][0].width * 3 + 450, smile.y = rect_board[0][0].height * 3 - 550;
    app.stage.addChild(smile);
}

// Adding text
let text = new PIXI.Text("Game in progress...", {
    fontFamily: "Robotic",
    fontSize: 24,
    fill: 0xff1010,
    align: "center"
});

text.anchor.set(0.5);
text.x = (rect_board[0][0].width * 3 + 450) + (400 / 2), text.y = (rect_board[0][0].height * 3 - 580) + 450;

app.stage.addChild(text);

// Reset button
const reset_button = new PIXI.Graphics()
    .beginFill(0xFFFFFF)
    .lineStyle(5, 0x641E16)
    .drawRect((rect_board[0][0].width * 3 + 450) + (400 / 2) - (200 / 2), (rect_board[0][0].height * 3 - 500) + 450 - 25, 200, 100);

reset_button.interactive = true;
reset_button.buttonMode = true;

reset_button
    .on("click", reset)

let reset_button_text = new PIXI.Text("RESET", {
    fontFamily: "Robotic",
    fontSize: 40,
    fill: 0x641E16,
    align: "center"
});

reset_button_text.anchor.set(0.5);
reset_button_text.x = (rect_board[0][0].width * 3 + 450) + (400 / 2) - (200 / 2) + (200 / 2), reset_button_text.y = (rect_board[0][0].height * 3 - 500) + 450 - 25 + (100 / 2);

app.stage.addChild(reset_button);
app.stage.addChild(reset_button_text);

// Reset function
function reset() {
    console.log("Reset");
    clearInterval(intervalId);
    smile.texture = texture_smile;
    x_turn = true;
    isFirstAI = -1;
    text.text = "Game in progress...";
    
    if(winner["type"] != null && winner["type"] != "-") {
        rect_board[winner["moves"][0][0]][winner["moves"][0][1]].alpha = 1;
        rect_board[winner["moves"][1][0]][winner["moves"][1][1]].alpha = 1;
        rect_board[winner["moves"][2][0]][winner["moves"][2][1]].alpha = 1;
    }
    winner = {type: null};

    board = [];
    for(let x = 1; x <= 3; x++) {
        board.push([]);
        for(let y = 1; y <= 3; y++) {
            board[x - 1].push([]);
            board[x - 1][y - 1] = "*";
        }
    }

    for(curr_row of rect_board) {
        for(curr_box of curr_row) {
            curr_box.texture = texture_rect;
        }
    }
}

// Vs AI Button
const ai_button = new PIXI.Graphics()
    .beginFill(0xFFFFFF)
    .lineStyle(5, 0x641E16)
    .drawRect((rect_board[0][0].width * 3 + 450) + (400 / 2) - (200 / 2), (rect_board[0][0].height * 3 - 500) + 450 + 120, 200, 100);

ai_button.interactive = true;
ai_button.buttonMode = true;

ai_button
    .on("click", vsAI)

let ai_button_text = new PIXI.Text("VS AI", {
    fontFamily: "Robotic",
    fontSize: 40,
    fill: 0x641E16,
    align: "center"
});

ai_button_text.anchor.set(0.5);
ai_button_text.x = (rect_board[0][0].width * 3 + 450) + (400 / 2) - (200 / 2) + (200 / 2), ai_button_text.y = (rect_board[0][0].height * 3 - 500) + 450 + 120 + (100 / 2);

app.stage.addChild(ai_button);
app.stage.addChild(ai_button_text);

// Vs AI Function
function vsAI() {
    if(isFirstAI == -1) {
        isFirstAI = Math.floor(Math.random() * 2);
        if(isFirstAI == 1) {
            AIsTurn("X");
            x_turn = false;
        }
    }
}

function minimax(org_node, isMaximizingPlayer, currPlayer, count = 0) {
    let node = cloneArray(org_node);
    let possible_moves = getMoves(node);
    let value = {};

    if(isMaximizingPlayer) {
        value["score"] = -Infinity;
    } else {    // minimizing player
        value["score"] = Infinity;
    }

    for(let curr_move of possible_moves) {
        let new_node = applyMove(node, curr_move, currPlayer);
        let winner = checkWinner(new_node)["type"];

        if(winner != null) {
            if(winner == currPlayer) {
                value = {score: isMaximizingPlayer ? 100 : -100};
            } else if(winner == "-") {
                value = {score: 0};
            } else {
                value = {score: isMaximizingPlayer ? -100 : 100};
            }
            value["move"] = curr_move;
        } else {
            new_score = minimax(new_node, isMaximizingPlayer ? false : true, currPlayer == "X" ? "O" : "X", count + 1);
            if((isMaximizingPlayer && new_score["score"] > value["score"]) || (!isMaximizingPlayer && new_score["score"] < value["score"])) {
                    value["score"] = new_score["score"];
                    value["move"] = curr_move;
            }
        }
    }
    return {score: value["score"], move: value["move"]};
}

function cloneArray(org){
    var newArray = [];

    for (var i = 0; i < org.length; i++)
        newArray[i] = org[i].slice();
    
    return newArray;
}

function checkScore(board, currPlayer) {
    let winner = checkWinner(board);
    if(winner["type"] == currPlayer) {
        return 100;
    } else if(winner["type"] == "-") {
        return 0;
    } else if(winner["type"] == null) {
        return null;
    } else {
        return -100;
    }
}

function getMoves(board) {
    let possible_moves = [];
    for(let i = 0; i < board.length; i++) {
        for(let j = 0; j < board[i].length; j++) {
            if(board[i][j] == "*") {
                possible_moves.push([i, j]);
            } 
        }
    }
    return possible_moves;
}

function applyMove(board, move, type) {
    board_clone = cloneArray(board);
    board_clone[move[0]][move[1]] = type;
    return board_clone;
}