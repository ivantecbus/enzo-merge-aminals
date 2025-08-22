const moedasEl = document.getElementById('moedas');
const buyBtn = document.getElementById('buyGeminiBtn');
const battleBtn = document.getElementById('battleBtn');
const restartBtn = document.getElementById('restartBtn');
const gridEl = document.getElementById('grid');
const logMessages = document.getElementById('logMessages');

let moedas = 500;
let selectedGemini = null;
let grid = Array(40).fill(null);
let geminiLevels = ['🐜', '🐛', '🦂', '🕷️', '🐍', '🦎', '🐸', '🐟', '🐱', '🐶', '🦁', '🐅', '🐻', '🐘', '🦒', '🦓', '🦛', '🦏', '🐴', '🐉'];

// Cores para cada nível
const colors = [
  '#8B4513', '#A0522D', '#D2691E', '#FF8C00', '#FFA500',
  '#FFD700', '#FFFF00', '#ADFF2F', '#32CD32', '#00FF00',
  '#00CED1', '#1E90FF', '#0000FF', '#8A2BE2', '#FF00FF',
  '#FF1493', '#DC143C', '#B22222', '#8B0000', '#FF0000'
];

function updateMoedas() {
  moedasEl.textContent = `Moedas: ${moedas}`;
  buyBtn.disabled = moedas < 100;
}

function getGeminiColor(level) {
  return colors[level] || colors[colors.length - 1];
}

function createGemini(level, index) {
  const gemini = document.createElement('div');
  gemini.className = 'gemini';
  gemini.textContent = geminiLevels[level];
  gemini.style.backgroundColor = getGeminiColor(level);
  gemini.dataset.level = level;
  gemini.dataset.index = index;
  
  gemini.addEventListener('click', () => selectGemini(gemini));
  return gemini;
}

function selectGemini(gemini) {
  if (!selectedGemini) {
    selectedGemini = gemini;
    gemini.style.outline = '2px solid yellow';
  } else if (selectedGemini === gemini) {
    selectedGemini.style.outline = '';
    selectedGemini = null;
  } else {
    const index1 = parseInt(selectedGemini.dataset.index);
    const index2 = parseInt(gemini.dataset.index);
    
    if (selectedGemini.dataset.level === gemini.dataset.level) {
      const newLevel = parseInt(selectedGemini.dataset.level) + 1;
      if (newLevel < geminiLevels.length) {
        grid[index1] = null;
        grid[index2] = newLevel;
        
        // Remove old geminis
        selectedGemini.remove();
        gemini.remove();
        
        // Create new merged gemini
        const newGemini = createGemini(newLevel, index2);
        gridEl.children[index2].appendChild(newGemini);
        
        moedas += 10 * (newLevel + 1);
      }
    }
    
    selectedGemini.style.outline = '';
    selectedGemini = null;
    updateMoedas();
  }
}

function buyGemini() {
  if (moedas >= 100) {
    const emptySlots = [];
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] === null) emptySlots.push(i);
    }
    
    if (emptySlots.length > 0) {
      const randomIndex = emptySlots[Math.floor(Math.random() * emptySlots.length)];
      grid[randomIndex] = 0;
      
      const gemini = createGemini(0, randomIndex);
      gridEl.children[randomIndex].appendChild(gemini);
      
      moedas -= 100;
      updateMoedas();
      
      // Atualizar log com novo poder
      const newPower = calculateBattlePower();
      logMessage(`Formiga comprada! Novo poder: ${newPower}`);
    }
  }
}

function logMessage(message) {
  const logMessages = document.getElementById('logMessages');
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  const logEntry = document.createElement('div');
  logEntry.style.marginBottom = '5px';
  logEntry.style.borderBottom = '1px solid #555';
  logEntry.style.paddingBottom = '3px';
  logEntry.innerHTML = `<span style="color: #00ff00;"></span> ${message}`;
  logMessages.appendChild(logEntry);
  
  // Manter apenas as 5 últimas mensagens
  const messages = logMessages.children;
  if (messages.length > 2) {
    logMessages.removeChild(messages[0]);
  }
  
  logMessages.scrollTop = logMessages.scrollHeight;
}

function calculateBattlePower() {
  let power = 0;
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] !== null) {
      // Poder = 10 * (2^nível) - considera o peso exponencial
      power += 10 * Math.pow(2, grid[i]);
    }
  }
  return power;
}

function startBattle() {
  const power = calculateBattlePower();
  
  logMessage(`Poder total da batalha: ${power}`);
  
  // Recompensa baseada no poder (ajustada para nova escala)
  const reward = Math.floor(power / 10);
  moedas += reward;
  updateMoedas();
  
  logMessage(`Você ganhou ${reward} moedas!`);
}

function initGrid() {
  gridEl.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.index = i;
    gridEl.appendChild(slot);
  }
  
  // Adicionar 3 geminis iniciais
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * 40);
    if (grid[randomIndex] === null) {
      grid[randomIndex] = 0;
      const gemini = createGemini(0, randomIndex);
      gridEl.children[randomIndex].appendChild(gemini);
    }
  }
  
  // Mostrar poder inicial da batalha
  const initialPower = calculateBattlePower();
  logMessage(`Poder inicial da batalha: ${initialPower}`);
}

function restartGame() {
  // Reset all values to initial state
  moedas = 500;
  selectedGemini = null;
  grid = Array(40).fill(null);
  
  // Clear any selected gemini styling
  if (selectedGemini) {
    selectedGemini.style.outline = '';
  }
  
  // Clear and reinitialize the grid
  gridEl.innerHTML = '';
  for (let i = 0; i < 40; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.index = i;
    gridEl.appendChild(slot);
  }
  
  // Clear the log
  logMessages.innerHTML = '';
  
  // Add exactly 3 initial "Formiga" geminis
  for (let i = 0; i < 3; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * 40);
    } while (grid[randomIndex] !== null);
    grid[randomIndex] = 0;
    const gemini = createGemini(0, randomIndex);
    gridEl.children[randomIndex].appendChild(gemini);
  }
  
  // Mostrar poder de batalha após reiniciar
  const restartPower = calculateBattlePower();
  logMessage(`Jogo reiniciado! Poder inicial: ${restartPower}`);
  
  updateMoedas();
}

// Event listeners
buyBtn.addEventListener('click', buyGemini);
battleBtn.addEventListener('click', startBattle);
restartBtn.addEventListener('click', restartGame);

// Inicializar
initGrid();
updateMoedas();
