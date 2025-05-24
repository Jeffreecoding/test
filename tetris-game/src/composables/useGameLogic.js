import { ref, reactive, computed } from 'vue';

// Tetromino shapes
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 1
  },
  J: {
    shape: [
      [2, 0, 0],
      [2, 2, 2],
      [0, 0, 0]
    ],
    color: 2
  },
  L: {
    shape: [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0]
    ],
    color: 3
  },
  O: {
    shape: [
      [4, 4],
      [4, 4]
    ],
    color: 4
  },
  S: {
    shape: [
      [0, 5, 5],
      [5, 5, 0],
      [0, 0, 0]
    ],
    color: 5
  },
  T: {
    shape: [
      [0, 6, 0],
      [6, 6, 6],
      [0, 0, 0]
    ],
    color: 6
  },
  Z: {
    shape: [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0]
    ],
    color: 7
  }
};

export function useGameLogic() {
  // Board dimensions
  const ROWS = 20;
  const COLS = 10;
  
  // Game state
  const board = ref(createEmptyBoard());
  const score = ref(0);
  const level = ref(1);
  const lines = ref(0);
  const gameActive = ref(false);
  const paused = ref(false);
  const gameInterval = ref(null);
  
  // Current tetromino state
  const currentPiece = reactive({
    shape: [],
    position: { x: 0, y: 0 },
    color: 0
  });
  
  const nextPiece = reactive({
    shape: [],
    color: 0
  });
  
  // Create empty board
  function createEmptyBoard() {
    return Array(ROWS).fill().map(() => Array(COLS).fill(0));
  }
  
  // Generate random tetromino
  function getRandomTetromino() {
    const keys = Object.keys(TETROMINOES);
    const tetromino = TETROMINOES[keys[Math.floor(Math.random() * keys.length)]];
    return {
      shape: tetromino.shape,
      color: tetromino.color
    };
  }
  
  // Initialize new piece
  function spawnNewPiece() {
    // Use next piece if available, otherwise generate new one
    if (nextPiece.shape.length) {
      currentPiece.shape = nextPiece.shape;
      currentPiece.color = nextPiece.color;
    } else {
      const newTetromino = getRandomTetromino();
      currentPiece.shape = newTetromino.shape;
      currentPiece.color = newTetromino.color;
    }
    
    // Generate next piece
    const newNextPiece = getRandomTetromino();
    nextPiece.shape = newNextPiece.shape;
    nextPiece.color = newNextPiece.color;
    
    // Set starting position (centered at top)
    currentPiece.position = {
      x: Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2),
      y: 0
    };
    
    // Check if game over (can't place new piece)
    if (!isValidMove(0, 0)) {
      gameOver();
    }
  }
  
  // Check if move is valid
  function isValidMove(offsetX, offsetY, rotatedShape = null) {
    const shape = rotatedShape || currentPiece.shape;
    const newX = currentPiece.position.x + offsetX;
    const newY = currentPiece.position.y + offsetY;
    
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const boardX = newX + x;
          const boardY = newY + y;
          
          // Check boundaries
          if (
            boardX < 0 || 
            boardX >= COLS || 
            boardY >= ROWS ||
            (boardY >= 0 && board.value[boardY][boardX] !== 0)
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }
  
  // Movement functions
  function moveLeft() {
    if (isValidMove(-1, 0)) {
      currentPiece.position.x -= 1;
    }
  }
  
  function moveRight() {
    if (isValidMove(1, 0)) {
      currentPiece.position.x += 1;
    }
  }
  
  function moveDown() {
    if (isValidMove(0, 1)) {
      currentPiece.position.y += 1;
      return true;
    } else {
      lockPiece();
      return false;
    }
  }
  
  function rotate() {
    const rotated = rotateMatrix(currentPiece.shape);
    if (isValidMove(0, 0, rotated)) {
      currentPiece.shape = rotated;
    }
  }
  
  function hardDrop() {
    while(moveDown()) {
      // Keep moving down until it can't
    }
  }
  
  // Helper to rotate matrix (tetromino)
  function rotateMatrix(matrix) {
    const N = matrix.length;
    const result = Array(N).fill().map(() => Array(N).fill(0));
    
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        result[x][N - 1 - y] = matrix[y][x];
      }
    }
    
    return result;
  }
  
  // Lock piece in place and check for line clears
  function lockPiece() {
    // Merge current piece with board
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const boardY = currentPiece.position.y + y;
          const boardX = currentPiece.position.x + x;
          
          if (boardY >= 0) {
            board.value[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
    
    // Check for line clears
    clearLines();
    
    // Spawn new piece
    spawnNewPiece();
  }
  
  // Clear completed lines
  function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board.value[y].every(cell => cell !== 0)) {
        // Remove the line
        board.value.splice(y, 1);
        // Add empty line at top
        board.value.unshift(Array(COLS).fill(0));
        linesCleared++;
        y++; // Check the same row again
      }
    }
    
    if (linesCleared > 0) {
      // Update score and level
      lines.value += linesCleared;
      score.value += calculateScore(linesCleared, level.value);
      level.value = Math.floor(lines.value / 10) + 1;
      
      // Adjust game speed based on level
      if (gameInterval.value) {
        clearInterval(gameInterval.value);
        startGameLoop();
      }
    }
  }
  
  // Calculate score based on lines cleared and level
  function calculateScore(linesCleared, currentLevel) {
    const pointsPerLine = [0, 40, 100, 300, 1200]; // 0, 1, 2, 3, 4 lines
    return pointsPerLine[linesCleared] * currentLevel;
  }
  
  // Game loop
  function startGameLoop() {
    const speed = Math.max(100, 1000 - ((level.value - 1) * 100));
    gameInterval.value = setInterval(() => {
      if (!paused.value) {
        moveDown();
      }
    }, speed);
  }
  
  // Game control functions
  function startGame() {
    // Reset game state
    board.value = createEmptyBoard();
    score.value = 0;
    level.value = 1;
    lines.value = 0;
    gameActive.value = true;
    paused.value = false;
    
    // Clear any existing interval
    if (gameInterval.value) {
      clearInterval(gameInterval.value);
    }
    
    // Initialize pieces and start game loop
    spawnNewPiece();
    startGameLoop();
  }
  
  function pauseGame() {
    paused.value = true;
  }
  
  function resumeGame() {
    paused.value = false;
  }
  
  function gameOver() {
    gameActive.value = false;
    if (gameInterval.value) {
      clearInterval(gameInterval.value);
      gameInterval.value = null;
    }
  }
  
  // Draw current piece on the board (for rendering)
  const displayBoard = computed(() => {
    // Create a copy of the current board
    const boardCopy = board.value.map(row => [...row]);
    
    // Add current piece to the display board
    if (gameActive.value) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] !== 0) {
            const boardY = currentPiece.position.y + y;
            const boardX = currentPiece.position.x + x;
            
            if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
              boardCopy[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return boardCopy;
  });
  
  return {
    board: displayBoard,
    score,
    level,
    lines,
    gameActive,
    paused,
    startGame,
    pauseGame,
    resumeGame,
    moveLeft,
    moveRight,
    moveDown,
    rotate,
    hardDrop
  };
}
