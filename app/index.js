function gameData() {
  return {
    words: [],
    scrambledWord: "",
    originalWord: "",
    userInput: "",
    result: "",
    level: 0,
    levelProgress: 0,
    hintIndex: 0,
    maxLevel: 100,
    isWrong: false,
    usedLetters: {},
    winSound: new Audio('win.ogg'),
    looseSound: new Audio('loose.ogg'),
    async init() {
      const savedLevel = localStorage.getItem("barazz-18-level");
      if (savedLevel) {
        this.level = parseInt(savedLevel, 10);
        this.levelProgress = parseInt(localStorage.getItem("barazz-18-level-progress"), 10)
      } else {
        localStorage.setItem("barazz-18-level", this.level);
        localStorage.setItem("barazz-18-level-progress", this.levelProgress);
      }
      const wordsRes = await fetch('words.json');
      if (!wordsRes.ok) {
        return;
      }
      const words = await wordsRes.json();
      this.words = words.slice(this.level, (this.level + 1) * (words.length) / this.maxLevel);
      this.startGame();
      document.addEventListener("keydown", this.handleKeydown.bind(this));
    },
    startGame() {
      const randomIndex = Math.floor(Math.random() * this.words.length);
      this.hintIndex = 0;
      this.userInput = "";
      this.usedLetters = {};
      this.originalWord = this.words[randomIndex][0];
      this.scrambledWord = this.scrambleWord(this.originalWord);
    },
    scrambleWord(word) {
      let scrambled = word.split("").map(l => l.toUpperCase());
      for (let i = scrambled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
      }
      return scrambled.join("");
    },
    handleKeydown(event) {
      this.isWrong = false;
      if (event.key.match(/^[α-ω]$/i)) {
        this.addLetter(event.key.toUpperCase());
        if (this.userInput.length === this.originalWord.length) {
          this.checkAnswer();
        }
      } else if (event.key === "Backspace") {
        this.removeTop();
      }
    },
    addLetter(letter) {
      let letterIndex;
      this.scrambledWord.split("").forEach((l, index) => {
        if (l === letter && !this.usedLetters[index]) {
          letterIndex = index;
        }
      });
      if (letterIndex === undefined) {
        return;
      }
      this.userInput += this.scrambledWord[letterIndex];
      this.usedLetters[letterIndex] = true;
      if (this.userInput.length === this.originalWord.length) {
        this.checkAnswer();
      }
    },
    removeTop() {
      let letterIndex;
      this.scrambledWord.split("").forEach((l, index) => {
        if (l === this.userInput[this.userInput.length - 1] && this.usedLetters[index]) {
          letterIndex = index;
        }
      });
      this.usedLetters[letterIndex] = false;
      this.userInput = this.userInput.slice(0, -1);
    },
    showHint() {
      this.hintIndex++;
      for (let i = 0; i < this.userInput.length; i++) {
        this.removeTop();
      }
      for (let i = 0; i < this.hintIndex; i++) {
        this.addLetter(this.originalWord[i].toUpperCase());
      }
    },
    checkAnswer() {
      if (this.userInput.toLowerCase() === this.originalWord.toLowerCase()) {
        this.winSound.play();
        if (this.levelProgress === 9) {
          this.level++;
          this.levelProgress = 0;
        } else {
          this.levelProgress++;
        }
        localStorage.setItem("barazz-18-level-progress", this.levelProgress);
        localStorage.setItem("barazz-18-level", this.level);
        this.startGame();
      } else {
        this.looseSound.play();
        this.isWrong = true;
      }
    }
  }
}

document.addEventListener("alpine:init", () => {
  Alpine.data("game", gameData);
});
