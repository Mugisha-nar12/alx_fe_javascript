document.addEventListener('DOMContentLoaded', () => {
    const quotesContainer = document.getElementById('quotesContainer');
    const categoryFilter = document.getElementById('categoryFilter');
    const quotesHeader = document.getElementById('quotesHeader');
    const editModal = document.getElementById('editModal');
    const closeButton = document.querySelector('.close-button');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const editText = document.getElementById('editText');
    const editCategory = document.getElementById('editCategory');

    let allQuotes = [];
    let editIndex = -1; // To keep track of the quote being edited

    // Load quotes from Local Storage
    function loadQuotes() {
        const storedQuotes = localStorage.getItem('quotes');
        allQuotes = storedQuotes ? JSON.parse(storedQuotes) : [
            { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" }
        ];
    }

    // Save quotes to Local Storage
    function saveQuotes() {
        localStorage.setItem('quotes', JSON.stringify(allQuotes));
    }

    // Display quotes in the DOM
    function displayQuotes(quotesToDisplay) {
        if (!quotesToDisplay || quotesToDisplay.length === 0) {
            quotesContainer.innerHTML = '<p>No quotes found for this category. <a href="add.html">Add one!</a></p>';
            return;
        }

        quotesContainer.innerHTML = quotesToDisplay.map((quote, index) => `
            <div class="quote-card" data-index="${index}">
                <p class="quote-text">"${quote.text}"</p>
                <p class="quote-category">${quote.category}</p>
                <div class="quote-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Populate the category filter dropdown
    function populateCategoryFilter() {
        if (allQuotes.length === 0) {
            categoryFilter.innerHTML = '<option value="all">No Categories</option>';
            return;
        }
        
        const categories = ['All', ...new Set(allQuotes.map(q => q.category))];
        
        categoryFilter.innerHTML = categories.map(category => 
            `<option value="${category}">${category}</option>`
        ).join('');
    }

    // Filter quotes when the dropdown selection changes
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

    // Handle clicks inside the quotes container (for edit/delete)
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

    // Delete a quote
    function deleteQuote(index) {
        if (confirm('Are you sure you want to delete this quote?')) {
            const quoteToDelete = allQuotes[index];
            // Find the actual index in the main allQuotes array if it's a filtered view
            const mainIndex = allQuotes.findIndex(q => q.text === quoteToDelete.text && q.category === quoteToDelete.category);
            if (mainIndex > -1) {
                allQuotes.splice(mainIndex, 1);
                saveQuotes();
                initialize(); // Re-initialize to update view
            }
        }
    }

    // Open the edit modal
    function openEditModal(index) {
        const quoteToEdit = allQuotes[index];
        // Find the actual index in the main allQuotes array
        const mainIndex = allQuotes.findIndex(q => q.text === quoteToEdit.text && q.category === quoteToEdit.category);
        
        editIndex = mainIndex;
        const quote = allQuotes[mainIndex];
        editText.value = quote.text;
        editCategory.value = quote.category;
        editModal.style.display = 'flex';
    }

    // Close the edit modal
    function closeEditModal() {
        editModal.style.display = 'none';
    }

    // Save the edited quote
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
        initialize(); // Re-initialize to update view
    }

    // Initial setup function
    function initialize() {
        loadQuotes();
        populateCategoryFilter();
        displayQuotes(allQuotes); // Show all quotes by default
        
        // Add event listener to the dropdown
        categoryFilter.addEventListener('change', handleFilterChange);
        quotesContainer.addEventListener('click', handleQuoteActions);
        closeButton.addEventListener('click', closeEditModal);
        saveEditBtn.addEventListener('click', saveEditedQuote);
    }

    // Run the app
    initialize();
});