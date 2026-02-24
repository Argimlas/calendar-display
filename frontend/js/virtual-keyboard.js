const VirtualKeyboard = {
  activeInput: null,
  isOpen: false,

  // QWERTZ German keyboard layout - echte Tastatur-Form
  keyboardLayout: [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P", "Ü"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ö", "Ä"],
    ["Y", "X", "C", "V", "B", "N", "M", ".", ",", "-"],
    ["Space", "Backspace", "Enter"],
  ],

  init() {
    // Register input fields that should trigger keyboard
    const inputFields = document.querySelectorAll(
      "#quickbook-title, #book-title",
    );

    inputFields.forEach((input) => {
      input.addEventListener("focus", () => this.open(input));
      // Entferne blur event - es schließt das keyboard zu früh!
    });

    // Close keyboard when clicking outside of keyboard and input fields
    document.addEventListener("click", (e) => {
      if (
        this.isOpen &&
        !e.target.closest("#virtual-keyboard") &&
        !e.target.closest('input[type="text"]')
      ) {
        this.close();
      }
    });

    // Attach key click handlers
    this.attachKeyHandlers();

    // Auto-focus on quickbook title field
    const quickbookTitle = document.getElementById("quickbook-title");
    if (quickbookTitle) {
      setTimeout(() => {
        quickbookTitle.focus();
      }, 500);
    }

    console.log("✓ Virtual keyboard initialized");
  },

  open(inputElement) {
    this.activeInput = inputElement;
    this.isOpen = true;

    const keyboard = document.getElementById("virtual-keyboard");
    keyboard.classList.remove("hidden");
    keyboard.classList.add("visible");

    // Update display mit aktuellem Text
    this.updateDisplay();

    console.log("Keyboard opened for:", inputElement.id);
  },

  close() {
    this.activeInput = null;
    this.isOpen = false;

    const keyboard = document.getElementById("virtual-keyboard");
    keyboard.classList.add("hidden");
    keyboard.classList.remove("visible");

    // Leere das Display-Feld
    const display = document.getElementById("vk-display");
    if (display) {
      display.value = "";
    }

    console.log("Keyboard closed");
  },

  attachKeyHandlers() {
    const keyboard = document.getElementById("virtual-keyboard");
    const keys = keyboard.querySelectorAll(".vk-key");

    keys.forEach((key) => {
      key.addEventListener("click", (e) => {
        e.preventDefault();
        // Verhindere dass der Input blur bekommt
        e.stopPropagation();
        const keyValue = key.getAttribute("data-key");
        this.handleKeyPress(keyValue);
        // Behalte Focus auf dem Input
        if (this.activeInput) {
          this.activeInput.focus();
        }
      });

      // Visual feedback for touch
      key.addEventListener("touchstart", () => {
        key.classList.add("vk-key-active");
      });

      key.addEventListener("touchend", () => {
        key.classList.remove("vk-key-active");
      });
    });

    // Close button
    const closeBtn = keyboard.querySelector("#vk-close");
    closeBtn.addEventListener("click", () => this.close());
  },

  handleKeyPress(key) {
    if (!this.activeInput) return;

    if (key === "Space") {
      this.activeInput.value += " ";
    } else if (key === "Backspace") {
      this.activeInput.value = this.activeInput.value.slice(0, -1);
    } else if (key === "Enter") {
      // Submit the form
      const form = this.activeInput.closest("form");
      if (form) {
        form.dispatchEvent(new Event("submit"));
      }
      this.close();
    } else {
      // Regular character
      this.activeInput.value += key.toLowerCase();
    }

    // Trigger input event for any listeners
    this.activeInput.dispatchEvent(new Event("input"));

    // Aktualisiere das Display-Feld
    this.updateDisplay();
  },

  updateDisplay() {
    const display = document.getElementById("vk-display");
    if (this.activeInput && display) {
      display.value = this.activeInput.value;
    }
  },

  renderKeyboard() {
    const keyboard = document.getElementById("virtual-keyboard");
    const keysContainer = keyboard.querySelector("#vk-keys");

    this.keyboardLayout.forEach((row, rowIndex) => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "vk-row";

      // Versatz für echte Tastatur-Form
      if (rowIndex === 1) {
        rowDiv.style.marginLeft = "1rem";
      } else if (rowIndex === 2) {
        rowDiv.style.marginLeft = "1.5rem";
      } else if (rowIndex === 3) {
        rowDiv.style.marginLeft = "2rem";
      }

      row.forEach((key) => {
        const keyBtn = document.createElement("button");
        keyBtn.className = "vk-key";
        keyBtn.setAttribute("data-key", key);
        keyBtn.type = "button";

        // Special styling for special keys
        if (key === "Space") {
          keyBtn.className += " vk-key-space";
          keyBtn.textContent = "␣";
        } else if (key === "Backspace") {
          keyBtn.className += " vk-key-special";
          keyBtn.textContent = "⌫";
        } else if (key === "Enter") {
          keyBtn.className += " vk-key-enter";
          keyBtn.textContent = "⏎";
        } else {
          keyBtn.textContent = key;
        }

        rowDiv.appendChild(keyBtn);
      });

      keysContainer.appendChild(rowDiv);
    });
  },
};

// Initialize keyboard when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  VirtualKeyboard.renderKeyboard();
  VirtualKeyboard.init();
});
