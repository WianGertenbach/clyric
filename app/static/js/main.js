//Resizes text input based on length of content
document.addEventListener("input", function (e) {
  if (e.target.tagName.toLowerCase() === "textarea") {
    e.target.style.height = "auto"; // reset
    e.target.style.height = (e.target.scrollHeight) + "px";
  }
});

function resizeInput(input) {
  const length = input.value.length;
  input.style.width = (length > 0 ? length + 1 : 4) + 'ch'; // default to 4ch if empty
}

//Goes to next form input when pressing Enter
document.addEventListener("DOMContentLoaded", () => {
  const fields = document.querySelectorAll("input, textarea");

  fields.forEach((field, index) => {
    if (field.tagName.toLowerCase() === 'input') {
      field.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault(); // Prevent form submission
          const next = fields[index + 1];
          if (next) next.focus();
        }
      });
    }
  });
});

//Displays context menu when right clicking selected text in textareas and inputs
class CustomContextMenu {
    constructor() {
        this.contextMenu = document.getElementById('contextmenu');
        this.selectedText = '';
        this.currentElement = null;
        this.init();
    }

    init() {
        // Prevent default context menu on textareas and inputs
        document.addEventListener('contextmenu', (e) => {
            const tagName = e.target.tagName.toLowerCase();
            if (tagName === 'textarea' || tagName === 'input') {
                e.preventDefault();
                this.handleRightClick(e);
            }
        });

        // Hide context menu when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });

        // Hide context menu on scroll
        document.addEventListener('scroll', () => {
            this.hideContextMenu();
        });

        // Handle menu item clicks
        if (this.contextMenu) {
            this.contextMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('menu-links')) {
                    e.preventDefault();
                    this.handleMenuClick(e.target.dataset.action);
                }
            });
        }

        // Hide context menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideContextMenu();
            }
        });
    }

    handleRightClick(e) {
        const tagName = e.target.tagName.toLowerCase();
        
        // Only proceed if the right-click happened on a textarea or input
        if (tagName !== 'textarea' && tagName !== 'input') {
            this.hideContextMenu();
            return;
        }

        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        // Only show context menu if there's selected text
        if (selectedText.length > 0) {
            this.selectedText = selectedText;
            this.currentElement = e.target;
            this.showContextMenu(e.clientX, e.clientY, tagName);
        } else {
            this.hideContextMenu();
        }
    }

    showContextMenu(x, y, elementType) {
        if (!this.contextMenu) return;
        
        // Show/hide menu options based on element type
        const copyOption = this.contextMenu.querySelector('[data-action="copy"]').parentElement;
        const moveOption = this.contextMenu.querySelector('[data-action="move"]').parentElement;
        
        if (elementType === 'input') {
            // For inputs: show only copy option
            copyOption.style.display = 'block';
            moveOption.style.display = 'none';
        } else if (elementType === 'textarea') {
            // For textareas: show both options
            copyOption.style.display = 'block';
            moveOption.style.display = 'block';
        }
        
        // Show the context menu
        this.contextMenu.style.display = 'flex';
        
        // Position the context menu
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;

        // Ensure the menu doesn't go off-screen
        this.adjustMenuPosition();
    }

    adjustMenuPosition() {
        if (!this.contextMenu) return;
        
        const menuRect = this.contextMenu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Adjust horizontal position if menu goes off-screen
        if (menuRect.right > windowWidth) {
            this.contextMenu.style.left = `${windowWidth - menuRect.width - 10}px`;
        }

        // Adjust vertical position if menu goes off-screen
        if (menuRect.bottom > windowHeight) {
            this.contextMenu.style.top = `${windowHeight - menuRect.height - 10}px`;
        }

        // Ensure menu doesn't go above or to the left of the viewport
        if (menuRect.left < 0) {
            this.contextMenu.style.left = '10px';
        }
        if (menuRect.top < 0) {
            this.contextMenu.style.top = '10px';
        }
    }

    hideContextMenu() {
        if (!this.contextMenu) return;
        
        this.contextMenu.style.display = 'none';
        this.selectedText = '';
        this.currentElement = null;
        
        // Reset all menu options to be visible for next use
        const copyOption = this.contextMenu.querySelector('[data-action="copy"]').parentElement;
        const moveOption = this.contextMenu.querySelector('[data-action="move"]').parentElement;
        copyOption.style.display = 'block';
        moveOption.style.display = 'block';
    }

    handleMenuClick(action) {
        switch (action) {
            case 'copy':
                this.copyToClipboard();
                break;
            case 'move':
                this.moveToSection();
                break;
            default:
                console.log('Unknown action:', action);
        }
        
        // Hide the context menu after action
        this.hideContextMenu();
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.selectedText);
            this.showFeedback('Text copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.fallbackCopyTextToClipboard(this.selectedText);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showFeedback('Text copied to clipboard!');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            this.showFeedback('Failed to copy text');
        }
        
        document.body.removeChild(textArea);
    }

    moveToSection() {
        console.log('Moving text to section:', this.selectedText);
        this.showFeedback('Move to section functionality - implement as needed');
    }

    showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #F6C28B;
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (document.body.contains(feedback)) {
                document.body.removeChild(feedback);
            }
        }, 3000);
    }
}

// Initialize the custom context menu when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CustomContextMenu();
});