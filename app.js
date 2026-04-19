// BADDAD Generator - Starter App
// Handles prompt creation and image generation flow

class BaddadGenerator {
  constructor() {
    this.history = [];
  }

  generatePrompt(userInput) {
    const baseStyle = `
    Photo-realistic 4K commercial image.
    Australian male, 25–45.
    Masculine, relatable, natural lighting.
    Print fully integrated into fabric, not a sticker.
    High detail, sharp focus, premium quality.
    `;

    const finalPrompt = `${baseStyle}\nScene: ${userInput}`;
    
    this.history.push({
      input: userInput,
      output: finalPrompt,
      timestamp: new Date()
    });

    return finalPrompt;
  }

  editPrompt(originalPrompt, changeRequest) {
    return `${originalPrompt}\n\nEDIT REQUEST: ${changeRequest}`;
  }

  getHistory() {
    return this.history;
  }
}

// Example usage
const generator = new BaddadGenerator();

const prompt = generator.generatePrompt(
  "Man standing next to a Holden Commodore wagon, wearing a black t-shirt"
);

console.log(prompt);