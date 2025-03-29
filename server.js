require('dotenv').config()
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Replace your current CORS setup with:
app.use(cors({
    origin: [
        "http://localhost:5500", 
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
app.use(express.json());

// Ensure static files (like images) are served correctly
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/api/search', async (req, res) => {
    try {
        const { query, page = 1, limit = 10 } = req.query;
        const response = await axios.get(`${process.env.OPEN_LIBRARY_API}/search.json`, {
            params: {
                q: query,
                page,
                limit
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

app.get('/api/book/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${process.env.OPEN_LIBRARY_API}/works/${id}.json`);
        res.json(response.data);
    } catch (error) {
        console.error('Book details error:', error);
        res.status(500).json({ error: 'Failed to fetch book details' });
    }
});

app.get('/api/author/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${process.env.OPEN_LIBRARY_API}/authors/${id}.json`);
        res.json(response.data);
    } catch (error) {
        console.error('Author details error:', error);
        res.status(500).json({ error: 'Failed to fetch author details' });
    }
});

app.get('/api/recommendations', async (req, res) => {
    try {
        const { genre = 'all' } = req.query;

        const genreSubjects = {
            'fiction': 'fiction',
            'science': 'science',
            'history': 'history',
            'biography': 'biography',
            'all': '' // Fetch broader results for 'all'
        };

        const subject = genreSubjects[genre];
        const url = subject 
            ? `https://openlibrary.org/subjects/${subject}.json?limit=5` 
            : `https://openlibrary.org/subjects.json?limit=5`;

        const response = await axios.get(url);

        // Ensure the response matches the frontend's expectations
        const works = (response.data.works || []).map(work => {
            // Add absolute image URL if available, otherwise use a placeholder
            if (work.cover_id) {
                work.cover_url = `https://covers.openlibrary.org/b/id/${work.cover_id}-L.jpg`;
            } else {
                work.cover_url = 'https://via.placeholder.com/150?text=No+Image'; // Placeholder image
            }
            return work;
        });

        res.json({ works });
    } catch (error) {
        console.error('Recommendations error:', error.message);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});