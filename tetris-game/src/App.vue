<template>
  <div class="app">
    <header>
      <h1>Vue Tetris</h1>
    </header>
    <main>
      <TetrisBoard />
    </main>
    <footer>
      <p>Controls: Arrow keys to move, Up to rotate, Space to hard drop, P to pause</p>
    </footer>
  </div>
</template>

<script setup>
import TetrisBoard from './components/TetrisBoard.vue';
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #121212;
  color: white;
}

.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

header {
  margin-bottom: 20px;
}

h1 {
  color: #4CAF50;
  text-align: center;
}

footer {
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: #888;
}
</style>

