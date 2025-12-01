# ShareFlow - A Modern Q&A Platform

ShareFlow is a feature-rich, community-driven question-and-answer platform designed to facilitate knowledge sharing and collaboration. It's built with a modern, full-stack serverless architecture, leveraging the power of Next.js, Firebase, and Google's Generative AI.

## Tech Stack

ShareFlow is built on a powerful and scalable tech stack:

- **Frontend Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **UI Library**: [React](https://reactjs.org/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **Generative AI**: [Genkit (by Firebase)](https://firebase.google.com/docs/genkit) with Google's Gemini models.
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Core Features

### 1. User Authentication

- **What it is**: Secure user registration, login, and session management. Users can sign up with an email and password, log in to their account, and log out.
- **Importance**: Authentication is the cornerstone of a community platform. It ensures that content is attributed to specific users, enables personalization, and secures user-specific actions like posting and voting.
- **How it works**: This feature is powered by **Firebase Authentication**. When a user signs up, a new user account is created in the Firebase project, and a corresponding user profile document is created in Firestore to store additional information like username and registration date. Subsequent logins are verified against Firebase Auth.

### 2. Real-time Q&A Platform

- **What it is**: The central functionality of ShareFlow. Users can post questions, provide answers to existing questions, and view all content in real-time.
- **Importance**: This is the core of the application. It creates an interactive space for users to exchange information and solve problems collaboratively.
- **How it works**: All questions and answers are stored as documents in **Cloud Firestore**. The application uses custom React hooks (`useCollection`, `useDoc`) that listen for real-time updates from Firestore. This means that when a new question or answer is posted, it appears on the screen for all users instantly, without requiring a page refresh.

### 3. Voting System

- **What it is**: Users can upvote or downvote answers. The answers on a question page are automatically sorted based on their net score (upvotes - downvotes).
- **Importance**: Voting is a crucial mechanism for content curation in a Q&A platform. It helps the community to surface the most accurate and helpful answers, ensuring that quality content is easily discoverable.
- **How it works**: Each answer document in Firestore contains `upvotes` and `downvotes` fields. When a user votes, a non-blocking Firestore transaction atomically increments or decrements the appropriate counter. The UI updates optimistically for a snappy user experience and then syncs with the database in the background.

### 4. AI-Powered Answer Summarization

- **What it is**: The top-voted answer for each question features an "Summarize with AI" button. Clicking this generates a concise summary of that answer.
- **Importance**: This "amazing" feature leverages Generative AI to provide quick insights. It's perfect for users who want to grasp the key points of a long or complex answer without reading it in its entirety.
- **How it works**: This is implemented using a **Genkit Flow**. When the button is clicked, a Next.js Server Action is invoked. This action calls a Genkit flow, which in turn sends a prompt to the Google Gemini model. The prompt contains the question title and the answer text. The model returns a summary, which is then streamed back to the user's screen.

### 5. User Profiles & Activity

- **What it is**: Every user has a public profile page that displays their information (username, registration date) and their activity on the platform.
- **Importance**: Profiles add a social and reputational dimension to the platform. They allow users to see the contributions of others, fostering a sense of community and encouraging active participation.
- **How it works**: The profile page is a dynamic Next.js route (`/profile/[id]`). When a user's profile is visited, the app queries Firestore for the user's document, as well as all questions and answers associated with that user's ID. The information is then displayed in separate tabs for easy viewing.

### 6. Search and Tagging

- **What it is**: Users can add tags when they post a question. The main questions page includes a search bar to filter questions by keywords and the ability to view all questions associated with a specific tag.
- **Importance**: As the amount of content grows, search and tagging become essential for discoverability. They allow users to quickly find relevant questions and answers, improving the overall user experience.
- **How it works**: Tags are stored as an array within each question document in Firestore. Clicking a tag initiates a Firestore query to fetch all questions containing that tag. The search bar performs a client-side filter on the question titles and descriptions for instant results.

## Getting Started

To run this project locally:

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run the development server**:
    ```bash
    npm run dev
    ```
This will start the Next.js application. You can now open your browser and navigate to the provided local URL to see ShareFlow in action.
