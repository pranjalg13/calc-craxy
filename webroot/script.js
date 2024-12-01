class MathGame {
  constructor() {
    console.log('Initializing MathGame...');
    this.initializeElements();
    this.initializeDialog();
    this.setupEventListeners();
    this.attempts = 0;
    this.isPlayed = false;
    this.targetNumber = 0;
    this.expression = "";
    this.usedNumbers = new Set();
    this.solution = "";
    this.points = 0;
    this.username = 'Guest';
    console.log('MathGame initialized');
  }

  initializeDialog() {
    console.log('Initializing dialog elements...');
    this.dialogOverlay = document.getElementById('dialogOverlay');
    this.dialogMessage = document.getElementById('dialogMessage');
    this.dialogOk = document.getElementById('dialogOk');
    this.dialogCancel = document.getElementById('dialogCancel');
    
    if (!this.dialogOverlay || !this.dialogMessage || !this.dialogOk || !this.dialogCancel) {
      console.error('Dialog elements not found');
      return;
    }
    
    this.dialogOk.replaceWith(this.dialogOk.cloneNode(true));
    this.dialogCancel.replaceWith(this.dialogCancel.cloneNode(true));
    
    this.dialogOk = document.getElementById('dialogOk');
    this.dialogCancel = document.getElementById('dialogCancel');
    
    this.dialogOk.addEventListener('click', () => {
      console.log('Dialog OK clicked');
      if (this.dialogCallback) {
        this.dialogCallback(true);
      }
      this.hideDialog();
    });
    
    this.dialogCancel.addEventListener('click', () => {
      console.log('Dialog Cancel clicked');
      if (this.dialogCallback) {
        this.dialogCallback(false);
      }
      this.hideDialog();
    });
    
    console.log('Dialog initialization complete');
  }

  showDialog(message, showCancel = false) {
    return new Promise((resolve) => {
        if (!this.dialogMessage || !this.dialogOverlay || !this.dialogCancel) {
            console.error('Dialog elements not initialized');
            resolve(false);
            return;
        }

        if (message.includes('How to Play')) {
            this.dialogMessage.closest('.dialog-box').classList.add('help-dialog');
            this.dialogMessage.innerHTML = message;
        } else {
            this.dialogMessage.closest('.dialog-box').classList.remove('help-dialog');
            this.dialogMessage.textContent = message;
        }

        this.dialogCancel.classList.toggle('hidden', !showCancel);
        this.dialogOverlay.classList.remove('hidden');
        this.dialogCallback = resolve;

        if (message.includes("Thanks for playing") || message.includes("Game Over") || message.includes("Congratulations")) {
            this.dialogOk.addEventListener('click', () => {
                window.parent?.postMessage(
                    { type: 'returnToMain' },
                    '*'
                );
            }, { once: true });
        }
    });
  }

  hideDialog() {
    console.log('Hiding dialog');
    if (this.dialogOverlay) {
      this.dialogOverlay.classList.add('hidden');
    }
  }

  disableGame() {
    console.log('Disabling game...');
    this.numberButtons.forEach(btn => {
      btn.disabled = true;
      btn.classList.add('disabled');
    });
    this.operatorButtons.forEach(btn => {
      btn.disabled = true;
      btn.classList.add('disabled');
    });
    this.checkResultBtn.disabled = true;
    this.giveUpBtn.disabled = true;
    this.clearExpressionBtn.disabled = true;
    this.deleteLastCharBtn.disabled = true;
    console.log('Game disabled');
  }

  startGame(puzzle) {
    if (!puzzle) {
      this.showDialog("No puzzle available!");
      this.disableGame();
      return;
    }

    if (this.attempts <= 0 || this.isPlayed) {
      this.showDialog("Thanks for playing Numblet!, You have already played!");
      this.disableGame();
      return;
    }

    this.targetNumber = puzzle.target;
    this.solution = puzzle.solution;
    this.expression = "";
    this.usedNumbers.clear();
    
    // Update number buttons with puzzle numbers
    this.numberButtons.forEach((btn, index) => {
      if (index < puzzle.numbers.length) {
        btn.dataset.value = puzzle.numbers[index].toString();
        btn.textContent = puzzle.numbers[index].toString();
        btn.disabled = false;
        btn.classList.remove('disabled');
      }
    });

    this.updateUI();
  }

  async handleWrongAnswer() {
    this.attempts--;
    this.updateUI();
    
    if (this.attempts <= 0) {
      this.updateGameState(true, this.attempts);
      await this.showDialog("Game Over! No more attempts left. Start a new Game!");
      this.disableGame();
    } else {
      this.updateGameState(false, this.attempts);
      await this.showDialog(`Wrong answer! ${this.attempts} attempts left.`);
      this.clearExpression();
    }
  }

  async checkResult() {
    console.log('Checking result:', this.expression);
    try {
      if (this.attempts <= 0) {
        console.log('No attempts remaining');
        await this.showDialog("Game Over! No more attempts left.");
        this.disableGame();
        return;
      }

      if (!this.isValidExpression(this.expression)) {
        console.log('Invalid expression detected');
        await this.showDialog("Invalid expression! Please check your brackets and operators.");
        return;
      }

      const result = math.evaluate(this.expression);
      console.log(`Expression evaluated to: ${result}`);
      
      if (!Number.isInteger(result)) {
        console.log('Result is not a whole number');
        await this.showDialog("Result must be a whole number!");
        return;
      }

      if (Math.round(result) === this.targetNumber) {
        console.log('Correct answer!');
        this.updateGameState(true, this.attempts);
        const pointsEarned = this.attempts * 10;
        const newPoints = Number(this.points || 0) + pointsEarned;
        this.updatePoints(newPoints);
        await this.showDialog(`🎉 Congratulations! You won! You’ve earned +${pointsEarned} points. Great job—this is your moment to shine today!`);
        this.disableGame();
      } else {
        console.log('Wrong answer');
        this.handleWrongAnswer();
      }
    } catch (error) {
      console.error('Error evaluating expression:', error);
      await this.showDialog("Invalid expression! Please check your input.");
      this.clearExpression();
    }
  }

  initializeElements() {
    this.gameScreen = document.getElementById("gameScreen");
    this.targetNumberElement = document.getElementById("targetNumber");
    this.attemptsElement = document.getElementById("attempts");
    this.expressionInput = document.getElementById("expression");
    this.clearExpressionBtn = document.getElementById("clearExpression");
    this.checkResultBtn = document.getElementById("checkResult");
    this.giveUpBtn = document.getElementById("giveUp");
    this.numberButtons = document.querySelectorAll(".number-btn");
    this.operatorButtons = document.querySelectorAll(".operator-btn");
    this.deleteLastCharBtn = document.getElementById("deleteLastChar");
    this.helpButton = document.getElementById("helpButton");
  }

  setupEventListeners() {
    this.clearExpressionBtn.addEventListener("click", () =>
      this.clearExpression()
    );
    this.checkResultBtn.addEventListener("click", () => this.checkResult());
    this.giveUpBtn.addEventListener("click", () => this.giveUp());
    this.deleteLastCharBtn.addEventListener("click", () => this.deleteLastChar());
    this.helpButton.addEventListener("click", () => this.showHelpDialog());

    this.numberButtons.forEach((btn) => {
      btn.addEventListener("click", () => this.handleNumberClick(btn));
    });

    this.operatorButtons.forEach((btn) => {
      btn.addEventListener("click", () =>
        this.appendToExpression(btn.dataset.value)
      );
    });
  }

  updateUI() {
    console.log('Updating UI...');
    console.log(`Target: ${this.targetNumber}`);
    console.log(`Attempts: ${this.attempts}`);
    console.log(`Expression: ${this.expression}`);
    
    this.targetNumberElement.textContent = this.targetNumber;
    this.attemptsElement.textContent = this.attempts;
    this.expressionInput.value = this.expression;
  }

  appendToExpression(value) {
    const lastChar = this.expression[this.expression.length - 1];

    // If it's a number
    if (!isNaN(value)) {
      // Don't allow consecutive numbers
      if (!isNaN(lastChar)) {
        return;
      }
      // Don't allow reuse of numbers
      if (this.usedNumbers.has(value)) {
        return;
      }
      this.expression += value;
      this.usedNumbers.add(value);
      // Disable the button after use
      const btn = Array.from(this.numberButtons).find(btn => btn.dataset.value === value);
      if (btn) {
        btn.disabled = true;
        btn.classList.add('disabled');
      }
    } 
    // If it's an operator or parenthesis
    else {
      // Don't allow operator at the start except '('
      if (this.expression === '' && value !== '(') {
        return;
      }
      this.expression += value;
    }
    this.updateUI();
  }

  handleNumberClick(btn) {
    const value = btn.dataset.value;
    this.appendToExpression(value);
  }

  clearExpression() {
    this.expression = "";
    this.usedNumbers.clear();
    this.updateUI();
    this.resetNumberButtons();
  }

  resetNumberButtons() {
    this.numberButtons.forEach((btn) => {
      btn.disabled = false; // Re-enable buttons
      btn.classList.remove("disabled"); // Remove disabled class
    });
  }

  async giveUp() {
    console.log('Give up initiated');
    try {
      const shouldGiveUp = await this.showDialog("Are you sure you want to give up?", true);
      console.log('Give up response:', shouldGiveUp);
      
      if (shouldGiveUp) {
        console.log('User confirmed give up');
        
        const solutionMessage = this.solution 
          ? `Thanks for playing! Here is the solution: ${this.solution}`
          : "Thanks for playing!";
        
        // Update game state - set attempts to 0 and isPlayed to true
        this.attempts = 0;
        this.isPlayed = true;
        this.updateGameState(true, 0);
        this.updateUI();
        
        // Disable game and show solution
        this.disableGame();
        console.log('Game disabled, showing solution');
        await this.showDialog(solutionMessage);
        
        console.log('Give up complete');
      } else {
        console.log('Give up cancelled by user');
      }
    } catch (error) {
      console.error('Error in giveUp:', error);
    }
  }

  deleteLastChar() {
    console.log('Deleting last character');
    if (this.expression.length === 0) return;

    let lastToken = '';
    let i = this.expression.length - 1;
    
    if (!isNaN(this.expression[i])) {
        while (i >= 0 && !isNaN(this.expression[i])) {
            lastToken = this.expression[i] + lastToken;
            i--;
        }
    } else {
        lastToken = this.expression[i];
    }

    console.log(`Last token to remove: ${lastToken}`);
    if (!isNaN(lastToken)) {
        const btn = Array.from(this.numberButtons).find(btn => btn.dataset.value === lastToken);
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('disabled');
            this.usedNumbers.delete(lastToken);
            console.log(`Re-enabled button for number: ${lastToken}`);
        }
    }

    this.expression = this.expression.slice(0, -lastToken.length);
    console.log(`New expression: ${this.expression}`);
    this.updateUI();
  }

  isValidExpression(expr) {
    // Check for balanced brackets
    let bracketCount = 0;
    for (let char of expr) {
        if (char === '(') bracketCount++;
        if (char === ')') bracketCount--;
        if (bracketCount < 0) return false;
    }
    if (bracketCount !== 0) return false;

    // Check for consecutive operators
    if (/[\+\-\*\/]{2,}/.test(expr)) return false;

    // Check for proper operator placement
    if (/^[\+\*\/]/.test(expr)) return false;  // Can't start with +, *, /
    if (/[\+\-\*\/]$/.test(expr)) return false;  // Can't end with operator

    // Check for empty brackets
    if (/\(\)/.test(expr)) return false;

    return true;
  }

  updatePoints(points) {
    this.points = points;
    console.log("Sending devvit points to: " + points);
    // Send message to parent (Devvit)
    window.parent?.postMessage(
      { type: 'setPoints', data: { newPoints: Number(points) } },
      '*'
    );
  }

  setupMessageListener() {
    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;
      console.log('Received message event:', ev.data);
      
      if (type === 'devvit-message') {
        const { message } = data;
        console.log('Devvit message:', message);
        
        if (message.type === 'initialData') {
          console.log('Initial data received:', message.data);
          const { username, currentPoints, puzzle, attempts, isPlayed } = message.data;
          console.log('Username:', username);
          console.log('Points:', currentPoints);
          console.log('Puzzle:', puzzle);
          console.log('Attempts:', attempts);
          console.log('Is Played:', isPlayed);
          
          this.username = username;
          this.points = currentPoints?.score || 0;
          this.attempts = attempts;
          this.isPlayed = isPlayed;
          
          // Update username in UI
          const playerNameElement = document.getElementById('playerName');
          if (playerNameElement) {
            playerNameElement.textContent = username;
          }

          if (!puzzle) {
            console.error('No puzzle data received in initialData');
            this.showDialog("Error: No puzzle data available");
            return;
          }

          // Start game with received puzzle
          this.startGame(puzzle);
        }
        
        if (message.type === 'updatePoints') {
          console.log('Points update received:', message.data);
          this.points = message.data.currentPoints;
        }
      }
    });
  }

  updateGameState(isPlayed, attempts) {
    window.parent?.postMessage(
      { 
        type: 'updateGameState', 
        data: { 
          isPlayed: isPlayed,
          attempts: attempts 
        } 
      },
      '*'
    );
  }

  async showHelpDialog() {
    const helpMessage = `
        <h3>How to Play Numblet</h3>
        <ol class="rules-list">
            <li>Your goal is to reach the Target Number using the available number tiles.</li>
            <li>Use the given numbers and operators (+, -, ×, ÷) to create an expression.</li>
            <li>Rules:
                <ul class="rules-sublist">
                    <li>Each number can only be used once</li>
                    <li>You have only 1 attempt to find the correct answer</li>
                    <li>First 5 player to solve the puzzle will be displayed on the leaderboard</li>
                </ul>
            </li>
            <li>Click 'Check Result' when you think you have the correct expression.</li>
            <li>Use the backspace (⌫) to remove the last entry or 'Clear' to start over.</li>
        </ol>
        <p class="good-luck">Good luck!</p>`;

    await this.showDialog(helpMessage);
  }
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing game...');
  const game = new MathGame();
  game.setupMessageListener();
});
