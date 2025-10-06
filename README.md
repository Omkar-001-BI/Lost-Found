# Lost & Found MERN Project

A full-stack web application for reporting, searching, and communicating about lost and found items. Built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with real-time messaging and notifications.

---

## Features

- **User Authentication:** Secure registration and login using JWT.
- **Item Management:** Post, edit, delete, and search lost/found items.
- **Comments:** Add and view comments on items.
- **Messaging:** Real-time chat between users using Socket.IO.
- **Notifications:** Instant notifications for messages, comments, and item updates.
- **Admin Panel:** (Optional) Manage users and posts.

---

## Tech Stack

- **Frontend:** React.js, Axios, React Router, Socket.IO Client
- **Backend:** Node.js, Express.js, Socket.IO, Mongoose
- **Database:** MongoDB
- **Other:** Morgan (logging), dotenv (env management), bcrypt (password hashing), JWT (authentication), CORS

---

## Getting Started

### Prerequisites

- Node.js & npm
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository:**
   ```
   git clone https://github.com/yourusername/lost-found-mern.git
   cd lost-found-mern
   ```

2. **Backend Setup:**
   ```
   cd server
   npm install
   ```
   - Create a `.env` file in `/server`:
     ```
     MONGO_URI=your_mongodb_connection_string
     PORT=4000
     CORS_ORIGIN=http://localhost:3000
     JWT_SECRET=your_jwt_secret
     ```

3. **Frontend Setup:**
   ```
   cd ../client
   npm install
   ```
   - Create a `.env` file in `/client`:
     ```
     REACT_APP_API_URL=http://localhost:4000
     ```

### Running the App

- **Start MongoDB** (if running locally)
- **Start Backend:**
  ```
  cd server
  npm start
  ```
- **Start Frontend:**
  ```
  cd ../client
  npm start
  ```

---

## Folder Structure

```
Lost-Found-MERN-main/
  ├── client/      # React frontend
  │   └── src/
  │       └── api/
  │           └── axios.js   # Axios instance for API requests
  └── server/      # Express backend
```

---

## API Endpoints

- `/users` - User registration, login, profile
- `/Items` - Item CRUD operations
- `/comments` - Add/view comments
- `/messages` - Real-time messaging
- `/notifications` - User notifications

---

## Real-time Features

- **Socket.IO** is used for chat and notifications.
- Users join rooms based on their user ID for targeted events.

---
<img width="1918" height="910" alt="Screenshot 2025-10-06 222104" src="https://github.com/user-attachments/assets/760cfa3b-fe4a-4e91-8b60-dd70cad94ca7" />
<img width="1879" height="868" alt="Screenshot 2025-10-06 222903" src="https://github.com/user-attachments/assets/e8e34683-7fca-485e-abef-8fe51a0d09fd" />
<img width="1884" height="879" alt="Screenshot 2025-10-06 222844" src="https://github.com/user-attachments/assets/54282a50-5bd5-43e6-8661-836034f3f86b" />
<img width="1879" height="868" alt="Screenshot 2025-10-06 222903" src="https://github.com/user-attachments/assets/0c9cb8c9-ed5f-49ce-9522-bf1fae1b50f5" />

## Axios Configuration

- The frontend uses a custom Axios instance (`client/src/api/axios.js`) for API requests.
- The base URL is set from `REACT_APP_API_URL` or defaults to `http://localhost:4001`.
- Requests include JWT tokens from localStorage for authentication.
- Interceptors handle errors, timeouts, and attach authorization headers automatically.

---

## Environment Variables

- **Backend:**  
  - `MONGO_URI` - MongoDB connection string  
  - `PORT` - Server port  
  - `CORS_ORIGIN` - Allowed frontend origin  
  - `JWT_SECRET` - JWT signing key

- **Frontend:**  
  - `REACT_APP_API_URL` - Backend API URL

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)

---

## Acknowledgements

- [Socket.IO](https://socket.io/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Axios](https://axios-http.com/)
