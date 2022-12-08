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


var reverseArray = function(array) {
  return array.slice().reverse();
};

var getPieceValue = function (piece, x, y) {
  if (piece === null) {
      return 0;
  }
  var getAbsoluteValue = function (piece, isWhite, x ,y) {
      if (piece.type === 'p') {
          return ( isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x] );
      } else if (piece.type === 'r') {
          return ( isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x] );
      } else if (piece.type === 'n') {
          return knightEval[y][x];
      } else if (piece.type === 'b') {
          return ( isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x] );
      } else if (piece.type === 'q') {
          return evalQueen[y][x];
      } else if (piece.type === 'k') {
          return ( isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x] );
      }
      throw "Unknown piece type: " + piece.type;
  };

  var absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x ,y);
  return piece.color === 'w' ? absoluteValue : -absoluteValue;
};

var pawnEvalWhite =
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

var pawnEvalBlack = reverseArray(pawnEvalWhite);

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

var bishopEvalWhite = [
  [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
  [ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
  [ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
  [ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
  [ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
  [ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
  [ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
  [ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
];

var bishopEvalBlack = reverseArray(bishopEvalWhite);

var rookEvalWhite = [
  [  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
  [  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
  [  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
];

var rookEvalBlack = reverseArray(rookEvalWhite);

var evalQueen =
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

var kingEvalWhite = [

  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
  [ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
  [ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
  [  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0 ],
  [  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0 ]
];

var kingEvalBlack = reverseArray(kingEvalWhite)

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
        const piece = localGame.get(String.fromCharCode(97 + i) + j);
        utility += getPieceValue(piece, i ,j);;
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

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = localGame.get(String.fromCharCode(97 + i) + j);
        utility += getPieceValue(piece, i ,j);;
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
  // console.log(algorithms[algorithmInput.value])


  // make move
  counter = 0
  DEPTH = depthInput.value
  var startTime = new Date().getTime();
  const { move: move, utility: utility } = maxValue(game, 'b', DEPTH, -Infinity, Infinity);
  var endTime = new Date().getTime();
  console.log("Best utility:");
  console.log(utility);
  console.log("Counter:");
  console.log(counter)
  $('#counter').text("Visited Nodes: " + counter)
  $('#utility').text("Best Move Evaluation: " + utility)
  $('#time').text("Elapsed Time: " + (endTime - startTime)/1000 + 's')
  game.move(move);

  // highlight black's move
  removeHighlights('black')
  $board.find('.square-' + move.from).addClass('highlight-black')
  squareToHighlight = move.to

  // update the board to the new position
  board.position(game.fen())

  checkGameEnd()
}

function onDrop (source, target) {
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
}

function onMoveEnd () {
  $board.find('.square-' + squareToHighlight)
    .addClass('highlight-black')
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
  depthInput = document.querySelector('#depth-input')
  algorithmInput = document.querySelector('#algorithm-input')
  metricInput = document.querySelector('#metric-input')
});

// Stop scrolling on mobile
function preventBehavior(e) {
  e.preventDefault(); 
};

document.addEventListener("touchmove", preventBehavior, {passive: false});
document.addEventListener("touchstart", preventBehavior, {passive: false});