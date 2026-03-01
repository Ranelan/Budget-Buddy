# Budget Buddy 💰

A modern, AI-powered personal finance management application built with React. Budget Buddy helps you take control of your financial life with smart budgeting tools, goal tracking, transaction management, and personalized AI-generated financial advice.

## Features

- **Budget Management** – Create and monitor monthly budgets with visual insights.
- **Financial Goals** – Set savings targets and track your progress toward milestones.
- **Transaction Tracking** – Log and review all income and expenses in one place.
- **Recurring Payments** – Monitor subscriptions and automated transactions with countdown alerts.
- **Expense Categories** – Organize spending with customizable categories.
- **AI Financial Tips** – Get personalized financial advice powered by OpenAI, Google Gemini, Anthropic Claude, or a local AI model.
- **Analytics Dashboard** – Visualize spending patterns with interactive charts (admin view).
- **User & Admin Roles** – Separate dashboards for regular users and administrators.
- **Profile Management** – Update your account details from within the app.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router DOM v6 |
| Charts | Recharts |
| HTTP Client | Axios |
| Styling | Custom CSS with CSS variables |
| Backend API | Spring Boot (runs on `http://localhost:8081`) |
| AI Integration | OpenAI GPT, Google Gemini, or local models |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- npm v8 or higher
- The Budget Buddy backend API running on port `8081`

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Ranelan/Budget-Buddy.git
   cd Budget-Buddy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables** *(optional – required only for AI tips)*

   Create a `.env` file in the project root:

   ```env
   # OpenAI (recommended)
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   REACT_APP_OPENAI_MODEL=gpt-3.5-turbo

   # Google Gemini
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here

   # Anthropic Claude
   REACT_APP_CLAUDE_API_KEY=your_claude_api_key_here

   # Local AI (e.g. Ollama)
   REACT_APP_LOCAL_AI_URL=http://localhost:11434
   REACT_APP_LOCAL_AI_MODEL=llama2
   ```

   If no API key is provided, the app automatically falls back to a set of static financial tips.

4. **Start the development server**

   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Run the app in development mode with hot reload |
| `npm test` | Launch the test runner in interactive watch mode |
| `npm run build` | Create an optimized production build in the `build/` folder |
| `npm run eject` | Eject from Create React App (irreversible) |

## Project Structure

```
src/
├── components/          # Reusable UI components (AI tips, modals, toasts)
├── hooks/               # Custom React hooks
├── services/            # API and AI service integrations
├── Screens/             # Full-page views (Budget, Goals, Profile)
├── App.js               # Root component, routing, and auth context
├── AdminDashboard.js    # Admin management & analytics
├── UserDashboard.js     # User home & nested routes
├── TransactionPage.js   # Income & expense tracking
├── RecurringTransaction.js  # Recurring payment management
├── Category.js          # Expense category management
└── ...
```

## User Roles

| Role | Access |
|------|--------|
| **Regular User** | Budget, Goals, Transactions, Recurring Payments, Categories, Profile |
| **Admin** | User management, Category management, Recurring transactions, Analytics |

Sign up as a regular user at `/signup`, or use the admin signup flow to create an admin account.

## AI Financial Tips

Budget Buddy includes an AI-powered tips engine that generates personalized advice based on your spending patterns, budget allocations, and financial goals. Tips are cached for one hour to minimize API usage and can be refreshed manually from the dashboard.

For detailed AI configuration options, see [AI_SETUP.md](./AI_SETUP.md).

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

## License

This project is private. All rights reserved.
