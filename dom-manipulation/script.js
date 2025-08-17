document.addEventListener('DOMContentLoaded', () => {
    const quotesContainer = document.getElementById('quotesContainer');
    const categoryFilter = document.getElementById('categoryFilter');
    const quotesHeader = document.getElementById('quotesHeader');
    
    // Edit Modal Elements
    const editModal = document.getElementById('editModal');
    const closeButton = document.querySelector('.close-button');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const editText = document.getElementById('editText');
    const editCategory = document.getElementById('editCategory');

    // Header Buttons
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const randomQuoteBtn = document.getElementById('randomQuoteBtn');

    let allQuotes = [];
    let editIndex = -1;

    function loadQuotes() {
        const storedQuotes = localStorage.getItem('quotes');
        allQuotes = storedQuotes ? JSON.parse(storedQuotes) : [
            { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" }
        ];
    }

    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(allQuotes));
    }

    function rerenderQuotes() {
        saveQuotes();
        loadQuotes();
        populateCategoryFilter();
        handleFilterChange();
    }

    function displayQuotes(quotesToDisplay) {
        quotesContainer.innerHTML = ''; // Clear existing quotes
        if (!quotesToDisplay || quotesToDisplay.length === 0) {
            quotesContainer.innerHTML = '<p>No quotes found for this category.</p>';
            return;
        }

        quotesToDisplay.forEach(quote => {
            const mainIndex = allQuotes.findIndex(q => q.text === quote.text && q.category === quote.category);
            const quoteCard = document.createElement('div');
            quoteCard.className = 'quote-card';
            quoteCard.dataset.index = mainIndex;
            quoteCard.innerHTML = `
                <p class="quote-text">"${quote.text}"</p>
                <p class="quote-category">${quote.category}</p>
                <div class="quote-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            quotesContainer.appendChild(quoteCard);
        });
    }

    function populateCategoryFilter() {
        const selectedValue = categoryFilter.value;
        if (allQuotes.length === 0) {
            categoryFilter.innerHTML = '<option value="all">No Categories</option>';
            return;
        }
        const categories = ['All', ...new Set(allQuotes.map(q => q.category))];
        categoryFilter.innerHTML = categories.map(category => 
            `<option value="${category}" ${category === selectedValue ? 'selected' : ''}>${category}</option>`
        ).join('');
    }

    function handleFilterChange() {
        const selectedCategory = categoryFilter.value;
        quotesHeader.textContent = selectedCategory === 'All' ? "All Quotes" : `Quotes in "${selectedCategory}"`;
        const quotesToDisplay = selectedCategory === 'All' ? allQuotes : allQuotes.filter(quote => quote.category === selectedCategory);
        displayQuotes(quotesToDisplay);
    }

    function handleQuoteActions(event) {
        const target = event.target;
        const quoteCard = target.closest('.quote-card');
        if (!quoteCard) return;

        const index = parseInt(quoteCard.dataset.index, 10);
        if (target.classList.contains('delete-btn')) {
            deleteQuote(index);
        } else if (target.classList.contains('edit-btn')) {
            openEditModal(index);
        }
    }

    function deleteQuote(index) {
        if (confirm('Are you sure you want to delete this quote?')) {
            allQuotes.splice(index, 1);
            rerenderQuotes();
        }
    }

    function openEditModal(index) {
        editIndex = index;
        const quote = allQuotes[index];
        editText.value = quote.text;
        editCategory.value = quote.category;
        editModal.style.display = 'flex';
    }

    function closeEditModal() {
        editModal.style.display = 'none';
    }

    function saveEditedQuote() {
        if (editIndex === -1) return;
        const newText = editText.value.trim();
        const newCategory = editCategory.value.trim();
        if (!newText || !newCategory) {
            alert('Please fill in both fields.');
            return;
        }
        allQuotes[editIndex] = { text: newText, category: newCategory };
        closeEditModal();
        rerenderQuotes();
    }

    function createAddQuoteForm() {
        let addModal = document.getElementById('addModal');
        if (addModal) {
            addModal.style.display = 'flex';
            return;
        }

        addModal = document.createElement('div');
        addModal.id = 'addModal';
        addModal.className = 'modal-overlay';
        
        addModal.innerHTML = `
            <div class="modal-content">
                <span class="close-add-button">&times;</span>
                <h2>Add a New Quote</h2>
                <div class="form-group">
                    <label for="newQuoteText">Quote Text:</label>
                    <textarea id="newQuoteText" rows="4" placeholder="Enter the quote..."></textarea>
                </div>
                <div class="form-group">
                    <label for="newQuoteCategory">Category:</label>
                    <input type="text" id="newQuoteCategory" placeholder="e.g., Wisdom, Humor, etc.">
                </div>
                <button id="saveQuoteBtn">Save Quote</button>
            </div>
        `;
        
        document.body.appendChild(addModal);
        addModal.style.display = 'flex';

        document.querySelector('.close-add-button').addEventListener('click', () => {
            addModal.style.display = 'none';
        });

        document.getElementById('saveQuoteBtn').addEventListener('click', addQuote);
    }

    function addQuote() {
        const newQuoteText = document.getElementById('newQuoteText');
        const newQuoteCategory = document.getElementById('newQuoteCategory');
        const text = newQuoteText.value.trim();
        const category = newQuoteCategory.value.trim();

        if (!text || !category) {
            alert('Please fill in both the quote text and the category.');
            return;
        }
        if (allQuotes.some(q => q.text.toLowerCase() === text.toLowerCase())) {
            alert('This quote already exists!');
            return;
        }
        allQuotes.push({ text, category });
        document.getElementById('addModal').style.display = 'none';
        rerenderQuotes();
    }

    function showRandomQuote() {
        if (allQuotes.length === 0) {
            quotesContainer.innerHTML = '<p>No quotes available to display.</p>';
            return;
        }
        const randomIndex = Math.floor(Math.random() * allQuotes.length);
        const randomQuote = allQuotes[randomIndex];
        quotesHeader.textContent = "Random Quote";
        categoryFilter.value = "All";
        displayQuotes([randomQuote]);
    }

    function initialize() {
        loadQuotes();
        populateCategoryFilter();
        displayQuotes(allQuotes);
        
        categoryFilter.addEventListener('change', handleFilterChange);
        quotesContainer.addEventListener('click', handleQuoteActions);
        
        closeButton.addEventListener('click', closeEditModal);
        saveEditBtn.addEventListener('click', saveEditedQuote);
        addQuoteBtn.addEventListener('click', createAddQuoteForm);
        randomQuoteBtn.addEventListener('click', showRandomQuote);
    }

    initialize();
});