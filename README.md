# Open Library Overview

The Open Library is a web application that allows users to browse, search, and manage a digital collection of books. Built with Node.js for the backend and html, css and Javascript for frontend. it provides a seamless experience for book enthusiasts.

## Features

- **Book Search**: Find books by title.
- **Book Details**: View comprehensive information about each book.
- **User Profiles**: Save favorite books and track reading history.



## Tech Stack

### Backend:

- Node.js – Server & API

### Deployment:

- **Ubuntu** (Web01, Web02, LB01)
- **HAProxy** (Load Balancer)
- **PM2** (Process Manager for Node.js)

## Setup & Installation

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Git**

### Clone the Repository

```bash
git clone https://github.com/jmuhire13/open-library.git
cd open-library
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file and add:

```env
PORT=3000
OPEN_LIBRARY_API = https://openlibrary.org
```

### Run the Application

#### Development Mode:

```bash
node server.js
```

#### Production Mode (Using PM2):

```bash
pm install -g pm2
pm2 start server.js --name OpenLibrary
pm2 save
pm2 startup
```

## Deployment Guide

### On Web Servers (Web01 & Web02)

```bash
sudo apt update && sudo apt install -y nodejs npm git
git clone https://github.com/your-username/open-library.git
cd open-library && npm install
pm2 start server.js --name OpenLibrary
```

### On Load Balancer (LB01 - HAProxy)

```bash
sudo apt update && sudo apt install -y haproxy
sudo nano /etc/haproxy/haproxy.cfg
```

Add the following configuration:

```haproxy
frontend http-in
    bind *:80
    bind *:443 ssl crt /etc/ssl/private/yourdomain.pem
    http-request redirect scheme https unless { ssl_fc }
    default_backend backend_servers

backend backend_servers
    balance roundrobin
    server web01 web01-ip:3000 check
    server web02 web02-ip:3000 check
```

Restart HAProxy:

```bash
sudo systemctl restart haproxy
```

## Demo

🔗 **[Watch Demo Video](https://drive.google.com/file/d/1sDw9UjXS4lGePZ6XG_bOPr6w5XNWimMt/view?usp=sharing)**

