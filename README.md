Open Library
Overview
The Open Library is a web application that allows users to browse, search, and manage a digital collection of books. Built with Node.js (Express) for the backend and MongoDB for data storage, it provides a seamless experience for book enthusiasts.

Features
User Authentication: Sign up, login, and JWT-based secure access.

Book Search: Find books by title, author, or genre.

Book Details: View comprehensive information about each book.

User Profiles: Save favorite books and track reading history.

Admin Panel: Manage books and users (add, edit, delete).

API Security: Protected routes with JWT authentication.

Tech Stack
Backend:
Node.js & Express.js – Server & API

MongoDB & Mongoose – Database & ORM

JWT & bcrypt – Authentication & Security

Deployment:
Ubuntu (Web01, Web02, LB01)

HAProxy (Load Balancer)

PM2 (Process Manager for Node.js)

Setup & Installation
Prerequisites
Node.js (v16 or higher)

MongoDB (Local or cloud instance)

Git

1. Clone the Repository
bash
Copy
git clone https://github.com/your-username/open-library.git  
cd open-library  
2. Install Dependencies
bash
Copy
npm install  
3. Configure Environment Variables
Create a .env file and add:

env
Copy
PORT=3000  
MONGODB_URI=mongodb://your-mongo-uri  
JWT_SECRET=your-secret-key  
4. Run the Application
Development:

bash
Copy
node server.js  
Production (PM2):

bash
Copy
pm2 start server.js --name OpenLibrary  
pm2 save  
pm2 startup  
API Endpoints
Authentication Routes
Method	Endpoint	Description
POST	/api/auth/register	User registration
POST	/api/auth/login	User login
Book Routes
Method	Endpoint	Description
GET	/api/books	Get all books (filtered)
GET	/api/books/:id	Get book details
POST	/api/books	Add a new book (Admin)
User Routes
Method	Endpoint	Description
GET	/api/users/favorites	Get user’s favorite books
POST	/api/users/favorites	Save a book to favorites
Deployment Guide
On Web Servers (Web01 & Web02)
bash
Copy
sudo apt update && sudo apt install -y nodejs npm git  
git clone https://github.com/your-username/open-library.git  
cd open-library && npm install  
pm2 start server.js --name OpenLibrary  
On Load Balancer (LB01 - HAProxy)
bash
Copy
sudo apt update && sudo apt install -y haproxy  
sudo nano /etc/haproxy/haproxy.cfg  
Add:

haproxy
Copy
frontend http-in  
    bind *:80  
    bind *:443 ssl crt /etc/ssl/private/yourdomain.pem  
    http-request redirect scheme https unless { ssl_fc }  
    default_backend backend_servers  

backend backend_servers  
    balance roundrobin  
    server web01 web01-ip:3000 check  
    server web02 web02-ip:3000 check  
Restart HAProxy:

bash
Copy
sudo systemctl restart haproxy  
Contributing
Fork the repository.

Create a feature branch (git checkout -b feature-branch).

Commit changes (git commit -m 'Add new feature').

Push to GitHub (git push origin feature-branch).

Open a Pull Request.

License
This project is licensed under the MIT License.

Demo
🔗 Watch Demo Video
