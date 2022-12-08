var DEPTH = 2

var board = null
var game = new Chess()
var squareToHighlight = null
var squareClass = 'square-55d63'
var counter = 0
const pieceValues = {
  'k': 0,
  'p': 1,
  'n': 3,
  'b': 3,
  'r': 5,
  'q': 9
}

const algorithms = {
  1 : 'minimax',
  2 : 'alpha-beta pruning'
}

const metrics = {
  1 : 'material',
  2 : 'positional',
  3 : 'material + positional'
}

function removeHighlights (color) {
  $board.find('.' + squareClass)
    .removeClass('highlight-' + color)
}


function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for White
  if (piece.search(/^b/) !== -1) return false
}


//---------------POSITIONAL EVAL

function getPieceValue (piece, x, y) {
  if (piece === null) {
      return 0;
  }
  isWhite = (piece.color == 'w')
  if (piece.type === 'p') {
    return ( isWhite ? pawnEval[7-y][x] : pawnEval[y][x] );
  } else if (piece.type === 'r') {
      return ( isWhite ? rookEval[7-y][x] : rookEval[y][x] );
  } else if (piece.type === 'n') {
      return knightEval[y][x];
  } else if (piece.type === 'b') {
      return ( isWhite ? bishopEval[7-y][x] : bishopEval[y][x] );
  } else if (piece.type === 'q') {
      return queenEval[y][x];
  } else if (piece.type === 'k') {
      return ( isWhite ? kingEval[7-y][x] : kingEval[y][x] );
  }
  throw "Unknown piece type: " + piece.type;
};

var pawnEval =
  [
      [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
      [5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
      [1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
      [0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
      [0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
      [0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
      [0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
      [0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
  ];

var knightEval =
  [
      [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
      [-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
      [-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
      [-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
      [-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
      [-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
      [-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
      [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
  ];

var bishopEval = [
  [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
  [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
  [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
  [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
  [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
  [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

var rookEval = [
  [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
  [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

var queenEval =
  [
  [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
  [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
  [ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
];

var kingEval = [

  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
  [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
  [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
  [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];

//------------------END POSITIONAL EVAL


//------------------MINIMAX


function evaluateBoard(localGame, player) {
  // Calculate the material value of the localGame for the given player
  let utility = Math.random();
  // material evaluation
  if (metrics[metricInput.value] === 'material') {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = localGame.get(String.fromCharCode(97 + i) + (j + 1));
        if (piece) {
          if (piece.color === player) {
            utility += pieceValues[piece.type];
          } else {
            utility -= pieceValues[piece.type];
          }
        }
      }
    }
    if (localGame.in_checkmate()) {
      if (localGame.turn() === player) {
        utility -= 100;
      } else {
        utility += 100;
      }
    }
  }

  // positional evaluation
  if (metrics[metricInput.value] === 'positional') {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = localGame.get(String.fromCharCode(97 + i) + (j + 1));
        if (piece) {
          if (piece.color === player) {
            utility += getPieceValue(piece, i ,j);
          } else{
            utility -= getPieceValue(piece, i ,j);
          }
        }
      }
    }
  }

  // material + positional evaluation
  if (metrics[metricInput.value] === 'material + positional') {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = localGame.get(String.fromCharCode(97 + i) + (j + 1));
        if (piece) {
          if (piece.color === player) {
            utility += pieceValues[piece.type];
            utility += getPieceValue(piece, i ,j);
          } else {
            utility -= pieceValues[piece.type];
            utility -= getPieceValue(piece, i ,j);
          }
        }
      }
    }
    if (localGame.in_checkmate()) {
      if (localGame.turn() === player) {
        utility -= 100;
      } else {
        utility += 100;
      }
    }
  }

  return utility
}

function maxValue(localGame, player, depth, alpha, beta) {
  counter += 1
  // Check if leaf node
  if (depth === 0 || localGame.game_over()) {
    return { move: null, utility: evaluateBoard(localGame, player) };
  }

  let bestMove = null;
  let bestUtility = -Infinity;

  for (const move of localGame.moves({ verbose: true })) {
    localGame.move(move);
    const { utility: utility } = minValue(
      localGame,
      player,
      depth - 1,
      alpha,
      beta
    );
    localGame.undo()

    if (utility > bestUtility) {
      bestMove = move;
      bestUtility = utility;
    }

    // Update alpha and beta for alpha-beta pruning
    if (algorithms[algorithmInput.value] === 'alpha-beta pruning') {
      alpha = Math.max(alpha, utility);
      if (beta <= alpha) {
        break;
      }
    }
  }

  return { move: bestMove, utility: bestUtility };
}


function minValue(localGame, player, depth, alpha, beta) {
  counter += 1
  // Check if leaf node
  if (depth === 0 || localGame.game_over()) {
    return { move: null, utility: evaluateBoard(localGame, player) };
  }

  let bestMove = null;
  let bestUtility = Infinity;

  for (const move of localGame.moves({ verbose: true })) {
    localGame.move(move);
    const { utility: utility } = maxValue(
      localGame,
      player,
      depth - 1,
      alpha,
      beta
    );
    localGame.undo()

    if (utility < bestUtility) {
      bestMove = move;
      bestUtility = utility;
    }

    // Update alpha and beta for alpha-beta pruning
    if (algorithms[algorithmInput.value] === 'alpha-beta pruning') {
      beta = Math.min(beta, utility);
      if (beta <= alpha) {
        break;
      }
    }
  }

  return { move: bestMove, utility: bestUtility };
}


//-------------------END MINIMAX


function checkGameEnd () {
  if (game.game_over()) {
    $message.text("End")
    if (game.in_checkmate()) {
      $message.text("Checkmate")
    }
    if (game.in_draw()) {
      $message.text("Draw")
    }
  }
}

function makeMove () {
  checkGameEnd()
  // game over
  if (game.game_over()) return

  // DEBUG
  // console.log(pawnEval)
  // console.log(pawnEvalBlack)
  // console.log(document.querySelector('#dual-engine').checked)
  

  let player = game.turn()
  depthInput = document.querySelector('#depth-input-' + player)
  algorithmInput = document.querySelector('#algorithm-input-' + player)
  metricInput = document.querySelector('#metric-input-' + player)
  console.log(metrics[metricInput.value])

  // make move
  counter = 0
  DEPTH = depthInput.value
  let startTime = new Date().getTime();
  const { move: move, utility: utility } = maxValue(game, player, DEPTH, -Infinity, Infinity);
  let endTime = new Date().getTime();
  console.log("Best utility:");
  console.log(utility);
  console.log("Counter:");
  console.log(counter)
  $('#counter').text("Visited Nodes: " + counter)
  $('#utility').text("Best Move Evaluation: " + utility)
  $('#time').text("Elapsed Time: " + (endTime - startTime)/1000 + 's')
  game.move(move);

  if (player === 'b') {
    // highlight black's move
    removeHighlights('black')
    $board.find('.square-' + move.from).addClass('highlight-black')
    squareToHighlight = move.to
  } else {
    // highlight white's move
    removeHighlights('white')
    $board.find('.square-' + move.from).addClass('highlight-white')
    squareToHighlight = move.to
  }

  // update the board to the new position
  board.position(game.fen())

  checkGameEnd()
  
  if (document.querySelector('#dual-engine').checked) {
    window.setTimeout(makeMove, 250)
  }
}

function onDrop (source, target) {
  // if (!document.querySelector('#dual-engine').checked) {
    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })

    // illegal move
    if (move === null) return 'snapback'

    // highlight white's move
    removeHighlights('white')
    $board.find('.square-' + source).addClass('highlight-white')
    $board.find('.square-' + target).addClass('highlight-white')

    // make move for black
    window.setTimeout(makeMove, 250)
  // }
}

function onMoveEnd () {
  if (game.turn() === 'w') {
    $board.find('.square-' + squareToHighlight)
      .addClass('highlight-black')
  } else {
    $board.find('.square-' + squareToHighlight)
      .addClass('highlight-white')
  }
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMoveEnd: onMoveEnd,
  onSnapEnd: onSnapEnd
}

$(document).ready(function(){
  $board = $('#myBoard')
  $message = $('#message')
  board = Chessboard('myBoard', config)
  console.log(game)
});

function dualToggle(cb) {
  document.getElementById("white-container").style.display = cb.checked ? "flex" : "none"
  document.getElementById("start-button").style.display = cb.checked ? "block" : "none"
  document.getElementById("start-button").disabled = cb.checked ? false : true
  checked = true
};

function startMoves() {
  document.getElementById("start-button").disabled = true
  makeMove()
}

// Stop scrolling on mobile
function preventBehavior(e) {
  e.preventDefault(); 
};

document.addEventListener("touchmove", preventBehavior, {passive: false});