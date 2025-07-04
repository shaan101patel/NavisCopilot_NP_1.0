# NavisCopilot Frontend MVP 1.0

An AI-powered customer service and sales platform with real-time call transcription, live RAG assistance, and actionable analytics.

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)

### Step-by-Step Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shaan101patel/NavisCopilot_FrontEnd_PR_1.0.git
   cd NavisCopilot_FrontEnd_PR_1.0
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Navigate to the app directory and install dependencies**
   ```bash
   cd app
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   - The application will automatically open at `http://localhost:3000`
   - If it doesn't open automatically, navigate to the URL manually

### Alternative Package Manager (Yarn)

If you prefer using Yarn:

```bash
# Step 2: Install root dependencies
yarn install

# Step 3: Navigate to app directory and install dependencies
cd app
yarn install

# Step 4: Start the development server
yarn start
```

## 🛠️ Available Scripts

In the `app` directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run lint` - Runs ESLint to check code quality
- `npm run format` - Formats code using Prettier

## 📁 Project Structure

```
NavisCopilot_FrontEnd_PR_1.0/
├── app/                          # Main React application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── layout/          # Layout components
│   │   │   └── ui/              # UI primitives
│   │   ├── pages/               # Route-level components
│   │   ├── store/               # Redux store and slices
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API clients and business logic
│   │   ├── styles/              # Global styles and Tailwind config
│   │   └── utils/               # Helper functions
│   ├── public/                  # Static assets
│   └── package.json            # App dependencies and scripts
├── vibecoding/                  # Development guidelines
└── README.md                   # This file
```

## 🎯 Core Features

### Agent Dashboard
- View active tickets and join/leave calls
- Live transcription and AI suggestions
- Real-time updates via WebSocket connections

### Live Call Window
- Two-pane UI for real-time transcript/notes
- RAG-powered answers and scripts
- Dynamic output formatting (newbie, intermediate, experienced modes)

### Ticket Management
- Create, assign, and resolve tickets
- Attach call data and AI insights
- Comprehensive ticket tracking

### Analytics Dashboard
- Call metrics and sentiment analysis
- Script adherence monitoring
- Agent performance tracking

### Admin Panel
- User management
- Aggregate analytics
- Workflow configuration

## 🔧 Tech Stack

- **Framework:** React 19+ with TypeScript
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI primitives
- **Routing:** React Router DOM
- **Build Tool:** CRACO (Create React App Configuration Override)
- **Testing:** Jest & React Testing Library
- **Code Quality:** ESLint, Prettier, Husky

## 🎨 Design System

The application uses a utility-first approach with Tailwind CSS:
- Responsive design (mobile-first)
- Consistent spacing and typography
- Accessible color palette
- Custom components built with Radix UI

## 🔐 Development Guidelines

### Code Quality
- All code must pass ESLint and Prettier checks
- Use TypeScript for type safety
- Write unit tests for logic-heavy components
- Follow the single responsibility principle

### Git Workflow
- Develop features in feature branches
- Use Conventional Commits style
- Require code reviews before merging
- Link pull requests to GitHub Issues

### Best Practices
- Use functional components and React Hooks
- Build modular, reusable components
- Abstract business logic from UI components
- Ensure keyboard accessibility

## 🚨 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
# Or run on a different port
PORT=3001 npm start
```

**Node modules issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Build failures:**
```bash
# Check for TypeScript errors
npm run lint
# Clear build cache
rm -rf build
npm run build
```

## 📚 Documentation

- [Tech Stack & Coding Preferences](TechStack_CodingPreferences_ProjectScope.md)
- [Component Documentation](app/src/components/README.md)
- [Dark Mode Implementation](DARK_MODE_README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

**Need help?** Check the troubleshooting section above or open an issue in the GitHub repository.

**First commit:** 6/21/25
**Last updated:** 7/4/25