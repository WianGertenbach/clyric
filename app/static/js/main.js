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

  // Initialize drag-and-drop for existing sections
  initializeDragAndDrop();
});

function initializeDragAndDrop() {
  const sections = document.querySelectorAll('.second-wrapper');
  sections.forEach(section => {
    section.draggable = true;
    section.addEventListener('dragstart', handleDragStart);
    section.addEventListener('dragover', handleDragOver);
    section.addEventListener('drop', handleDrop);
    section.addEventListener('dragend', handleDragEnd);
  });
}

function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.sectionId);
  e.target.classList.add('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData('text/plain');
  const draggedSection = document.querySelector(`[data-section-id="${draggedId}"]`);
  const dropTarget = e.target.closest('.second-wrapper');
  if (draggedSection && dropTarget && draggedSection !== dropTarget) {
    const songContainer = document.getElementById('song-container');
    const sections = Array.from(songContainer.querySelectorAll('.second-wrapper'));
    const dropIndex = sections.indexOf(dropTarget);
    const draggedIndex = sections.indexOf(draggedSection);
    if (draggedIndex < dropIndex) {
      dropTarget.after(draggedSection);
    } else {
      dropTarget.before(draggedSection);
    }
  }
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
}

class CustomContextMenu {
  constructor() {
    this.textContextMenu = document.getElementById('contextmenu');
    this.sectionContextMenu = document.getElementById('section-contextmenu');
    this.selectedText = '';
    this.currentElement = null;
    this.selectedRange = null;
    this.currentSection = null;
    this.init();
  }

  init() {
    // Text context menu for textareas and inputs
    document.addEventListener('contextmenu', (e) => {
      const tagName = e.target.tagName.toLowerCase();
      if (tagName === 'textarea' || tagName === 'input') {
        e.preventDefault();
        this.handleTextRightClick(e);
      }
    });

    // Section context menu for triple-dot buttons
    document.addEventListener('click', (e) => {
      if (e.target.closest('.tripple-dot-menu')) {
        e.preventDefault();
        this.handleSectionMenuClick(e);
      } else if (this.textContextMenu && !this.textContextMenu.contains(e.target) && 
                 this.sectionContextMenu && !this.sectionContextMenu.contains(e.target)) {
        this.hideTextContextMenu();
        this.hideSectionContextMenu();
      }
    });

    // Handle text context menu item clicks
    if (this.textContextMenu) {
      this.textContextMenu.addEventListener('click', (e) => {
        if (e.target.classList.contains('menu-links')) {
          e.preventDefault();
          this.handleTextMenuClick(e.target.dataset.action);
        }
      });
    }

    // Handle section context menu item clicks
    if (this.sectionContextMenu) {
      this.sectionContextMenu.addEventListener('click', (e) => {
        if (e.target.classList.contains('menu-links')) {
          e.preventDefault();
          this.handleSectionMenuAction(e.target.dataset.action);
        }
      });
    }

    // Hide context menus on scroll or Escape key
    document.addEventListener('scroll', () => {
      this.hideTextContextMenu();
      this.hideSectionContextMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideTextContextMenu();
        this.hideSectionContextMenu();
      }
    });
  }

  handleTextRightClick(e) {
    const tagName = e.target.tagName.toLowerCase();
    
    if (tagName !== 'textarea' && tagName !== 'input') {
      this.hideTextContextMenu();
      return;
    }

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (selectedText.length > 0) {
      this.selectedText = selectedText;
      this.currentElement = e.target;
      this.selectedRange = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
      this.showTextContextMenu(e.clientX, e.clientY, tagName);
    } else {
      this.hideTextContextMenu();
    }
  }

  handleSectionMenuClick(e) {
    this.currentSection = e.target.closest('.second-wrapper');
    if (this.currentSection) {
      // Assign a unique ID to the section if it doesn't have one
      if (!this.currentSection.dataset.sectionId) {
        this.currentSection.dataset.sectionId = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      this.showSectionContextMenu(e.clientX, e.clientY);
    }
  }

  showTextContextMenu(x, y, elementType) {
    if (!this.textContextMenu) return;
    
    const copyOption = this.textContextMenu.querySelector('[data-action="copy"]').parentElement;
    const moveOption = this.textContextMenu.querySelector('[data-action="move"]').parentElement;
    
    if (elementType === 'input') {
      copyOption.style.display = 'block';
      moveOption.style.display = 'none';
    } else if (elementType === 'textarea') {
      copyOption.style.display = 'block';
      moveOption.style.display = 'block';
    }
    
    this.textContextMenu.style.display = 'flex';
    this.textContextMenu.style.left = `${x}px`;
    this.textContextMenu.style.top = `${y}px`;
    this.adjustMenuPosition(this.textContextMenu);
  }

  showSectionContextMenu(x, y) {
    if (!this.sectionContextMenu) return;
    
    this.sectionContextMenu.style.display = 'flex';
    this.sectionContextMenu.style.left = `${x}px`;
    this.sectionContextMenu.style.top = `${y}px`;
    this.adjustMenuPosition(this.sectionContextMenu);
  }

  adjustMenuPosition(menu) {
    if (!menu) return;
    
    const menuRect = menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (menuRect.right > windowWidth) {
      menu.style.left = `${windowWidth - menuRect.width - 10}px`;
    }

    if (menuRect.bottom > windowHeight) {
      menu.style.top = `${windowHeight - menuRect.height - 10}px`;
    }

    if (menuRect.left < 0) {
      menu.style.left = '10px';
    }
    if (menuRect.top < 0) {
      menu.style.top = '10px';
    }
  }

  hideTextContextMenu() {
    if (!this.textContextMenu) return;
    
    this.textContextMenu.style.display = 'none';
    this.selectedText = '';
    this.currentElement = null;
    this.selectedRange = null;
  }

  hideSectionContextMenu() {
    if (!this.sectionContextMenu) return;
    
    this.sectionContextMenu.style.display = 'none';
    this.currentSection = null;
  }

  handleTextMenuClick(action) {
    switch (action) {
      case 'copy':
        this.copyToClipboard();
        break;
      case 'move':
        this.moveToSection();
        break;
      default:
        console.log('Unknown text action:', action);
    }
    
    this.hideTextContextMenu();
  }

  handleSectionMenuAction(action) {
    switch (action) {
      case 'add':
        this.addNewSection();
        break;
      case 'duplicate':
        this.duplicateSection();
        break;
      case 'delete':
        this.deleteSection();
        break;
      default:
        console.log('Unknown section action:', action);
    }
    
    this.hideSectionContextMenu();
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

  addNewSection() {
    if (!this.currentSection) {
      console.log('No section selected for adding new section');
      this.showFeedback('Error: No section selected');
      return;
    }

    const newSection = document.createElement('div');
    newSection.className = 'second-wrapper';
    newSection.dataset.sectionId = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    newSection.innerHTML = `
      <div class="column-wrapper">
        <div class="lyrics-wrapper">
          <form action="" class="song-section">
            <input name="song_section" class="song-section-name" placeholder="Section">
            <textarea name="lyrics" class="lyrics" placeholder="Type/paste your lyrics here"></textarea>
          </form>
        </div>
        <div class="notes-wrapper">
          <form action="" class="notes-area">
            <textarea name="notes" class="notes" placeholder="Add section notes here"></textarea>
          </form>
        </div>
        <div class="section-options">
          <button class="tripple-dot-menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-three-dots section-menu" viewBox="0 0 16 16">
              <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.currentSection.after(newSection);
    this.initializeSection(newSection);
    this.showFeedback('New section added!');
  }

  moveToSection() {
    if (!this.currentElement || !this.selectedText || !this.selectedRange) {
      console.log('Missing currentElement, selectedText, or selectedRange');
      this.showFeedback('Error: No text selected');
      return;
    }

    const newSection = document.createElement('div');
    newSection.className = 'second-wrapper';
    newSection.dataset.sectionId = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
          <button class="tripple-dot-menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-three-dots section-menu" viewBox="0 0 16 16">
              <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    const songContainer = document.getElementById('song-container');
    songContainer.appendChild(newSection);

    try {
      const originalValue = this.currentElement.value;
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(this.selectedRange);
      if (selection.rangeCount > 0) {
        this.selectedRange.deleteContents();
        console.log('Selected text deleted via range.deleteContents');
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

    this.initializeSection(newSection);
    this.showFeedback('Text moved to new section!');
  }

  duplicateSection() {
    if (!this.currentSection) {
      console.log('No section selected for duplication');
      this.showFeedback('Error: No section selected');
      return;
    }

    const clone = this.currentSection.cloneNode(true);
    clone.dataset.sectionId = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.currentSection.after(clone);
    this.initializeSection(clone);
    this.showFeedback('Section duplicated!');
  }

  deleteSection() {
    if (!this.currentSection) {
      console.log('No section selected for deletion');
      this.showFeedback('Error: No section selected');
      return;
    }

    // Prevent deleting the last section
    const sections = document.querySelectorAll('.second-wrapper');
    if (sections.length <= 1) {
      this.showFeedback('Cannot delete the only section');
      return;
    }

    this.currentSection.remove();
    this.showFeedback('Section deleted!');
  }

  initializeSection(section) {
    // Apply textarea auto-resize
    const textareas = section.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.style.height = 'auto';
      textarea.style.height = (textarea.scrollHeight) + 'px';
      textarea.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.handleTextRightClick(e);
      });
    });

    // Apply input resizing
    const sectionInput = section.querySelector('.song-section-name');
    sectionInput.addEventListener('input', () => resizeInput(sectionInput));
    resizeInput(sectionInput);

    // Add Enter key navigation
    sectionInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const lyricsTextarea = section.querySelector('.lyrics');
        if (lyricsTextarea) lyricsTextarea.focus();
      }
    });

    // Add drag-and-drop support
    section.draggable = true;
    section.addEventListener('dragstart', handleDragStart);
    section.addEventListener('dragover', handleDragOver);
    section.addEventListener('drop', handleDrop);
    section.addEventListener('dragend', handleDragEnd);
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