# Dashboard Frontend - React & Material-UI

This is the frontend project for a Dashboard system, built with React and the Material-UI (MUI) library. The interface is designed to monitor and manage key metrics such as members, drivers, trips, revenue, and more.

## ✨ Key Features

- **Dynamic Dashboard:** Displays overview data fetched directly from the API.
- **Data Visualization:** Uses `Recharts` to render charts (bar, pie) for easy data analysis.
- **Real-time Data Fetching:** Utilizes SWR for fetching and caching API data, with automatic updates on changes.
- **Responsive Interface:** Fully responsive and works on various screen sizes.
- **Status Management:** Update the status of drivers, vehicles, licenses, etc.
- **Custom Theming & Styling:** Built with Material-UI's powerful theming system.

## 🚀 Tech Stack

- **Framework:** [React](https://reactjs.org/)
- **UI Library:** [Material-UI (MUI)](https://mui.com/)
- **Charting:** [Recharts](https://recharts.org/)
- **Data Fetching:** [SWR](https://swr.vercel.app/)
- **Routing:** [React Router](https://reactrouter.com/)
- **Language:** JavaScript

## 📦 Installation and Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 14.x or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/QuocLe2308/FTCS_FE.git
    cd FTCS_FE
    ```

2.  **Install dependencies:**
    This project might encounter dependency conflicts with MUI versions. Use the `--legacy-peer-deps` flag to bypass this issue.
    ```bash
    npm install --legacy-peer-deps
    ```

3.  **Run the project in development mode:**
    ```bash
    npm start
    ```
    Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Folder Structure

Here is the main folder structure of the project:
```
FTCS_FE/
├── public/
└── src/
    ├── api/          # Contains API call logic and SWR hooks
    ├── assets/       # Contains static assets like images, third-party CSS
    ├── components/   # Contains reusable components (Button, Card, ...)
    ├── contexts/     # Contains React Contexts
    ├── layout/       # Contains the main application layout (Header, Sidebar)
    ├── menu-items/   # Configuration for menu items
    ├── pages/        # Contains the main pages of the application (Dashboard, Login, ...)
    ├── routes/       # Configuration for the entire application's routing
    ├── sections/     # Contains large components, which are "sections" of a page
    ├── themes/       # Configuration for the Material-UI theme (colors, fonts)
    └── utils/        # Contains utility functions
```

## 📜 Available Scripts

- `npm start`: Runs the app in development mode.
- `npm build`: Builds the app for production.
- `npm test`: Runs the test runner.
- `npm eject`: Ejects from `create-react-app`.

---
Happy coding! ✨
