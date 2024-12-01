# **Numblet** 🎲  

Numblet is a fun and challenging math puzzle game designed for Reddit webview! Players are tasked with forming a target number using six given numbers and basic mathematical operations (`+`, `-`, `*`, `/`). Each number can be used only once, and players have three attempts to crack the puzzle.  

If you’re stuck, you can give up to reveal the solution—but be warned: once you finish (whether you win, lose, or give up), you can’t replay the same game again.  

---

## **App Overview**  

Numblet is designed to test your problem-solving and arithmetic skills:  

- **Target Number**: A randomly generated number you need to achieve.  
- **Given Numbers**: Six numbers provided for you to use in forming the target.  
- **Math Operations**: Use addition, subtraction, multiplication, and division to reach the target.  
- **Attempts**: You get 3 attempts to find the correct solution.  
- **Points**: Earn points based on how quickly you solve the puzzle:
  - **First attempt**: Maximum points  
  - **Second attempt**: Fewer points  
  - **Third attempt**: Minimal points  

Once the game concludes, whether you win, lose, or give up, you can’t replay the same game.

---

## **Instructions**  

### **How to Play**  
1. **Start the Game**:
   - When you open the game, you’ll be presented with:
     - A **target number** to aim for.
     - Six **numbers** you can use to form the target.
   - Your goal is to combine the six numbers with mathematical operations to exactly match the target.

2. **Build Your Expression**:
   - Click on the numbers and operators to form a valid mathematical expression.  
   - Each number can only be used once.  

3. **Submit Your Answer**:
   - Press the **Submit** button to check if your expression matches the target.  
   - If your answer is correct, you win points based on your attempt.  

4. **Game End**:
   - If you exhaust your 3 attempts or click the **Give Up** button, the game ends.
   - If you give up, the solution is revealed, but you won’t earn points.

5. **Leaderboard**:
   - Your score is added to the game leaderboard, where you can see how you rank against other players.  

---

### **Game Rules**
- You have **3 attempts** to solve the puzzle.
- The **numbers** provided can only be used once in your expression.
- Valid mathematical operations are:
  - Addition (`+`)
  - Subtraction (`-`)
  - Multiplication (`*`)
  - Division (`/`)
- Parentheses can be used to structure your equation.

---

### **User Options**
- **Submit**: Submit your expression to see if it matches the target.  
- **Clear**: Clear the current expression and start fresh.  
- **Give Up**: Reveal the solution and end the game (no points awarded).  

---

### **Technical Notes**  
Numblet is currently optimized for Reddit webview and uses **Redis** for backend storage. Game states, such as whether a user has played a specific puzzle or their scores, are stored persistently.  

---

### **Upcoming Features**  
- Cross-platform support for mobile and desktop.  
- Advanced difficulty levels.  
- Daily challenges and streak bonuses.  

---

Enjoy playing **Numblet**, and good luck reaching your target! 🚀  