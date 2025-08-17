document.addEventListener('DOMContentLoaded', () => {
    const quotesContainer = document.getElementById('quotesContainer');
    const categoryFilter = document.getElementById('categoryFilter');
    const quotesHeader = document.getElementById('quotesHeader');
    
    // Modals
    const editModal = document.getElementById('editModal');
    const addModal = document.getElementById('addModal');

    // Buttons
    const closeButton = document.querySelector('.close-button');
    const closeAddButton = document.querySelector('.close-add-button');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const saveQuoteBtn = document.getElementById('saveQuoteBtn');
    const randomQuoteBtn = document.getElementById('randomQuoteBtn');

    // Form Fields
    const editText = document.getElementById('editText');
    const editCategory = document.getElementById('editCategory');
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');

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

    function displayQuotes(quotesToDisplay) {
        if (!quotesToDisplay || quotesToDisplay.length === 0) {
            quotesContainer.innerHTML = '<p>No quotes found. <a href="#" id="addQuoteLink">Add one!</a></p>';
            document.getElementById('addQuoteLink')?.addEventListener('click', (e) => {
                e.preventDefault();
                openAddModal();
            });
            return;
        }

        quotesContainer.innerHTML = quotesToDisplay.map(quote => {
            const mainIndex = allQuotes.findIndex(q => q.text === quote.text && q.category === quote.category);
            return `
            <div class="quote-card" data-index="${mainIndex}">
                <p class="quote-text">"${quote.text}"</p>
                <p class="quote-category">${quote.category}</p>
                <div class="quote-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>`;
        }).join('');
    }

    function populateCategoryFilter() {
        if (allQuotes.length === 0) {
            categoryFilter.innerHTML = '<option value="all">No Categories</option>';
            return;
        }
        const categories = ['All', ...new Set(allQuotes.map(q => q.category))];
        categoryFilter.innerHTML = categories.map(category => `<option value="${category}">${category}</option>`).join('');
    }

    function handleFilterChange() {
        const selectedCategory = categoryFilter.value;
        if (selectedCategory === 'All') {
            displayQuotes(allQuotes);
            quotesHeader.textContent = "All Quotes";
        } else {
            const filtered = allQuotes.filter(quote => quote.category === selectedCategory);
            displayQuotes(filtered);
            quotesHeader.textContent = `Quotes in "${selectedCategory}"`;
        }
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
            saveQuotes();
            initialize();
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
        saveQuotes();
        closeEditModal();
        initialize();
    }

    function openAddModal() {
        addModal.style.display = 'flex';
    }

    function closeAddModal() {
        addModal.style.display = 'none';
    }

    function addQuote() {
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
        saveQuotes();
        newQuoteText.value = '';
        newQuoteCategory.value = '';
        closeAddModal();
        initialize();
    }

    function showRandomQuote() {
        if (allQuotes.length === 0) {
            quotesContainer.innerHTML = '<p>No quotes available to display.</p>';
            return;
        }
        const randomIndex = Math.floor(Math.random() * allQuotes.length);
        const randomQuote = allQuotes[randomIndex];
        quotesHeader.textContent = "Random Quote";
        displayQuotes([randomQuote]);
    }

    function initialize() {
        loadQuotes();
        populateCategoryFilter();
        displayQuotes(allQuotes);
        
        categoryFilter.addEventListener('change', handleFilterChange);
        quotesContainer.addEventListener('click', handleQuoteActions);
        
        // Edit Modal Listeners
        closeButton.addEventListener('click', closeEditModal);
        saveEditBtn.addEventListener('click', saveEditedQuote);

        // Add Modal Listeners
        addQuoteBtn.addEventListener('click', openAddModal);
        closeAddButton.addEventListener('click', closeAddModal);
        saveQuoteBtn.addEventListener('click', addQuote);

        // Random Quote Listener
        randomQuoteBtn.addEventListener('click', showRandomQuote);
    }

    initialize();
});