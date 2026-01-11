<div align="center">
  <img src="packages/client/public/logo_circle_transparent.png" alt="Vibely Logo" width="120" />
  <h1>Vibely – Social Media Platform</h1>
</div>

> **Diploma Thesis Project**
> **Topic:** Social media portal with chat, event management, and conversational advisor.
> **Author:** Sebastian Dragan

## 📖 Overview

This application is a full-featured social media platform designed to facilitate social interactions through posts, comments, real-time messaging, and event organization. A key feature of the application is the integration of a local AI conversational assistant to support user interactions.

## ✨ Features

### Authentication & User Profile

* User Registration and Login.
* Secure Logout.
* Profile management (Edit details, Change password, Set profile picture).

### Social Network

* Browse user profiles.
* Add and remove friends.
* Search for friends.
* **Blocking system:** Block/Unblock users and view blocked list.
* View current friends and **friend suggestions**.

### Feed & Interactions

* **Posts:** Create, edit, and delete personal posts.
* **Feed:** View posts from friends.
* **Reactions:** React to posts and view the list of reactors.
* **Comments:** View, add, edit, and delete comments on posts.
* **Notifications:** View system and social notifications.

### Messaging & Events

* **Chat:** Send direct messages to friends.
* **Events:** Create, edit, and delete events.
* **Discovery:** Search for events and view upcoming events.
* **Invitations:** Manage friend requests and event invitations.

### AI Integration

* **Conversational Assistant:** AI support during conversations utilizing local LLMs (Ollama).

## 🖥️ User Interface

Explore the key functional views of the application below.

<details>
  <summary>🏠 <b>Home Feed View</b> (Click to expand)</summary>
  <br>
  <img src="https://github.com/user-attachments/assets/a8e41bd5-e3a2-4f54-af73-09961a5734d5" alt="Home Feed" width="100%" />
</details>

<details>
  <summary>💬 <b>Chat Interface with AI Assistant</b> (Click to expand)</summary>
  <br>
  <img src="https://github.com/user-attachments/assets/11e18106-c3af-4957-aedb-11d4c3e4e1b4" alt="Chat Interface" width="100%" />
</details>

<details>
  <summary>👤 <b>User Profile Page</b> (Click to expand)</summary>
  <br>
  <img src="https://github.com/user-attachments/assets/276ec42e-dfcf-4ee5-bb19-c83976c0fdb7" alt="User Profile" width="100%" />
</details>

<details>
  <summary>📅 <b>Events Calendar</b> (Click to expand)</summary>
  <br>
  <img src="https://github.com/user-attachments/assets/0319ecac-7f10-48b8-8b95-41e4db2f2b25" alt="Event Details" width="100%" />
</details>

## 🛠️ Tech Stack

* **Server:** Node.js, Fastify
* **Database:** PostgreSQL, Drizzle ORM
* **Client:** Vite, React, TailwindCSS
* **Version Control:** Git
* **Testing:** Jest
* **AI:** Ollama (Local Models)

## ⚙️ Requirements

The application was developed and tested using the following software versions. Compatibility with older versions is not guaranteed.

* **PostgreSQL:** 17.4
* **Fastify:** 5.3.x
* **Node.js:** 22.12.0
* **React:** 19.1.0
* **Yarn:** 1.22.22
* **Ollama:** 0.13.5

## 🚀 Setup & Installation

### 1. Install Dependencies

Navigate to the project root folder and install dependencies:

```bash
yarn install

```

### 2. Database Setup

Create a PostgreSQL database with the following credentials:

* **Database Name:** `vibely`
* **User:** `admin`

### 3. Database Migration

Navigate to the server directory and push the schema to the database:

```bash
cd server
npx drizzle-kit push

```

### 4. Seed Database

Populate the database with necessary dictionary data:

```bash
# Inside the 'server' directory
yarn seed

```

### 5. AI Setup (Ollama)

1. Download and install Ollama from [ollama.com](https://ollama.com/download).
2. Pull the required model via terminal:
```bash
ollama pull llama3.1:8b

```



### 6. Running the Application

Open a new terminal in the project root and run:

```bash
yarn dev

```

### 7. Access

Open your browser and navigate to:
http://localhost:5173

---

## ⚖️ Disclaimer

To protect privacy, all user avatars are AI-generated using **This Person Does Not Exist**. All other media assets and post attachments are royalty-free stock images sourced from **Pixabay**.
