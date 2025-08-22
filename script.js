const moedasEl = document.getElementById('moedas');
const buy1Btn = document.getElementById('buy1Btn');
const buy2Btn = document.getElementById('buy2Btn');
const buy3Btn = document.getElementById('buy3Btn');
const buy4Btn = document.getElementById('buy4Btn');
const buy5Btn = document.getElementById('buy5Btn');
const buy6Btn = document.getElementById('buy6Btn');
const buy7Btn = document.getElementById('buy7Btn');
const buy8Btn = document.getElementById('buy8Btn');
const buy9Btn = document.getElementById('buy9Btn');
const buy10Btn = document.getElementById('buy10Btn');
const battleBtn = document.getElementById('battleBtn');
const restartBtn = document.getElementById('restartBtn');
const gridEl = document.getElementById('grid');
const logMessages = document.getElementById('logMessages');

let moedas = 5000000;
let selectedGemini = null;
let grid = Array(40).fill(null);
let geminiLevels = ['🐜', '🐛', '🦂', '🕷️', '🐍', '🦎', '🐸', '🐟', '🐱', '🐶', '🦁', '🐅', '🐻', '🐘', '🦒', '🦓', '🦛', '🦏', '🐴', '🐉'];

// Custos progressivos (duplicando a cada nível)
const buyCosts = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400, 204800, 409600, 819200, 1638400, 3276800, 6553600, 13107200, 26214400, 52428800];

// Cores para cada nível
const colors = [
  '#8B4513', '#A0522D', '#D2691E', '#FF8C00', '#FFA500',
  '#FFD700', '#FFFF00', '#ADFF2F', '#32CD32', '#00FF00',
  '#00CED1', '#1E90FF', '#0000FF', '#8A2BE2', '#FF00FF',
  '#FF1493', '#DC143C', '#B22222', '#8B0000', '#FF0000'
];

function updateMoedas() {
  moedasEl.textContent = `Moedas: ${moedas}`;
  
  const emptySlots = grid.filter(slot => slot === null).length;
  
  // Atualizar estado de cada botão baseado em moedas e espaços disponíveis
  buy1Btn.disabled = moedas < buyCosts[0] || emptySlots < 1; // 🐜 (100)
  buy2Btn.disabled = moedas < buyCosts[1] || emptySlots < 1; // 🐛 (200)
  buy3Btn.disabled = moedas < buyCosts[2] || emptySlots < 1; // 🦂 (400)
  buy4Btn.disabled = moedas < buyCosts[3] || emptySlots < 1; // 🕷️ (800)
  buy5Btn.disabled = moedas < buyCosts[4] || emptySlots < 1; // 🐍 (1600)
  buy6Btn.disabled = moedas < buyCosts[5] || emptySlots < 1; // 🦎 (3200)
  buy7Btn.disabled = moedas < buyCosts[6] || emptySlots < 1; // 🐸 (6400)
  buy8Btn.disabled = moedas < buyCosts[7] || emptySlots < 1; // 🐟 (12800)
  buy9Btn.disabled = moedas < buyCosts[8] || emptySlots < 1; // 🐱 (25600)
  buy10Btn.disabled = moedas < buyCosts[9] || emptySlots < 1; // 🐶 (51200)
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

function buyGemini(cost, level, quantity, geminiName) {
  const emptySlots = [];
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === null) emptySlots.push(i);
  }
  
  if (emptySlots.length < quantity) {
    logMessage(`Não há espaços suficientes para ${geminiName}!`);
    return;
  }
  
  if (moedas < cost) {
    logMessage(`Moedas insuficientes para ${geminiName}!`);
    return;
  }
  
  // Realizar a compra
  moedas -= cost;
  
  for (let i = 0; i < quantity; i++) {
    const randomIndex = emptySlots[Math.floor(Math.random() * emptySlots.length)];
    grid[randomIndex] = level;
    
    const gemini = createGemini(level, randomIndex);
    gridEl.children[randomIndex].appendChild(gemini);
    
    // Remover o slot usado da lista de slots vazios
    emptySlots.splice(emptySlots.indexOf(randomIndex), 1);
  }
  
  updateMoedas();
  
  // Atualizar log com novo poder
  const newPower = calculateBattlePower();
  logMessage(`${geminiName} comprado! Novo poder: ${newPower}`);
}

// Funções específicas para cada botão (cada uma compra um nível específico)
function buy1Formiga() { buyGemini(buyCosts[0], 0, 1, geminiLevels[0]); } // 🐜 (100)
function buy2Lagarta() { buyGemini(buyCosts[1], 1, 1, geminiLevels[1]); } // 🐛 (200)
function buy3Escorpiao() { buyGemini(buyCosts[2], 2, 1, geminiLevels[2]); } // 🦂 (400)
function buy4Aranha() { buyGemini(buyCosts[3], 3, 1, geminiLevels[3]); } // 🕷️ (800)
function buy5Cobra() { buyGemini(buyCosts[4], 4, 1, geminiLevels[4]); } // 🐍 (1600)
function buy6Lagarto() { buyGemini(buyCosts[5], 5, 1, geminiLevels[5]); } // 🦎 (3200)
function buy7Sapo() { buyGemini(buyCosts[6], 6, 1, geminiLevels[6]); } // 🐸 (6400)
function buy8Fish() { buyGemini(buyCosts[7], 7, 1, geminiLevels[7]); } // 🐟 (12800)
function buy9Cat() { buyGemini(buyCosts[8], 8, 1, geminiLevels[8]); } // 🐱 (25600)
function buy10Dog() { buyGemini(buyCosts[9], 9, 1, geminiLevels[9]); } // 🐶 (51200)

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
      // Poder = 2^nível (1, 2, 4, 8, 16, ...)
      power += Math.pow(2, grid[i]);
    }
  }
  return power;
}

function startBattle() {
  const power = calculateBattlePower();
  
  // Contar o número total de animais no grid
  const totalAnimals = grid.filter(slot => slot !== null).length;
  
  logMessage(`Poder total da batalha: ${power}`);
  logMessage(`Animais na batalha: ${totalAnimals}`);
  
  // Recompensa: igual ao poder total (soma dos poderes individuais)
  const reward = power;
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
buy1Btn.addEventListener('click', buy1Formiga);
buy2Btn.addEventListener('click', buy2Lagarta);
buy3Btn.addEventListener('click', buy3Escorpiao);
buy4Btn.addEventListener('click', buy4Aranha);
buy5Btn.addEventListener('click', buy5Cobra);
buy6Btn.addEventListener('click', buy6Lagarto);
buy7Btn.addEventListener('click', buy7Sapo);
buy8Btn.addEventListener('click', buy8Fish);
buy9Btn.addEventListener('click', buy9Cat); 
buy10Btn.addEventListener('click', buy10Dog);
battleBtn.addEventListener('click', startBattle);
restartBtn.addEventListener('click', restartGame);

// Inicializar
initGrid();
updateMoedas();
