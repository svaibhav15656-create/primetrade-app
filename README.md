# Primetrade Task Manager

### What this project is about
- This is a full-stack web application I built designed for seamless task management.
- It allows users to securely register, log in, and manage their own personal tasks (Create, Read, Update, Delete).
- I implemented a Role-Based Access Control (RBAC) system. Regular users can only access their own dashboard, while Admin users have system-wide privileges to monitor all tasks and registered users.
- The project is fully modular, featuring secured RESTful APIs, proper error handling, a connected database, and a responsive frontend UI.

### What I used to build it (Tech Stack)
- **Backend:** Node.js
- **Database:** MongoDB (with Mongoose ORM)
- **Security:** jsonwebtoken (JWT) and bcryptjs
- **Frontend:** HTML5, CSS3, and Vanilla JavaScript
- **API Documentation:** Swagger
- **Containerization:** Docker & docker-compose

### Why I chose this tech stack (My thought process)
- **Node.js & Express:** I wanted a fast, non-blocking backend environment. Express is lightweight and makes structuring REST APIs, layering modular routes, and handling middleware very straightforward.
- **MongoDB:** Task and User data is naturally document-oriented. MongoDB uses JSON-like BSON formats which pairs flawlessly with a JavaScript backend, making it very easy to define models and relationships. 
- **JWT (JSON Web Tokens):** Instead of using legacy server-side session cookies, I opted for stateless JWT authentication. Because the token is stored on the frontend, the backend API remains stateless, which makes the app much easier to scale behind a load balancer later on.
- **Bcryptjs:** Security is a priority, so I made sure passwords are mathematically salted and hashed before they ever reach the database to protect user data from potential breaches.
- **Vanilla JS Frontend:** I decided to build the UI without heavy frameworks like React or Next.js. I wanted to prove that I can use core web fundamentals (the native `fetch` API and direct DOM manipulation) to build a smooth, beautiful Single Page Application from scratch.
- **Docker:** I containerized the backend, frontend, and the MongoDB database. This guarantees that if another developer pulls my code, it will run identically on their machine with a single command, eliminating "it works on my machine" setup issues.

---

### How to run it

If you have Docker Desktop installed, you can launch the entire project instantly without needing to download MongoDB or Node manually:

1. Open a terminal in the root folder of the project .
2. Run this command:
   ```bash
   docker-compose up --build
   ```
3. Open `http://localhost:3000` in your browser for the application.
4. Open `http://localhost:5000/api/v1/docs` in your browser for the interactive Swagger API documentation.


### Security Note regarding `.env`(point to be noted)
Please notice that the `.env` file containing the environment variables and delicate `JWT_SECRET` keys has **not** been uploaded to GitHub. I intentionally excluded it by adding `.env` to the `.gitignore` file to ensure the utmost privacy and security of out application credentials in the repository!
