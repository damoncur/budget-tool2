# Budget Tool

A simple Node.js budget manager for tracking income and expenses. All amounts are automatically converted to monthly equivalents for easy budgeting.

## Prerequisites

- [Node.js](https://nodejs.org/) v16.9 or later

## Installation

```bash
git clone https://github.com/damoncur/budget-tool2.git
cd budget-tool2
npm install
```

## Starting the App

**Development** (auto-reload on file changes):

```bash
npm run dev
```

**Production**:

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Usage

The app has two main pages, accessible via the navigation bar:

- **Income** (`/`) — Add and view income categories (biweekly salary, monthly deposits)
- **Expenses** (`/expenses`) — Add and view expense categories (weekly, biweekly, monthly, quarterly, yearly)

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Income management page |
| POST | `/income-categories` | Create an income category |
| GET | `/api/income-categories` | Income categories as JSON |
| GET | `/expenses` | Expense management page |
| POST | `/expense-categories` | Create an expense category |
| GET | `/api/expense-categories` | Expense categories as JSON |

## Notes

- Data is stored in memory and resets when the server restarts.
- Built with [Express](https://expressjs.com/).
