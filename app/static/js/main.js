document.addEventListener("input", function (e) {
  if (e.target.tagName.toLowerCase() === "textarea") {
    e.target.style.height = "auto"; // reset
    e.target.style.height = (e.target.scrollHeight) + "px";
  }
});

function resizeInput(input) {
  const length = input.value.length;
  input.style.width = (length > 0 ? length + 1 : 12) + 'ch'; // default to 4ch if empty
}

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

class CustomContextMenu {
    constructor() {
        this.contextMenu = document.getElementById('contextmenu');
        this.selectedText = '';
        this.currentElement = null;
        this.selectedRange = null;
        this.init();
    }

    init() {
        document.addEventListener('contextmenu', (e) => {
            const tagName = e.target.tagName.toLowerCase();
            if (tagName === 'textarea' || tagName === 'input') {
                e.preventDefault();
                this.handleRightClick(e);
            }
        });

        document.addEventListener('click', (e) => {
            if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });

        document.addEventListener('scroll', () => {
            this.hideContextMenu();
        });

        if (this.contextMenu) {
            this.contextMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('menu-links')) {
                    e.preventDefault();
                    this.handleMenuClick(e.target.dataset.action);
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideContextMenu();
            }
        });
    }

    handleRightClick(e) {
        const tagName = e.target.tagName.toLowerCase();
        
        if (tagName !== 'textarea' && tagName !== 'input') {
            this.hideContextMenu();
            return;
        }

        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            this.selectedText = selectedText;
            this.currentElement = e.target;
            this.selectedRange = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
            console.log('Stored range:', this.selectedRange, 'Selected text:', this.selectedText);
            this.showContextMenu(e.clientX, e.clientY, tagName);
        } else {
            this.hideContextMenu();
        }
    }

    showContextMenu(x, y, elementType) {
        if (!this.contextMenu) return;
        
        const copyOption = this.contextMenu.querySelector('[data-action="copy"]').parentElement;
        const moveOption = this.contextMenu.querySelector('[data-action="move"]').parentElement;
        
        if (elementType === 'input') {
            copyOption.style.display = 'block';
            moveOption.style.display = 'none';
        } else if (elementType === 'textarea') {
            copyOption.style.display = 'block';
            moveOption.style.display = 'block';
        }
        
        this.contextMenu.style.display = 'flex';
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
        this.adjustMenuPosition();
    }

    adjustMenuPosition() {
        if (!this.contextMenu) return;
        
        const menuRect = this.contextMenu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (menuRect.right > windowWidth) {
            this.contextMenu.style.left = `${windowWidth - menuRect.width - 10}px`;
        }

        if (menuRect.bottom > windowHeight) {
            this.contextMenu.style.top = `${windowHeight - menuRect.height - 10}px`;
        }

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
        this.selectedRange = null;
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
        if (!this.currentElement || !this.selectedText || !this.selectedRange) {
            console.log('Missing currentElement, selectedText, or selectedRange');
            this.showFeedback('Error: No text selected');
            return;
        }

        // Create new section HTML
        const newSection = document.createElement('div');
        newSection.className = 'second-wrapper';
        newSection.innerHTML = `
            <div class="column-wrapper">
                <div class="lyrics-wrapper">
                    <form action="" class="song-section">
                        <input name="song_section" class="song-section-name" placeholder="Section">
                        <textarea name="lyrics" class="lyrics" placeholder="Type/paste your lyrics here">${this.selectedText}</textarea>
                    </form>
                </div>
                <div class="notes-wrapper">
                    <form action="" class="notes-area">
                        <textarea name="notes" class="notes" placeholder="Add section notes here"></textarea>
                    </form>
                </div>
                <div class="section-options">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-three-dots section-menu" viewBox="0 0 16 16">
                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
                    </svg>
                </div>
            </div>
        `;

        // Append new section to song-container
        const songContainer = document.getElementById('song-container');
        songContainer.appendChild(newSection);

        // Remove selected text from original textarea
        try {
            const originalValue = this.currentElement.value;
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(this.selectedRange);
            if (selection.rangeCount > 0) {
                this.selectedRange.deleteContents();
                console.log('Selected text deleted via range.deleteContents');
                // Verify if deletion worked by checking textarea value
                if (this.currentElement.value === originalValue) {
                    console.log('Deletion failed, textarea value unchanged, using fallback');
                    this.fallbackRemoveText();
                } else {
                    this.currentElement.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } else {
                console.log('No range available after restoring, using fallback');
                this.fallbackRemoveText();
            }
        } catch (err) {
            console.error('Error deleting selected text:', err);
            this.fallbackRemoveText();
        }

        // Apply textarea auto-resize to new textareas
        const newTextareas = newSection.querySelectorAll('textarea');
        newTextareas.forEach(textarea => {
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
        });

        // Add context menu support for new section's textareas
        const newLyricsTextarea = newSection.querySelector('.lyrics');
        const newNotesTextarea = newSection.querySelector('.notes');
        [newLyricsTextarea, newNotesTextarea].forEach(textarea => {
            textarea.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.handleRightClick(e);
            });
        });

        // Add input resizing for new section input
        const newSectionInput = newSection.querySelector('.song-section-name');
        newSectionInput.addEventListener('input', () => resizeInput(newSectionInput));
        resizeInput(newSectionInput);

        // Add Enter key navigation for new input
        newSectionInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                newLyricsTextarea.focus();
            }
        });

        this.showFeedback('Text moved to new section!');
    }

    fallbackRemoveText() {
        if (!this.currentElement || !this.selectedText) return;
        const textareaValue = this.currentElement.value;
        const startPos = textareaValue.indexOf(this.selectedText);
        if (startPos !== -1) {
            this.currentElement.value = textareaValue.slice(0, startPos) + textareaValue.slice(startPos + this.selectedText.length);
            this.currentElement.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('Fallback: Text removed via value manipulation');
        } else {
            console.log('Fallback: Selected text not found in textarea');
            this.showFeedback('Error: Could not remove selected text');
        }
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

document.addEventListener('DOMContentLoaded', () => {
    new CustomContextMenu();
});