document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('main section');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchResults = document.getElementById('search-results');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const currentPageSpan = document.getElementById('current-page');
    const recommendationsResults = document.getElementById('recommendations-results');
    const genreBtns = document.querySelectorAll('.genre-btn');
    const exploreBtn = document.getElementById('explore-btn');
    const plannerSearch = document.getElementById('planner-search');
    const plannerSearchResults = document.getElementById('planner-search-results');
    const selectedBook = document.getElementById('selected-book');
    const addToPlanBtn = document.getElementById('add-to-plan');
    const plannedBooks = document.getElementById('planned-books');
    const bookModal = document.getElementById('book-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalBookDetails = document.getElementById('modal-book-details');
    
    // App State
    let currentPage = 1;
    let currentQuery = '';
    let currentGenre = 'all';
    let plannedBooksList = JSON.parse(localStorage.getItem('plannedBooks')) || [];
    
    // Initialize the app
    init();
    
    function init() {
        // Set up event listeners
        setupEventListeners();
        
        // Load planned books from localStorage
        renderPlannedBooks();
        
        // Load recommendations
        loadRecommendations();
    }
    
    function setupEventListeners() {
        // Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                showSection(sectionId);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Search functionality
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
        
        // Pagination
        prevPageBtn.addEventListener('click', goToPrevPage);
        nextPageBtn.addEventListener('click', goToNextPage);
        
        // Recommendations
        genreBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                genreBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentGenre = this.getAttribute('data-genre');
                console.log('Selected genre:', currentGenre); // Debug log
                loadRecommendations();
            });
        });
        
        // Explore button
        exploreBtn.addEventListener('click', function() {
            showSection('search');
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelector('nav ul li a[data-section="search"]').classList.add('active');
        });
        
        // Planner search
        plannerSearch.addEventListener('input', debounce(handlePlannerSearch, 300));
        
        // Add to plan
        addToPlanBtn.addEventListener('click', addBookToPlan);
        
        // Modal
        closeModal.addEventListener('click', () => {
            bookModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === bookModal) {
                bookModal.style.display = 'none';
            }
        });
    }
    
    function showSection(sectionId) {
        sections.forEach(section => {
            section.classList.remove('active-section');
            if (section.id === `${sectionId}-section`) {
                section.classList.add('active-section');
            }
        });
    }
    
    // Search Functions
    function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return;
        
        currentQuery = query;
        currentPage = 1;
        fetchBooks(query, currentPage);
    }
    
    async function fetchBooks(query, page) {
        try {
            const limit = document.getElementById('results-per-page').value;
            const response = await fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.docs && data.docs.length > 0) {
                renderBooks(data.docs, searchResults);
                updatePagination(data.numFound, page);
            } else {
                searchResults.innerHTML = '<p class="no-results">No books found. Try a different search term.</p>';
                prevPageBtn.disabled = true;
                nextPageBtn.disabled = true;
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            searchResults.innerHTML = `<p class="error">Failed to fetch books: ${error.message}</p>`;
        }
    }
    
    function renderBooks(books, container) {
        container.innerHTML = '';
        
        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            
            // Unified coverId logic
            const coverId = book.cover_i || (book.covers && book.covers[0]); // Handle both APIs
            const title = book.title || 'Untitled';
            const author = book.author_name ? book.author_name.join(', ') : 'Unknown Author';
            const firstPublishYear = book.first_publish_year || 'Unknown';
            const key = book.key.replace('/works/', '');
            
            // Ensure every book has an image
            const coverImageUrl = coverId 
                ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` 
                : 'https://via.placeholder.com/128x193?text=No+Cover';

            bookCard.innerHTML = `
                <div class="book-cover">
                    <img src="${coverImageUrl}" alt="${title}">
                </div>
                <div class="book-info">
                    <h3>${title}</h3>
                    <p class="author">${author}</p>
                    <p>First published: ${firstPublishYear}</p>
                    <div class="book-actions">
                        <button class="details-btn" data-id="${key}">Details</button>
                        <button class="add-to-plan" data-id="${key}" data-title="${title}" data-author="${author}">Add to Plan</button>
                    </div>
                </div>
            `;
            
            container.appendChild(bookCard);
        });
        
        // Add event listeners to the new buttons
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const bookId = this.getAttribute('data-id');
                showBookDetails(bookId);
            });
        });
        
        document.querySelectorAll('.add-to-plan').forEach(btn => {
            btn.addEventListener('click', function() {
                const bookId = this.getAttribute('data-id');
                const title = this.getAttribute('data-title');
                const author = this.getAttribute('data-author');
                showSelectedBook(bookId, title, author);
            });
        });
    }
    
    function updatePagination(totalResults, currentPage) {
        const limit = parseInt(document.getElementById('results-per-page').value);
        const totalPages = Math.ceil(totalResults / limit);
        
        currentPageSpan.textContent = currentPage;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            fetchBooks(currentQuery, currentPage);
        }
    }
    
    function goToNextPage() {
        currentPage++;
        fetchBooks(currentQuery, currentPage);
    }
    
    // Book Details Functions
    async function showBookDetails(bookId) {
        try {
            console.log('Fetching details for book ID:', bookId); // Debug log

            // Verify the API endpoint
            const response = await fetch(`http://localhost:3000/api/book/${bookId}`); // Ensure the base URL is correct

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const book = await response.json();
            console.log('Book details API response:', book); // Debug log

            modalBookDetails.innerHTML = `
                <div class="modal-book-cover">
                    ${book.covers && book.covers.length > 0 ? 
                        `<img src="https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg" alt="${book.title}">` : 
                        `<div class="placeholder"><i class="fas fa-book-open"></i></div>`
                    }
                </div>
                <div class="modal-book-info">
                    <h2>${book.title || 'Untitled'}</h2>
                    ${book.authors && book.authors.length > 0 ? 
                        `<span class="author">By ${book.authors.map(a => a.name).join(', ')}</span>` : 
                        '<span class="author">Unknown Author</span>'
                    }
                    <p class="description">${book.description ? 
                        (typeof book.description === 'string' ? book.description : 
                         book.description.value || 'No description available') : 
                        'No description available'
                    }</p>
                    <div class="book-meta">
                        <div class="meta-item">
                            <h4>First Published</h4>
                            <p>${book.first_publish_date || 'Unknown'}</p>
                        </div>
                        <div class="meta-item">
                            <h4>Subjects</h4>
                            <p>${book.subjects ? book.subjects.slice(0, 3).join(', ') : 'None'}</p>
                        </div>
                        <div class="meta-item">
                            <h4>Pages</h4>
                            <p>${book.number_of_pages || 'Unknown'}</p>
                        </div>
                        <div class="meta-item">
                            <h4>Language</h4>
                            <p>${book.languages ? book.languages.map(lang => lang.name).join(', ') : 'Unknown'}</p>
                        </div>
                    </div>
                    <button class="add-to-plan-btn">Add to Study Plan</button>
                </div>
            `;

            // Add event listener to the add to plan button in modal
            const addToPlanBtn = modalBookDetails.querySelector('.add-to-plan-btn');
            if (addToPlanBtn) {
                addToPlanBtn.addEventListener('click', () => {
                    showSelectedBook(
                        bookId, 
                        book.title || 'Untitled', 
                        book.authors ? book.authors.map(a => a.name).join(', ') : 'Unknown Author'
                    );
                    bookModal.style.display = 'none';
                    showSection('study-planner');
                    navLinks.forEach(l => l.classList.remove('active'));
                    document.querySelector('nav ul li a[data-section="study-planner"]').classList.add('active');
                });
            }

            bookModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching book details:', error);
            modalBookDetails.innerHTML = `<p class="error">Failed to load book details. Please try again later. Error: ${error.message}</p>`;
            bookModal.style.display = 'block';
        }
    }
    
    // Recommendations Functions
    async function loadRecommendations() {
        try {
            console.log('Loading recommendations for genre:', currentGenre); // Debug log
            const response = await fetch(`http://localhost:3000/api/recommendations?genre=${encodeURIComponent(currentGenre || 'all')}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Recommendations API response:', data); // Debug log
            
            if (data.works && data.works.length > 0) {
                // Map the recommendations data to match the expected structure
                const mappedBooks = data.works.map(work => ({
                    cover_i: work.cover_id, // Map cover_id to cover_i
                    title: work.title,
                    author_name: work.authors ? work.authors.map(author => author.name) : null,
                    first_publish_year: work.first_publish_year,
                    key: work.key
                }));
                renderBooks(mappedBooks, recommendationsResults);
            } else {
                recommendationsResults.innerHTML = '<p class="no-results">No recommendations found for this genre.</p>';
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            recommendationsResults.innerHTML = `<p class="error">Failed to load recommendations: ${error.message}</p>`;
        }
    }
    
    // Study Planner Functions
    function handlePlannerSearch() {
        const query = plannerSearch.value.trim();
        if (query.length < 3) {
            plannerSearchResults.innerHTML = '';
            plannerSearchResults.style.display = 'none';
            return;
        }
        
        fetch(`/api/search?query=${encodeURIComponent(query)}&limit=5`)
            .then(response => response.json())
            .then(data => {
                if (data.docs && data.docs.length > 0) {
                    renderPlannerSearchResults(data.docs);
                } else {
                    plannerSearchResults.innerHTML = '<p class="no-results">No books found</p>';
                    plannerSearchResults.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error searching for planner:', error);
                plannerSearchResults.innerHTML = '<p class="error">Search failed</p>';
                plannerSearchResults.style.display = 'block';
            });
    }
    
    function renderPlannerSearchResults(books) {
        plannerSearchResults.innerHTML = '';
        
        books.forEach(book => {
            const coverId = book.cover_i;
            const title = book.title || 'Untitled';
            const author = book.author_name ? book.author_name.join(', ') : 'Unknown Author';
            const key = book.key.replace('/works/', '');
            
            const resultItem = document.createElement('div');
            resultItem.className = 'mini-result-item';
            resultItem.innerHTML = `
                <h4>${title}</h4>
                <p>${author}</p>
            `;
            
            resultItem.addEventListener('click', () => {
                showSelectedBook(key, title, author);
                plannerSearchResults.style.display = 'none';
                plannerSearch.value = '';
            });
            
            plannerSearchResults.appendChild(resultItem);
        });
        
        plannerSearchResults.style.display = 'block';
    }
    
    function showSelectedBook(bookId, title, author) {
        selectedBook.classList.remove('hidden');
        selectedBook.querySelector('.selected-book-info').innerHTML = `
            <h4>${title}</h4>
            <p>${author}</p>
            <input type="hidden" id="selected-book-id" value="${bookId}">
            <input type="hidden" id="selected-book-title" value="${title}">
            <input type="hidden" id="selected-book-author" value="${author}">
        `;
    }
    
    function addBookToPlan() {
        const bookId = document.getElementById('selected-book-id').value;
        const title = document.getElementById('selected-book-title').value;
        const author = document.getElementById('selected-book-author').value;
        const pagesPerDay = parseInt(document.getElementById('pages-per-day').value) || 10;
        
        if (!bookId || !title) return;
        
        // Check if book is already in plan
        if (plannedBooksList.some(book => book.id === bookId)) {
            alert('This book is already in your study plan!');
            return;
        }
        
        // Add to plan
        const newBook = {
            id: bookId,
            title,
            author,
            pagesPerDay,
            addedDate: new Date().toISOString()
        };
        
        plannedBooksList.push(newBook);
        savePlannedBooks();
        renderPlannedBooks();
        
        // Reset selection
        selectedBook.classList.add('hidden');
        document.getElementById('pages-per-day').value = 10;
    }
    
    function renderPlannedBooks() {
        plannedBooks.innerHTML = '';
        
        if (plannedBooksList.length === 0) {
            plannedBooks.innerHTML = '<p class="no-plans">No books in your study plan yet. Add some books to get started!</p>';
            return;
        }
        
        plannedBooksList.forEach((book, index) => {
            const bookElement = document.createElement('div');
            bookElement.className = 'planned-book';
            bookElement.innerHTML = `
                <div class="planned-book-info">
                    <h4>${book.title}</h4>
                    <p>${book.author} • ${book.pagesPerDay} pages/day</p>
                </div>
                <div class="planned-book-actions">
                    <button class="remove-plan" data-index="${index}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            plannedBooks.appendChild(bookElement);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-plan').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeBookFromPlan(index);
            });
        });
    }
    
    function removeBookFromPlan(index) {
        plannedBooksList.splice(index, 1);
        savePlannedBooks();
        renderPlannedBooks();
    }
    
    function savePlannedBooks() {
        localStorage.setItem('plannedBooks', JSON.stringify(plannedBooksList));
    }
    
    // Utility Functions
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});