// Notes Management App
// Main application object
const NotesApp = {
    // DOM Elements
    elements: {
        noteInput: null,
        addNoteBtn: null,
        notesContainer: null,
        notesCount: null,
        errorMessage: null,
        errorText: null,
        clearAllBtn: null,
        searchInput: null,
        searchBtn: null,
        charCount: null,
        editCharCount: null,
        // Modal elements
        editModal: null,
        editNoteInput: null,
        closeModalBtn: null,
        cancelEditBtn: null,
        saveEditBtn: null,
        // Confirm modal elements
        confirmModal: null,
        confirmMessage: null,
        cancelConfirmBtn: null,
        confirmActionBtn: null
    },
    
    // App state
    state: {
        notes: [],
        currentEditIndex: null,
        currentDeleteIndex: null,
        isDeletingAll: false
    },
    
    // Initialize the app
    init: function() {
        this.cacheElements();
        this.bindEvents();
        this.loadNotes();
        this.updateUI();
    },
    
    // Cache DOM elements
    cacheElements: function() {
        this.elements.noteInput = document.getElementById('noteInput');
        this.elements.addNoteBtn = document.getElementById('addNoteBtn');
        this.elements.notesContainer = document.getElementById('notesContainer');
        this.elements.notesCount = document.getElementById('notesCount');
        this.elements.errorMessage = document.getElementById('errorMessage');
        this.elements.errorText = document.getElementById('errorText');
        this.elements.clearAllBtn = document.getElementById('clearAllBtn');
        this.elements.searchInput = document.getElementById('searchInput');
        this.elements.searchBtn = document.getElementById('searchBtn');
        this.elements.charCount = document.getElementById('charCount');
        
        // Modal elements
        this.elements.editModal = document.getElementById('editModal');
        this.elements.editNoteInput = document.getElementById('editNoteInput');
        this.elements.closeModalBtn = document.getElementById('closeModalBtn');
        this.elements.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.elements.saveEditBtn = document.getElementById('saveEditBtn');
        this.elements.editCharCount = document.getElementById('editCharCount');
        
        // Confirm modal elements
        this.elements.confirmModal = document.getElementById('confirmModal');
        this.elements.confirmMessage = document.getElementById('confirmMessage');
        this.elements.cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
        this.elements.confirmActionBtn = document.getElementById('confirmActionBtn');
    },
    
    // Bind event listeners
    bindEvents: function() {
        // Add note button
        this.elements.addNoteBtn.addEventListener('click', () => this.addNote());
        
        // Enter key in note input
        this.elements.noteInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.addNote();
            }
        });
        
        // Clear all notes button
        this.elements.clearAllBtn.addEventListener('click', () => this.confirmClearAll());
        
        // Search functionality
        this.elements.searchInput.addEventListener('input', () => this.filterNotes());
        this.elements.searchBtn.addEventListener('click', () => this.filterNotes());
        
        // Character count for note input
        this.elements.noteInput.addEventListener('input', () => {
            this.elements.charCount.textContent = this.elements.noteInput.value.length;
        });
        
        // Character count for edit note input
        this.elements.editNoteInput.addEventListener('input', () => {
            this.elements.editCharCount.textContent = this.elements.editNoteInput.value.length;
        });
        
        // Modal events
        this.elements.closeModalBtn.addEventListener('click', () => this.closeEditModal());
        this.elements.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        this.elements.saveEditBtn.addEventListener('click', () => this.saveEditedNote());
        
        // Confirm modal events
        this.elements.cancelConfirmBtn.addEventListener('click', () => this.closeConfirmModal());
        this.elements.confirmActionBtn.addEventListener('click', () => this.executeConfirmedAction());
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.editModal) {
                this.closeEditModal();
            }
            if (e.target === this.elements.confirmModal) {
                this.closeConfirmModal();
            }
        });
        
        // Load sample notes on first run
        if (localStorage.getItem('notesFirstRun') === null) {
            this.loadSampleNotes();
            localStorage.setItem('notesFirstRun', 'done');
        }
    },
    
    // Add a new note
    addNote: function() {
        const noteContent = this.elements.noteInput.value.trim();
        
        // Error handling for empty note
        if (noteContent === '') {
            this.showError('Note cannot be empty!');
            return;
        }
        
        // Create note object
        const newNote = {
            id: Date.now(),
            content: noteContent,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        // Add to notes array
        this.state.notes.unshift(newNote);
        
        // Clear input
        this.elements.noteInput.value = '';
        this.elements.charCount.textContent = '0';
        
        // Hide error message if shown
        this.hideError();
        
        // Save and update UI
        this.saveNotes();
        this.updateUI();
        
        // Show success feedback
        this.showSuccessFeedback('Note added successfully!');
    },
    
    // Show error message
    showError: function(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
        
        // Add shake animation
        this.elements.errorMessage.style.animation = 'none';
        setTimeout(() => {
            this.elements.errorMessage.style.animation = 'fadeIn 0.3s, shake 0.5s';
        }, 10);
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    },
    
    // Hide error message
    hideError: function() {
        this.elements.errorMessage.classList.add('hidden');
    },
    
    // Delete a note
    deleteNote: function(index) {
        // Remove note from array
        this.state.notes.splice(index, 1);
        
        // Save and update UI
        this.saveNotes();
        this.updateUI();
        
        // Show feedback
        this.showSuccessFeedback('Note deleted successfully!');
    },
    
    // Confirm deletion of a note or clearing all notes
    confirmDeleteNote: function(index) {
        this.state.currentDeleteIndex = index;
        this.state.isDeletingAll = false;
        this.elements.confirmMessage.textContent = 'Are you sure you want to delete this note?';
        this.elements.confirmModal.classList.remove('hidden');
    },
    
    confirmClearAll: function() {
        if (this.state.notes.length === 0) {
            this.showError('No notes to clear!');
            return;
        }
        
        this.state.isDeletingAll = true;
        this.elements.confirmMessage.textContent = `Are you sure you want to delete all ${this.state.notes.length} notes? This action cannot be undone.`;
        this.elements.confirmModal.classList.remove('hidden');
    },
    
    // Execute the confirmed action (delete note or clear all)
    executeConfirmedAction: function() {
        if (this.state.isDeletingAll) {
            // Clear all notes
            this.state.notes = [];
            this.saveNotes();
            this.updateUI();
            this.showSuccessFeedback('All notes cleared successfully!');
        } else {
            // Delete specific note
            this.deleteNote(this.state.currentDeleteIndex);
        }
        
        this.closeConfirmModal();
    },
    
    // Close confirm modal
    closeConfirmModal: function() {
        this.elements.confirmModal.classList.add('hidden');
        this.state.currentDeleteIndex = null;
        this.state.isDeletingAll = false;
    },
    
    // Open edit modal
    openEditModal: function(index) {
        this.state.currentEditIndex = index;
        this.elements.editNoteInput.value = this.state.notes[index].content;
        this.elements.editCharCount.textContent = this.state.notes[index].content.length;
        this.elements.editModal.classList.remove('hidden');
        
        // Focus on textarea
        setTimeout(() => {
            this.elements.editNoteInput.focus();
        }, 100);
    },
    
    // Close edit modal
    closeEditModal: function() {
        this.elements.editModal.classList.add('hidden');
        this.state.currentEditIndex = null;
    },
    
    // Save edited note
    saveEditedNote: function() {
        const editedContent = this.elements.editNoteInput.value.trim();
        
        // Error handling for empty note
        if (editedContent === '') {
            this.showError('Note cannot be empty!');
            this.closeEditModal();
            return;
        }
        
        // Update note content
        this.state.notes[this.state.currentEditIndex].content = editedContent;
        this.state.notes[this.state.currentEditIndex].date = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' (edited)';
        
        // Save and update UI
        this.saveNotes();
        this.updateUI();
        this.closeEditModal();
        
        // Show feedback
        this.showSuccessFeedback('Note updated successfully!');
    },
    
    // Filter notes based on search input
    filterNotes: function() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        const noteCards = document.querySelectorAll('.note-card');
        
        noteCards.forEach(card => {
            const content = card.querySelector('.note-content').textContent.toLowerCase();
            if (content.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    },
    
    // Show success feedback
    showSuccessFeedback: function(message) {
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = 'success-feedback';
        feedback.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        // Style the feedback
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #2ecc71;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease;
        `;
        
        // Add to document
        document.body.appendChild(feedback);
        
        // Remove after 3 seconds
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 3000);
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    },
    
    // Create a note card element
    createNoteCard: function(note, index) {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.dataset.index = index;
        
        // Add random border color for visual variety
        const colors = ['#3498db', '#2ecc71', '#9b59b6', '#e67e22', '#e74c3c', '#1abc9c'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        noteCard.style.borderLeftColor = color;
        
        noteCard.innerHTML = `
            <div class="note-content">${this.escapeHtml(note.content)}</div>
            <div class="note-footer">
                <div class="note-date">${note.date}</div>
                <div class="note-actions">
                    <button class="action-btn edit-btn" title="Edit note">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete note">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        const editBtn = noteCard.querySelector('.edit-btn');
        const deleteBtn = noteCard.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditModal(index);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.confirmDeleteNote(index);
        });
        
        return noteCard;
    },
    
    // Update the UI with current notes
    updateUI: function() {
        // Update notes count
        this.elements.notesCount.textContent = this.state.notes.length;
        
        // Clear notes container
        this.elements.notesContainer.innerHTML = '';
        
        // Show empty state if no notes
        if (this.state.notes.length === 0) {
            this.elements.notesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard"></i>
                    <h3>No notes yet</h3>
                    <p>Start by creating your first note above!</p>
                </div>
            `;
            return;
        }
        
        // Create and append note cards
        this.state.notes.forEach((note, index) => {
            const noteCard = this.createNoteCard(note, index);
            this.elements.notesContainer.appendChild(noteCard);
        });
    },
    
    // Load notes from localStorage
    loadNotes: function() {
        const savedNotes = localStorage.getItem('notesAppData');
        if (savedNotes) {
            this.state.notes = JSON.parse(savedNotes);
        }
    },
    
    // Save notes to localStorage
    saveNotes: function() {
        localStorage.setItem('notesAppData', JSON.stringify(this.state.notes));
    },
    
    // Load sample notes for first-time users
    loadSampleNotes: function() {
        this.state.notes = [
            {
                id: 1,
                content: 'Welcome to Notes Manager! This is your first note. You can edit or delete it.',
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            },
            {
                id: 2,
                content: 'Try creating a new note using the text area on the left. You can also search through your notes using the search bar above.',
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            },
            {
                id: 3,
                content: 'All notes are automatically saved in your browser\'s local storage, so they will persist even if you close the browser.',
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            }
        ];
        this.saveNotes();
    },
    
    // Escape HTML to prevent XSS
    escapeHtml: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    NotesApp.init();
});