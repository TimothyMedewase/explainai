# ExplainAI

ExplainAI is a modern web application that helps users upload documents and get AI-powered explanations. Upload your files and ask questions about them to receive clear, formatted explanations.

## Features

- **Document Uploads**: Easily upload multiple file formats for AI processing
- **Natural Language Questions**: Ask questions about your documents in plain English
- **Beautiful Formatted Responses**: Receive well-formatted responses with support for:
  - Mathematical formulas (via KaTeX)
  - Code blocks with syntax highlighting
  - Tables, lists, and other formatted text
  - Text animation effects
- **Modern UI**: Built with a clean, responsive design using Tailwind CSS
- **Dark Mode Support**: Switch between light and dark themes
- **Authentication**: Secure user authentication via Clerk

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for the frontend
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Clerk](https://clerk.com/) - Authentication and user management
- [KaTeX](https://katex.org/) - Math typesetting
- [Motion](https://motion.dev/) - Animation library
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/TimothyMedewase/explainai
   cd explainai
   ```

2. Install the dependencies

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory and add:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

## Usage

1. Sign in using the authentication providers
2. Upload your documents using the file upload interface
3. Type a question about your documents in the text area
4. Receive a formatted explanation from the AI

## Backend Integration

ExplainAI requires a backend API service running on the default endpoint `http://localhost:8000`. The backend should implement:

- `/process` - POST endpoint for processing uploaded files with a text query

## Deployment

The app can be deployed on [Vercel](https://vercel.com/), the creators of Next.js:

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Import your repository to Vercel
3. Configure your environment variables
4. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

Created by Timothy Medewase - medewaset@gmail.com
