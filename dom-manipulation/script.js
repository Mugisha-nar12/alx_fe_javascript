document.addEventListener('DOMContentLoaded', () => {
    const quoteDisplay = document.getElementById('quotesContainer');
    const categoryFilter = document.getElementById('categoryFilter');
    const quotesHeader = document.getElementById('quotesHeader');
    const notification = document.getElementById('notification');
    
    // Edit Modal Elements
    const editModal = document.getElementById('editModal');
    const closeButton = document.querySelector('.close-button');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const editText = document.getElementById('editText');
    const editCategory = document.getElementById('editCategory');

    // Header Buttons
    const addQuoteBtn = document.getElementById('addQuoteBtn');
    const randomQuoteBtn = document.getElementById('randomQuoteBtn');

    // Import/Export Buttons
    const exportQuotesBtn = document.getElementById('exportQuotesBtn');
    const importFile = document.getElementById('importFile');

    let allQuotes = [];
    let editIndex = -1;
    const serverUrl = 'https://jsonplaceholder.typicode.com/posts'; // Mock API endpoint

    async function fetchQuotesFromServer() {
        try {
            const response = await fetch(serverUrl);
            const serverQuotes = await response.json();
            // Remap server data to our quote format
            return serverQuotes.slice(0, 5).map(post => ({ text: post.title, category: 'Server' }));
        } catch (error) {
            console.error('Error fetching quotes from server:', error);
            return [];
        }
    }

    async function postQuoteToServer(quote) {
        try {
            const response = await fetch(serverUrl, {
                method: 'POST',
                body: JSON.stringify({
                    title: quote.text,
                    body: quote.category,
                    userId: 1,
                }),
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                },
            });
            const newPost = await response.json();
            console.log('Posted to server:', newPost);
            return { text: newPost.title, category: 'Server' };
        } catch (error) {
            console.error('Error posting quote to server:', error);
            return null;
        }
    }

    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    async function syncQuotes() {
        showNotification('Syncing with server...');
        const serverQuotes = await fetchQuotesFromServer();
        const localQuotes = allQuotes;

        // Simple conflict resolution: server data overwrites local data for simplicity
        // A more robust solution would involve proper merging and conflict handling
        if (serverQuotes.length > 0) {
            const serverTexts = serverQuotes.map(q => q.text);
            const newLocalQuotes = localQuotes.filter(q => !serverTexts.includes(q.text));
            
            const updatedQuotes = [...newLocalQuotes, ...serverQuotes];
            if (JSON.stringify(allQuotes) !== JSON.stringify(updatedQuotes)) {
                allQuotes = updatedQuotes;
                rerenderQuotes();
                showNotification('Quotes synced with the server.');
            } else {
                showNotification('Quotes are up to date.');
            }
        }
    }

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
        populateCategories();
        filterQuote();
    }

    function displayQuotes(quotesToDisplay) {
        quoteDisplay.innerHTML = ''; // Clear existing quotes
        if (!quotesToDisplay || quotesToDisplay.length === 0) {
            quoteDisplay.innerHTML = '<p>No quotes found for this category.</p>';
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
            quoteDisplay.appendChild(quoteCard);
        });
    }

    function populateCategories() {
        const selectedValue = categoryFilter.value;
        if (allQuotes.length === 0) {
            categoryFilter.innerHTML = '<option value="All">No Categories</option>';
            return;
        }
        const categories = ['All', ...new Set(allQuotes.map(q => q.category))];
        categoryFilter.innerHTML = categories.map(category => 
            `<option value="${category}" ${category === selectedValue ? 'selected' : ''}>${category}</option>`
        ).join('');
    }

    function filterQuote() {
        const selectedCategory = categoryFilter.value;
        localStorage.setItem('selectedCategory', selectedCategory); // Save selection
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
        const updatedQuote = { text: newText, category: newCategory };
        allQuotes[editIndex] = updatedQuote;
        postQuoteToServer(updatedQuote); // Post update to server
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

    async function addQuote() {
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
        const newQuote = { text, category };
        allQuotes.push(newQuote);
        await postQuoteToServer(newQuote); // Post new quote to server
        document.getElementById('addModal').style.display = 'none';
        rerenderQuotes();
    }

    function showRandomQuote() {
        if (allQuotes.length === 0) {
            quoteDisplay.innerHTML = '<p>No quotes available to display.</p>';
            return;
        }
        const randomIndex = Math.floor(Math.random() * allQuotes.length);
        const randomQuote = allQuotes[randomIndex];
        quotesHeader.textContent = "Random Quote";
        categoryFilter.value = "All";
        displayQuotes([randomQuote]);
    }

    function exportToJsonFile() {
        const dataStr = JSON.stringify(allQuotes, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'quotes.json';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    }

    function importFromJsonFile(event) {
        const fileReader = new FileReader();
        fileReader.onload = function(e) {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                if (Array.isArray(importedQuotes) && importedQuotes.every(q => q.text && q.category)) {
                    const combinedQuotes = [...allQuotes, ...importedQuotes];
                    const uniqueQuotes = combinedQuotes.filter((quote, index, self) =>
                        index === self.findIndex((t) => (
                            t.text.toLowerCase() === quote.text.toLowerCase() && t.category.toLowerCase() === quote.category.toLowerCase()
                        ))
                    );
                    allQuotes = uniqueQuotes;
                    rerenderQuotes();
                    alert('Quotes imported successfully!');
                } else {
                    alert('Invalid JSON file format.');
                }
            } catch (error) {
                alert('Error reading or parsing JSON file.');
                console.error(error);
            }
        };
        if (event.target.files[0]) {
            fileReader.readAsText(event.target.files[0]);
        }
    }

    function initialize() {
        loadQuotes();
        populateCategories();
        
        const lastSelectedCategory = localStorage.getItem('selectedCategory');
        if (lastSelectedCategory) {
            categoryFilter.value = lastSelectedCategory;
        }
        
        filterQuote();
        
        categoryFilter.addEventListener('change', filterQuote);
        quoteDisplay.addEventListener('click', handleQuoteActions);
        
        closeButton.addEventListener('click', closeEditModal);
        saveEditBtn.addEventListener('click', saveEditedQuote);
        addQuoteBtn.addEventListener('click', createAddQuoteForm);
        randomQuoteBtn.addEventListener('click', showRandomQuote);
        exportQuotesBtn.addEventListener('click', exportToJsonFile);
        importFile.addEventListener('change', importFromJsonFile);

        // Initial sync and periodic syncing
        syncQuotes();
        setInterval(syncQuotes, 60000); // Sync every 60 seconds
    }

    initialize();
});