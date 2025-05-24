<template>
  <div class="tetris-container">
    <div class="game-info">
      <div class="score">Score: {{ score }}</div>
      <div class="level">Level: {{ level }}</div>
      <div class="lines">Lines: {{ lines }}</div>
      <div class="next-piece">
        <h3>Next:</h3>
        <div class="next-piece-preview">
          <!-- Next piece preview -->
        </div>
      </div>
      <button @click="startGame" v-if="!gameActive">Start Game</button>
      <button @click="pauseGame" v-if="gameActive && !paused">Pause</button>
      <button @click="resumeGame" v-if="paused">Resume</button>
    </div>
    <div class="game-board" ref="boardRef" tabindex="0">
      <div v-for="(row, y) in board" :key="`row-${y}`" class="row">
        <div 
          v-for="(cell, x) in row" 
          :key="`cell-${x}-${y}`" 
          class="cell"
          :class="{ 
            filled: cell !== 0, 
            [`color-${cell}`]: cell !== 0,
            'clearing': isClearing && clearingLines.includes(y)
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGameLogic } from '../composables/useGameLogic';

// Game state
const {
  board,
  score,
  level,
  lines,
  gameActive,
  paused,
  clearingLines,
  isClearing,
  startGame,
  pauseGame,
  resumeGame,
  moveLeft,
  moveRight,
  moveDown,
  rotate,
  hardDrop
} = useGameLogic();

const boardRef = ref(null);

// Handle keyboard controls
const handleKeydown = (e) => {
  if (!gameActive.value || paused.value || isClearing.value) return;
  
  switch (e.key) {
    case 'ArrowLeft':
      moveLeft();
      break;
    case 'ArrowRight':
      moveRight();
      break;
    case 'ArrowDown':
      moveDown();
      break;
    case 'ArrowUp':
      rotate();
      break;
    case ' ':
      hardDrop();
      break;
    case 'p':
      paused.value ? resumeGame() : pauseGame();
      break;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  if (boardRef.value) {
    boardRef.value.focus();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.tetris-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 0 auto;
  max-width: 600px;
}

.game-board {
  display: flex;
  flex-direction: column;
  border: 2px solid #333;
  background-color: #111;
  width: 300px;
  outline: none;
}

.row {
  display: flex;
}

.cell {
  width: 30px;
  height: 30px;
  border: 1px solid #333;
  position: relative;
}

.filled {
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Tetromino colors */
.color-1 { background-color: cyan; }    /* I */
.color-2 { background-color: blue; }    /* J */
.color-3 { background-color: orange; }  /* L */
.color-4 { background-color: yellow; }  /* O */
.color-5 { background-color: green; }   /* S */
.color-6 { background-color: purple; }  /* T */
.color-7 { background-color: red; }     /* Z */

/* Simple clearing animation */
.clearing {
  animation: flash 0.5s infinite alternate;
}

@keyframes flash {
  0% { opacity: 1; }
  100% { opacity: 0.3; }
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
  background-color: #222;
  border: 2px solid #333;
  color: white;
}

button {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: #45a049;
}
</style>

