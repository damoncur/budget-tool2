# Testing budget-tool2

## Starting the App

```bash
cd ~/repos/budget-tool2
npm run dev    # auto-reload via --watch
# OR
npm start      # standard start
```

The app runs at `http://localhost:3000`.

If port 3000 is already in use, kill the existing process first:
```bash
fuser -k 3000/tcp
```

## Available Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Renders the income management page with form and table |
| POST | `/income-categories` | Creates a new income category, redirects to `/` |
| GET | `/api/income-categories` | Returns JSON with all income categories and total |

## Key Verification Steps

1. **Empty state**: `GET /` should show the form, an empty table with "No income categories added yet.", and "Total Monthly Income: $0.00"
2. **Add category**: Submit the form with a name, type, and amount. Page should redirect to `/` and show the new row in the table.
3. **Biweekly calculation**: A biweekly salary of $X should show monthly equivalent of `X * 26 / 12` (e.g., $1200 biweekly = $2600.00 monthly)
4. **Monthly deposit**: A monthly deposit amount passes through unchanged.
5. **JSON API**: `GET /api/income-categories` returns `{items: [...], totalMonthlyIncome: number}`
6. **XSS prevention**: Entering `<script>` tags in the name field should render as escaped text, not execute.

## Architecture Notes

- In-memory store (`src/data/store.js`) — data resets on server restart
- No database, no authentication
- No lint or test scripts configured in package.json
- Income types: `biweekly-salary`, `monthly-deposit`
