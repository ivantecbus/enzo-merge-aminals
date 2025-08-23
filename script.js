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
const buy11Btn = document.getElementById('buy11Btn');
const buy12Btn = document.getElementById('buy12Btn');
const buy13Btn = document.getElementById('buy13Btn');
const buy14Btn = document.getElementById('buy14Btn');
const buy15Btn = document.getElementById('buy15Btn');
const buy16Btn = document.getElementById('buy16Btn');
const buy17Btn = document.getElementById('buy17Btn');
const buy18Btn = document.getElementById('buy18Btn');
const buy19Btn = document.getElementById('buy19Btn');
const buy20Btn = document.getElementById('buy20Btn');
const battleBtn = document.getElementById('battleBtn');
const restartBtn = document.getElementById('restartBtn');
const gridEl = document.getElementById('grid');
const logMessages = document.getElementById('logMessages');

let moedas = loadMoedasFromCache() || 1000;
let selectedGemini = null;
let grid = Array(40).fill(null); // Será redimensionado dinamicamente
let gridSize = { cols: 5, rows: 8, total: 40 }; // Configuração inicial
let geminiLevels = ['🐜', '🐛', '🦂', '🕷️', '🐍', '🦎', '🐸', '🐟', '🐱', '🐶', '🦁', '🐅', '🐻', '🐘', '🦒', '🦓', '🦛', '🦏', '🐴', '🐉'];

// Sistema de tutorial - controla quais merges já foram feitos
let tutorialMerges = loadTutorialFromCache() || new Set();

// Sistema de desbloqueio de botões - controla quais botões estão liberados
let unlockedButtons = loadUnlockedButtonsFromCache() || new Set([0]); // Formiga sempre liberada

// Nomes dos animais que são criados ao fazer merge
const mergeNames = [
  '🐛 Lagarta', '🦂 Escorpião', '🕷️ Aranha', '🐍 Cobra', '🦎 Lagarto', 
  '🐸 Sapo', '🐟 Peixe', '🐱 Gato', '🐶 Cachorro', '🦁 Leão',
  '🐅 Tigre', '🐻 Urso', '🐘 Elefante', '🦒 Girafa', '🦓 Zebra',
  '🦛 Hipopótamo', '🦏 Rinoceronte', '🐴 Cavalo', '🐉 Dragão'
];

// Custos progressivos (duplicando a cada nível)
const buyCosts = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200, 102400, 204800, 409600, 819200, 1638400, 3276800, 6553600, 13107200, 26214400, 52428800];

// Função para calcular grid responsivo baseado no tamanho da tela
function calculateResponsiveGrid() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isLandscape = screenWidth > screenHeight;
  
  // Tamanho ideal dos slots baseado no tamanho da tela
  let slotSize;
  if (screenWidth <= 480) {
    slotSize = 35; // Tela pequena (celular)
  } else if (screenWidth <= 768) {
    slotSize = 45; // Tela média (tablet)
  } else if (screenWidth <= 1200) {
    slotSize = 55; // Tela grande (desktop)
  } else {
    slotSize = 65; // Tela muito grande
  }
  
  // Calcular área disponível (deixando margem para botões e interface)
  const availableWidth = screenWidth * 0.85;
  const availableHeight = screenHeight * 0.60;
  
  // Calcular quantos slots cabem considerando gaps
  const gap = 5;
  const cols = Math.floor(availableWidth / (slotSize + gap));
  const rows = Math.floor(availableHeight / (slotSize + gap));
  
  // Aplicar limites mínimos e máximos mais flexíveis
  const minCols = 3, maxCols = 20;
  const minRows = 3, maxRows = 15;
  
  const finalCols = Math.min(Math.max(cols, minCols), maxCols);
  const finalRows = Math.min(Math.max(rows, minRows), maxRows);
  const total = finalCols * finalRows;
  
  // Garantir um mínimo absoluto de 12 slots
  if (total < 12) {
    return {
      cols: 4,
      rows: 3,
      total: 12
    };
  }
  
  return {
    cols: finalCols,
    rows: finalRows,
    total: total
  };
}

// Função para aplicar o grid responsivo
function applyResponsiveGrid() {
  const newGridSize = calculateResponsiveGrid();
  
  // Calcular tamanho dos slots baseado na área disponível
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const availableWidth = screenWidth * 0.85;
  const availableHeight = screenHeight * 0.60;
  const gap = 5;
  
  const slotWidth = Math.floor((availableWidth - (newGridSize.cols - 1) * gap) / newGridSize.cols);
  const slotHeight = Math.floor((availableHeight - (newGridSize.rows - 1) * gap) / newGridSize.rows);
  const slotSize = Math.min(slotWidth, slotHeight);
  
  // Se o tamanho mudou, ajustar arrays e recriar elementos
  if (newGridSize.total !== gridSize.total) {
    const oldGrid = [...grid];
    const oldSize = gridSize.total;
    
    // Salvar animais existentes
    const existingAnimals = [];
    for (let i = 0; i < oldGrid.length; i++) {
      if (oldGrid[i] !== null) {
        existingAnimals.push(oldGrid[i]);
      }
    }
    
    // Atualizar tamanho do grid
    gridSize = newGridSize;
    grid = Array(gridSize.total).fill(null);
    
    // Aplicar CSS dinâmico
    const gridEl = document.getElementById('grid');
    gridEl.style.gridTemplateColumns = `repeat(${gridSize.cols}, ${slotSize}px)`;
    gridEl.style.gridTemplateRows = `repeat(${gridSize.rows}, ${slotSize}px)`;
    gridEl.style.gap = `${gap}px`;
    
    // IMPORTANTE: Recriar todos os elementos slot fisicamente
    gridEl.innerHTML = '';
    for (let i = 0; i < gridSize.total; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.dataset.index = i;
      slot.style.width = `${slotSize}px`;
      slot.style.height = `${slotSize}px`;
      gridEl.appendChild(slot);
    }
    
    // Recolocar animais no novo grid
    let targetIndex = 0;
    for (const animalLevel of existingAnimals) {
      if (targetIndex < gridSize.total) {
        grid[targetIndex] = animalLevel;
        const gemini = createGemini(animalLevel, targetIndex);
        gridEl.children[targetIndex].appendChild(gemini);
        targetIndex++;
      }
    }
    
    console.log(`Grid redimensionado: ${gridSize.cols}x${gridSize.rows} = ${gridSize.total} slots`);
    return true; // Indica que houve mudança
  }
  
  return false; // Não houve mudança
}

// Cores para cada nível
const colors = [
  '#8B4513', '#A0522D', '#D2691E', '#FF8C00', '#FFA500',
  '#FFD700', '#FFFF00', '#ADFF2F', '#32CD32', '#00FF00',
  '#00CED1', '#1E90FF', '#0000FF', '#8A2BE2', '#FF00FF',
  '#FF1493', '#DC143C', '#B22222', '#8B0000', '#FF0000'
];

// Funções para salvar/carregar moedas do cache
function saveMoedasToCache() {
  try {
    localStorage.setItem('mergeAnimals_moedas', moedas.toString());
  } catch (error) {
    console.log('Erro ao salvar moedas:', error);
  }
}

function loadMoedasFromCache() {
  try {
    const savedMoedas = localStorage.getItem('mergeAnimals_moedas');
    return savedMoedas ? parseInt(savedMoedas) : null;
  } catch (error) {
    console.log('Erro ao carregar moedas:', error);
    return null;
  }
}

function saveTutorialToCache() {
  try {
    localStorage.setItem('mergeAnimals_tutorial', JSON.stringify([...tutorialMerges]));
  } catch (error) {
    console.log('Erro ao salvar tutorial:', error);
  }
}

function loadTutorialFromCache() {
  try {
    const savedTutorial = localStorage.getItem('mergeAnimals_tutorial');
    return savedTutorial ? new Set(JSON.parse(savedTutorial)) : null;
  } catch (error) {
    console.log('Erro ao carregar tutorial:', error);
    return null;
  }
}

function saveUnlockedButtonsToCache() {
  try {
    localStorage.setItem('mergeAnimals_unlocked', JSON.stringify([...unlockedButtons]));
  } catch (error) {
    console.log('Erro ao salvar botões desbloqueados:', error);
  }
}

function loadUnlockedButtonsFromCache() {
  try {
    const savedUnlocked = localStorage.getItem('mergeAnimals_unlocked');
    return savedUnlocked ? new Set(JSON.parse(savedUnlocked)) : null;
  } catch (error) {
    console.log('Erro ao carregar botões desbloqueados:', error);
    return null;
  }
}

function saveGridToCache() {
  try {
    localStorage.setItem('mergeAnimals_grid', JSON.stringify(grid));
  } catch (error) {
    console.log('Erro ao salvar grid:', error);
  }
}

function loadGridFromCache() {
  try {
    const savedGrid = localStorage.getItem('mergeAnimals_grid');
    return savedGrid ? JSON.parse(savedGrid) : null;
  } catch (error) {
    console.log('Erro ao carregar grid:', error);
    return null;
  }
}

function clearCache() {
  try {
    localStorage.removeItem('mergeAnimals_moedas');
    localStorage.removeItem('mergeAnimals_tutorial');
    localStorage.removeItem('mergeAnimals_unlocked');
    localStorage.removeItem('mergeAnimals_grid');
    logMessage('Cache limpo com sucesso!');
  } catch (error) {
    console.log('Erro ao limpar cache:', error);
  }
}

function hasSavedGame() {
  try {
    const savedMoedas = localStorage.getItem('mergeAnimals_moedas');
    const savedGrid = localStorage.getItem('mergeAnimals_grid');
    const savedUnlocked = localStorage.getItem('mergeAnimals_unlocked');
    const savedTutorial = localStorage.getItem('mergeAnimals_tutorial');
    
    // Verificar se os dados são diferentes dos valores padrão
    let hasRealProgress = false;
    
    // Verificar moedas (diferente de 1000)
    if (savedMoedas && parseInt(savedMoedas) !== 1000) {
      hasRealProgress = true;
    }
    
    // Verificar grid (se tem animais além das 3 formigas iniciais ou animais evoluídos)
    if (savedGrid) {
      const gridData = JSON.parse(savedGrid);
      const nonNullSlots = gridData.filter(slot => slot !== null);
      // Se tem mais de 3 animais ou algum animal que não seja formiga (nível 0)
      if (nonNullSlots.length > 3 || nonNullSlots.some(level => level > 0)) {
        hasRealProgress = true;
      }
    }
    
    // Verificar botões desbloqueados (além da formiga padrão)
    if (savedUnlocked) {
      const unlockedData = JSON.parse(savedUnlocked);
      // Se tem mais botões desbloqueados além da formiga (índice 0)
      if (unlockedData.length > 1 || !unlockedData.includes(0)) {
        hasRealProgress = true;
      }
    }
    
    // Verificar tutorial (se já fez algum merge)
    if (savedTutorial) {
      const tutorialData = JSON.parse(savedTutorial);
      if (tutorialData.length > 0) {
        hasRealProgress = true;
      }
    }
    
    return hasRealProgress;
  } catch (error) {
    console.log('Erro ao verificar jogo salvo:', error);
    return false;
  }
}

function showLoadGamePopup() {
  const popupDiv = document.createElement('div');
  popupDiv.className = 'restart-popup';
  
  popupDiv.innerHTML = `
    <div style="font-size: 1.3em; margin-bottom: 15px;">💾 JOGO SALVO ENCONTRADO 💾</div>
    <div style="margin-bottom: 20px; line-height: 1.4;">
      Foi encontrado um progresso salvo. O que deseja fazer?
    </div>
    <div class="restart-popup-buttons">
      <button class="restart-popup-button keep" onclick="loadSavedGame()">
        📂 Continuar Jogo<br>
        <small style="font-size: 0.8em;">Carregar progresso salvo</small>
      </button>
      <button class="restart-popup-button reset" onclick="startFreshGame()">
        🆕 Novo Jogo<br>
        <small style="font-size: 0.8em;">Começar do zero</small>
      </button>
    </div>
  `;
  
  document.body.appendChild(popupDiv);
}

function loadSavedGame() {
  // Remove popup
  const popup = document.querySelector('.restart-popup');
  if (popup) popup.remove();
  
  // Carregar dados salvos
  moedas = loadMoedasFromCache() || 1000;
  tutorialMerges = loadTutorialFromCache() || new Set();
  unlockedButtons = loadUnlockedButtonsFromCache() || new Set([0]);
  
  // Inicializar o jogo normalmente (vai carregar o grid salvo)
  initGrid();
  updateMoedas();
  updateButtonVisibility();
  
  // Mostrar informações do jogo carregado
  const currentPower = calculateBattlePower();
  const totalAnimals = grid.filter(slot => slot !== null).length;
  const unlockedCount = unlockedButtons.size;
  
  logMessage('💾 Jogo carregado com sucesso!');
  logMessage(`Moedas: ${moedas} | Animais: ${totalAnimals} | Poder: ${currentPower}`);
  logMessage(`Animais desbloqueados: ${unlockedCount}/20`);
}

function startFreshGame() {
  // Remove popup
  const popup = document.querySelector('.restart-popup');
  if (popup) popup.remove();
  
  // Limpar cache
  clearCache();
  
  // Resetar variáveis
  moedas = 1000;
  tutorialMerges = new Set();
  unlockedButtons = new Set([0]);
  grid = Array(40).fill(null);
  
  // Inicializar novo jogo
  initGrid();
  updateMoedas();
  updateButtonVisibility();
  
  const initialPower = calculateBattlePower();
  logMessage('🆕 Novo jogo iniciado!');
  logMessage(`Poder inicial: ${initialPower}`);
}

function showMergeTutorial(fromLevel, toLevel) {
  // Verifica se já mostrou este tutorial antes
  if (tutorialMerges.has(toLevel)) {
    return; // Já mostrou, não mostrar novamente
  }
  
  // Marcar como mostrado e salvar
  tutorialMerges.add(toLevel);
  saveTutorialToCache();
  
  // Desbloquear o botão do próximo nível se existir
  if (toLevel < geminiLevels.length - 1) {
    unlockedButtons.add(toLevel);
    saveUnlockedButtonsToCache();
    updateButtonVisibility();
  }
  
  // Criar e mostrar a mensagem
  const tutorialDiv = document.createElement('div');
  tutorialDiv.className = 'merge-tutorial';
  
  const fromAnimal = geminiLevels[fromLevel];
  const toAnimal = geminiLevels[toLevel];
  const animalName = mergeNames[toLevel - 1]; // -1 porque o array começa do índice 0
  
  tutorialDiv.innerHTML = `
    <div style="font-size: 1.2em; margin-bottom: 10px;">🎉 PRIMEIRO MERGE! 🎉</div>
    <div>${fromAnimal} + ${fromAnimal} = ${toAnimal}</div>
    <div style="margin-top: 10px; font-size: 1.1em;">Você criou: ${animalName}!</div>
    ${toLevel < geminiLevels.length - 1 ? '<div style="margin-top: 8px; font-size: 0.9em; color: #FFD700;">🔓 Novo animal desbloqueado!</div>' : ''}
  `;
  
  document.body.appendChild(tutorialDiv);
  
  // Remover após 4 segundos
  setTimeout(() => {
    if (tutorialDiv.parentNode) {
      tutorialDiv.parentNode.removeChild(tutorialDiv);
    }
  }, 7000);
}

function updateButtonVisibility() {
  const buttons = [
    buy1Btn, buy2Btn, buy3Btn, buy4Btn, buy5Btn, buy6Btn, buy7Btn, buy8Btn, buy9Btn, buy10Btn,
    buy11Btn, buy12Btn, buy13Btn, buy14Btn, buy15Btn, buy16Btn, buy17Btn, buy18Btn, buy19Btn, buy20Btn
  ];
  
  buttons.forEach((button, index) => {
    if (unlockedButtons.has(index)) {
      button.classList.remove('hidden');
    } else {
      button.classList.add('hidden');
    }
  });
}

function updateMoedas() {
  moedasEl.textContent = `Moedas: ${moedas}`;
  
  // Salvar moedas no cache automaticamente
  saveMoedasToCache();
  
  // Salvar grid no cache automaticamente
  saveGridToCache();
  
  // Atualizar visibilidade dos botões
  updateButtonVisibility();
  
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
  buy11Btn.disabled = moedas < buyCosts[10] || emptySlots < 1; // 🦁 (102400
  buy12Btn.disabled = moedas < buyCosts[11] || emptySlots < 1; // 🐅 (204800)
  buy13Btn.disabled = moedas < buyCosts[12] || emptySlots < 1; // 🐻 (409600)
  buy14Btn.disabled = moedas < buyCosts[13] || emptySlots < 1; // 🐘 (819200)
  buy15Btn.disabled = moedas < buyCosts[14] || emptySlots < 1; // 🦒 (1638400)
  buy16Btn.disabled = moedas < buyCosts[15] || emptySlots < 1; // 🦓 (3276800)
  buy17Btn.disabled = moedas < buyCosts[16] || emptySlots < 1; // 🦛 (6553600)
  buy18Btn.disabled = moedas < buyCosts[17] || emptySlots < 1; // 🦏 (13107200)
  buy19Btn.disabled = moedas < buyCosts[18] || emptySlots < 1; // 🐴 (26214400)
  buy20Btn.disabled = moedas < buyCosts[19] || emptySlots < 1; // 🐉 (52428800)
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
      const oldLevel = parseInt(selectedGemini.dataset.level);
      const newLevel = oldLevel + 1;
      if (newLevel < geminiLevels.length) {
        grid[index1] = null;
        grid[index2] = newLevel;
        
        // Mostrar tutorial na primeira vez que este merge é feito
        showMergeTutorial(oldLevel, newLevel);
        
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
  
  // Salvar grid após compra
  saveGridToCache();
  
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
function buy11Lion() { buyGemini(buyCosts[10], 10, 1, geminiLevels[10]); } // 🦁 (102400)
function buy12Tiger() { buyGemini(buyCosts[11], 11, 1, geminiLevels[11]); } // 🐅 (204800)
function buy13Bear() { buyGemini(buyCosts[12], 12, 1, geminiLevels[12]); } // 🐻 (409600)
function buy14Elephant() { buyGemini(buyCosts[13], 13, 1, geminiLevels[13]); } // 🐘 (819200)
function buy15Giraffe() { buyGemini(buyCosts[14], 14, 1, geminiLevels[14]); } // 🦒 (1638400)
function buy16Zebra() { buyGemini(buyCosts[15], 15, 1, geminiLevels[15]); } // 🦓 (3276800)
function buy17Hippo() { buyGemini(buyCosts[16], 16, 1, geminiLevels[16]); } // 🦛 (6553600)
function buy18Rhino() { buyGemini(buyCosts[17], 17, 1, geminiLevels[17]); } // 🦏 (13107200)
function buy19Horse() { buyGemini(buyCosts[18], 18, 1, geminiLevels[18]); } // 🐴 (26214400)
function buy20Dragon() { buyGemini(buyCosts[19], 19, 1, geminiLevels[19]); } // 🐉 (52428800)

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
  // Calcular e aplicar grid responsivo
  applyResponsiveGrid();
  
  gridEl.innerHTML = '';
  for (let i = 0; i < gridSize.total; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.index = i;
    gridEl.appendChild(slot);
  }
  
  // Tentar carregar grid salvo
  const savedGrid = loadGridFromCache();
  if (savedGrid && savedGrid.some(slot => slot !== null)) {
    // Migrar dados salvos para o novo tamanho de grid
    const animalsToPlace = [];
    for (let i = 0; i < savedGrid.length; i++) {
      if (savedGrid[i] !== null) {
        animalsToPlace.push(savedGrid[i]);
      }
    }
    
    // Colocar animais no novo grid
    let targetIndex = 0;
    for (const animalLevel of animalsToPlace) {
      if (targetIndex < gridSize.total) {
        grid[targetIndex] = animalLevel;
        const gemini = createGemini(animalLevel, targetIndex);
        gridEl.children[targetIndex].appendChild(gemini);
        targetIndex++;
      }
    }
  } else {
    // Criar 3 formigas iniciais
    const initialAnimals = Math.min(3, Math.floor(gridSize.total * 0.1)); // 10% do grid ou 3, o que for menor
    for (let i = 0; i < initialAnimals; i++) {
      const randomIndex = Math.floor(Math.random() * gridSize.total);
      if (grid[randomIndex] === null) {
        grid[randomIndex] = 0;
        const gemini = createGemini(0, randomIndex);
        gridEl.children[randomIndex].appendChild(gemini);
      }
    }
  }
  
  // Salvar o grid inicial
  saveGridToCache();
}

function restartGame() {
  // Criar popup visual elegante
  const popupDiv = document.createElement('div');
  popupDiv.className = 'restart-popup';
  
  popupDiv.innerHTML = `
    <div style="font-size: 1.3em; margin-bottom: 15px;">🔄 REINICIAR JOGO 🔄</div>
    <div style="margin-bottom: 20px; line-height: 1.4;">
      Escolha como deseja reiniciar o jogo:
    </div>
    <div class="restart-popup-buttons">
      <button class="restart-popup-button keep" onclick="restartKeepProgress()">
        🎯 Manter Progresso<br>
        <small style="font-size: 0.8em;">Manter moedas e desbloqueios</small>
      </button>
      <button class="restart-popup-button reset" onclick="restartFullReset()">
        🔥 Reset Completo<br>
        <small style="font-size: 0.8em;">Limpar tudo e começar do zero</small>
      </button>
    </div>
  `;
  
  document.body.appendChild(popupDiv);
}

function restartKeepProgress() {
  // Remove popup
  const popup = document.querySelector('.restart-popup');
  if (popup) popup.remove();
  
  // Salvar o estado atual do grid antes de reiniciar
  saveGridToCache();
  
  // Limpar seleção atual
  selectedGemini = null;
  if (selectedGemini) {
    selectedGemini.style.outline = '';
  }
  
  // Recalcular grid responsivo
  applyResponsiveGrid();
  
  // Clear and reinitialize the grid
  gridEl.innerHTML = '';
  for (let i = 0; i < gridSize.total; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.index = i;
    gridEl.appendChild(slot);
  }
  
  // Restaurar os animais que estavam no grid
  const savedGrid = loadGridFromCache();
  if (savedGrid) {
    // Migrar animais para o novo tamanho de grid
    const animalsToPlace = [];
    for (let i = 0; i < savedGrid.length; i++) {
      if (savedGrid[i] !== null) {
        animalsToPlace.push(savedGrid[i]);
      }
    }
    
    // Recriar array do grid com novo tamanho
    grid = Array(gridSize.total).fill(null);
    
    // Colocar animais no novo grid
    let targetIndex = 0;
    for (const animalLevel of animalsToPlace) {
      if (targetIndex < gridSize.total) {
        grid[targetIndex] = animalLevel;
        const gemini = createGemini(animalLevel, targetIndex);
        gridEl.children[targetIndex].appendChild(gemini);
        targetIndex++;
      }
    }
    
    logMessage(`Grid restaurado! Animais preservados. (${gridSize.cols}x${gridSize.rows})`);
  } else {
    // Se não há grid salvo, criar 3 formigas iniciais
    grid = Array(gridSize.total).fill(null);
    const initialAnimals = Math.min(3, Math.floor(gridSize.total * 0.1));
    for (let i = 0; i < initialAnimals; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * gridSize.total);
      } while (grid[randomIndex] !== null);
      grid[randomIndex] = 0;
      const gemini = createGemini(0, randomIndex);
      gridEl.children[randomIndex].appendChild(gemini);
    }
    
    logMessage(`Grid reiniciado! Progresso mantido. (${gridSize.cols}x${gridSize.rows})`);
  }
  
  // Clear the log (manter apenas a mensagem de restauração)
  const currentLog = logMessages.innerHTML;
  logMessages.innerHTML = '';
  logMessage(savedGrid ? `Grid restaurado! Animais preservados. (${gridSize.cols}x${gridSize.rows})` : `Grid reiniciado! Progresso mantido. (${gridSize.cols}x${gridSize.rows})`);
  
  // Mostrar poder de batalha atual
  const restartPower = calculateBattlePower();
  logMessage(`Poder atual: ${restartPower}`);
  
  updateMoedas();
}

function restartFullReset() {
  // Remove popup
  const popup = document.querySelector('.restart-popup');
  if (popup) popup.remove();
  
  // Reset completo - limpar todo o localStorage
  clearCache();
  
  // Recalcular grid responsivo
  applyResponsiveGrid();
  
  // Resetar todas as variáveis para o estado inicial
  moedas = 1000;
  tutorialMerges = new Set();
  unlockedButtons = new Set([0]); // Só formiga liberada
  selectedGemini = null;
  grid = Array(gridSize.total).fill(null);
  
  // Clear any selected gemini styling
  if (selectedGemini) {
    selectedGemini.style.outline = '';
  }
  
  // Clear and reinitialize the grid
  gridEl.innerHTML = '';
  for (let i = 0; i < gridSize.total; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.dataset.index = i;
    gridEl.appendChild(slot);
  }
  
  // Clear the log
  logMessages.innerHTML = '';
  
  // Add initial animals (scaled to grid size)
  const initialAnimals = Math.min(3, Math.floor(gridSize.total * 0.1));
  for (let i = 0; i < initialAnimals; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * gridSize.total);
    } while (grid[randomIndex] !== null);
    grid[randomIndex] = 0;
    const gemini = createGemini(0, randomIndex);
    gridEl.children[randomIndex].appendChild(gemini);
  }
  
  // Mostrar poder de batalha após reiniciar
  const restartPower = calculateBattlePower();
  logMessage(`Reset completo realizado! Grid: ${gridSize.cols}x${gridSize.rows} - Poder inicial: ${restartPower}`);
  
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
buy11Btn.addEventListener('click', buy11Lion);
buy12Btn.addEventListener('click', buy12Tiger);
buy13Btn.addEventListener('click', buy13Bear);
buy14Btn.addEventListener('click', buy14Elephant);
buy15Btn.addEventListener('click', buy15Giraffe);
buy16Btn.addEventListener('click', buy16Zebra);
buy17Btn.addEventListener('click', buy17Hippo);
buy18Btn.addEventListener('click', buy18Rhino);
buy19Btn.addEventListener('click', buy19Horse);
buy20Btn.addEventListener('click', buy20Dragon);

battleBtn.addEventListener('click', startBattle);
restartBtn.addEventListener('click', restartGame);

// Event listener para redimensionar grid quando a tela muda
window.addEventListener('resize', () => {
  // Usar debounce para evitar muitas chamadas
  clearTimeout(window.resizeTimer);
  window.resizeTimer = setTimeout(() => {
    const hasChanged = applyResponsiveGrid();
    
    if (hasChanged) {
      // Salvar novo estado
      saveGridToCache();
      logMessage(`📐 Grid redimensionado: ${gridSize.cols}x${gridSize.rows} (${gridSize.total} slots)`);
    }
  }, 300); // 300ms debounce
});

// Inicializar
// Verificar se há jogo salvo antes de inicializar
if (hasSavedGame()) {
  // Há dados salvos, mostrar popup para escolher
  showLoadGamePopup();
} else {
  // Não há dados salvos, inicializar normalmente
  initGrid();
  updateMoedas();
  updateButtonVisibility();
  logMessage('Novo jogo iniciado!');
}
