var DEPTH = 3

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


//------------------MINIMAX


function evaluateBoard(localGame, player) {
  // Calculate the material value of the localGame for the given player
  let materialValue = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = localGame.get(String.fromCharCode(97 + i) + j);
      if (piece) {
        if (piece.color === player) {
          materialValue += pieceValues[piece.type];
        } else {
          materialValue -= pieceValues[piece.type];
        }
      }
    }
  }
  if (localGame.in_checkmate()) {
    if (localGame.turn() === player) {
      materialValue -= 100;
    } else {
      materialValue += 100;
    }
  }

  // Add a bonus for having more mobility
  // const legalMoves = localGame.moves({ verbose: true });
  // let mobilityBonus = 0;
  // for (const move of legalMoves) {
  //   if (move.color === player) {
  //     mobilityBonus++;
  //   } else {
  //     mobilityBonus--;
  //   }
  // }

  // Return the total utility
  return (10 * materialValue) //+ mobilityBonus;
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
    alpha = Math.max(alpha, utility);
    if (beta <= alpha) {
      break;
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
    alpha = Math.min(alpha, utility);
    if (beta <= alpha) {
      break;
    }
  }

  return { move: bestMove, utility: bestUtility };
}


//-------------------END MINIMAX


function makeMove () {
  // game over
  if (game.game_over()) return

  // make move
  counter = 0
  DEPTH = depthInput.value
  const { move: move, utility: utility } = maxValue(game, 'b', DEPTH, -Infinity, Infinity);
  console.log("Best utility:");
  console.log(utility);
  console.log("Counter:");
  console.log(counter)
  $('#counter').text("Nodes visited: " + counter)
  $('#utility').text("Best AI utility: " + utility)
  game.move(move);

  // highlight black's move
  removeHighlights('black')
  $board.find('.square-' + move.from).addClass('highlight-black')
  squareToHighlight = move.to

  // update the board to the new position
  board.position(game.fen())
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
  board = Chessboard('myBoard', config)
  console.log(game)
  depthInput = document.querySelector('#depth-input')
});

// Stop scrolling on mobile
document.ontouchstart = function(e){ 
  e.preventDefault(); 
}
document.ontouchmove = function(e){ 
  e.preventDefault(); 
}