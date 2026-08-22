# Ledger REST API Reference

The Ledger Backend exposes a comprehensive RESTful API secured by JWT Bearer tokens.

Base URL: `http://localhost:5000/api`

---

## Authentication Endpoints (`/api/auth`)

### 1. User Registration
- **Endpoint**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "Jane Doe",
    "currency": "USD",
    "monthlyIncome": 6000
  }
  ```
- **Response `201`**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": { "id": "...", "email": "user@example.com", "name": "Jane Doe" }
    }
  }
  ```

### 2. User Login
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### 3. Get Current User Profile
- **Endpoint**: `GET /api/auth/profile`
- **Headers**: `Authorization: Bearer <TOKEN>`

---

## Expense Endpoints (`/api/expenses`)

### 1. List Expenses
- **Endpoint**: `GET /api/expenses`
- **Query Params**:
  - `page` (number, default: 1)
  - `limit` (number, default: 20)
  - `categoryId` (string)
  - `startDate` (ISO string)
  - `endDate` (ISO string)
  - `search` (string)
  - `sortBy` (`date` | `amount`)
  - `sortOrder` (`asc` | `desc`)

### 2. Create Expense
- **Endpoint**: `POST /api/expenses`
- **Body**:
  ```json
  {
    "title": "Whole Foods Market Groceries",
    "amount": 84.50,
    "categoryId": "category-id",
    "merchant": "Whole Foods",
    "date": "2026-03-15",
    "paymentMethod": "CREDIT_CARD",
    "notes": "Weekly produce",
    "isRecurring": false
  }
  ```

### 3. Update / Delete Expense
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

---

## Receipt OCR & RAG Endpoints (`/api/receipts`)

### 1. Upload & Parse Receipt
- **Endpoint**: `POST /api/receipts/upload`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `receipt`: File (PDF, PNG, JPG, WEBP, CSV, TXT)
  - `autoCreateExpense`: `true` | `false`
- **Description**: Extracts vendor, date, total amount, taxes, itemized list, and chunks & vectors data into the RAG memory vectorstore.

### 2. List Receipts
- **Endpoint**: `GET /api/receipts`

### 3. Delete Receipt
- **Endpoint**: `DELETE /api/receipts/:id`

---

## AI Assistant & RAG Query Endpoints (`/api/chat`)

### 1. Send Conversational Message
- **Endpoint**: `POST /api/chat/message`
- **Body**:
  ```json
  {
    "message": "How much have I spent on groceries this month?",
    "includeRagSources": true,
    "conversationHistory": []
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "reply": "You have spent $311.40 on groceries this month across 3 receipts.",
      "sources": [
        {
          "documentId": "...",
          "merchant": "Whole Foods Market",
          "score": 94,
          "textSnippet": "..."
        }
      ]
    }
  }
  ```

---

## Multi-Agent Workflow Endpoints (`/api/agents`)

### 1. Execute Multi-Agent Optimization
- **Endpoint**: `POST /api/agents/run-workflow`
- **Description**: Sequentially triggers **Analysis Agent** $\rightarrow$ **Budgeting Agent** $\rightarrow$ **Recommendations Agent**. Generates health score (0-100), 50/30/20 breakdown, anomaly flags, and savings action plans.

### 2. List Past Reports
- **Endpoint**: `GET /api/agents/reports`

---

## Budgets & Dashboard Endpoints

- `GET /api/budgets` - Active budget limits & percentage utilization
- `POST /api/budgets` - Set new category limit
- `PUT /api/budgets/:id` - Update budget ceiling
- `DELETE /api/budgets/:id` - Remove budget limit
- `GET /api/dashboard/overview` - Aggregated KPIs, 30-day velocity, category donut chart, MoM change
