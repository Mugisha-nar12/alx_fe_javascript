document.addEventListener('DOMContentLoaded', () => {
    const saveQuoteBtn = document.getElementById('saveQuoteBtn');
    const newQuoteText = document.getElementById('newQuoteText');
    const newQuoteCategory = document.getElementById('newQuoteCategory');
    const successMessage = document.getElementById('successMessage');

    saveQuoteBtn.addEventListener('click', () => {
        const text = newQuoteText.value.trim();
        const category = newQuoteCategory.value.trim();

        if (!text || !category) {
            alert('Please fill in both the quote text and the category.');
            return;
        }

        // Load existing quotes from storage, or initialize an empty array
        const storedQuotes = localStorage.getItem('quotes');
        const quotes = storedQuotes ? JSON.parse(storedQuotes) : [];
        
        // Check for duplicates (case-insensitive)
        if (quotes.some(q => q.text.toLowerCase() === text.toLowerCase())) {
            alert('This quote already exists!');
            return;
        }

        // Add the new quote
        quotes.push({ text, category });

        // Save the updated array back to Local Storage
        localStorage.setItem('quotes', JSON.stringify(quotes));

        // Show success message and clear fields
        successMessage.textContent = 'Quote saved successfully!';
        newQuoteText.value = '';
        newQuoteCategory.value = '';

        // Hide the message after a few seconds
        setTimeout(() => {
            successMessage.textContent = '';
        }, 3000);
    });
});

