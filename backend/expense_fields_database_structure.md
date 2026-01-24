# Database & Backend Structure - Expense Fields

## Project Overview
This document contains all expense field names extracted from the existing system to rebuild the database and backend for daily sales and expenses tracking.

---

## System Requirements

### Daily Entry Flow
1. Data entry enters daily sales and expenses for each product separately
2. System calculates totals before submission
3. Summary section shows:
   - **Product Cash (Today)** = Product Sales (Today) - Product Expenses (Today)
   - **Total Cash (Today)** = Total Sales (Today) - Total Expenses (Today)
   - **Total Current Cash** = Yesterday's Total Cash + Today's Total Cash

### Important Notes
- Not all expense fields will have values every day
- Backend should handle optional/missing expense fields gracefully
- Display only expenses with values (following best practices)

---

## Product List
```
- Chips
- OrgFlavors (Organic Flavors)
- Pellets
- Protein Chips
- Protein Bars
- Thalgy
- Macaroni
- Drinks
```

---

## Complete Expense Fields List

### 1. FACTORY & PRODUCTION COSTS
```json
{
  "direct_factory_costs": "Direct Factory Costs",
  "direct_labour_cost": "Direct Labour Cost",
  "indirect_labour_cost": "Indirect Labour Cost",
  "contract_labour": "Contract Labour",
  "heat_and_power": "Heat and Power",
  "commissions_factory": "Commissions (Factory)",
  "misc_factory_costs": "Misc. Factory Costs",
  "freight": "Freight",
  "freight_costs": "Freight Costs",
  "raw_materials_purchased": "Raw Materials Purchased",
  "product_cost": "Product Cost"
}
```

### 2. OPERATIONAL EXPENSES
```json
{
  "marketing_expense": "Marketing Expense",
  "vehicle_expenses": "Vehicle Expenses",
  "travel_exp": "Travel Exp",
  "travel_transportation_exp": "Travel & Transportation Exp",
  "transportion": "Transportation",
  "gas_oil": "Gas & Oil",
  "gifts_expenses": "Gifts Expenses",
  "maintenance_expense": "Maintenance Expense",
  "office_supplies_expenses": "Office Supplies Expenses",
  "communication_expenses": "Communication Expenses",
  "rent_or_lease_expense": "Rent or Lease Expense",
  "office_expenses": "Office Expenses",
  "utilities": "Utilities",
  "internet": "Internet",
  "stationery": "Stationery"
}
```

### 3. HUMAN RESOURCES & PAYROLL
```json
{
  "salaries": "Salaries",
  "wages": "Wages",
  "daily_allowance": "Daily Allowance",
  "incentive": "Incentive",
  "rewarding": "Rewarding"
}
```

### 4. MACHINES & EQUIPMENT
```json
{
  "machines_spares": "Machines & Spares",
  "machines_puffs": "Machines - Puffs",
  "machines_pellets": "Machines - Pellets",
  "machines": "Machines",
  "spares": "Spares",
  "other_machines_equipment": "Other Machines and Equipment",
  "furniture": "Furniture",
  "automatic_swing_door": "Automatic Swing Door Opener System"
}
```

### 5. PROFESSIONAL SERVICES
```json
{
  "legal_fee": "Legal Fee",
  "consulting": "Consulting",
  "other_service": "Other Service",
  "soft_wear": "Software"
}
```

### 6. FINANCIAL & ADMINISTRATIVE
```json
{
  "bank_fee": "Bank Fee",
  "tax_paid": "Tax Paid",
  "exchange_gain_loss": "Exchange Gain/Loss - net",
  "loan_benefits": "Loan benefits",
  "dividends": "Dividends"
}
```

### 7. MISCELLANEOUS EXPENSES
```json
{
  "advance_purchases_clearance": "Advance purchases/clearance",
  "charitable_contributions": "Charitable Contributions",
  "hospitality": "Hospitality",
  "public_relations": "Public Relations",
  "other_assets": "Other Assets"
}
```

### 8. INTERNAL TRANSFERS
```json
{
  "orgflavors_to_ho": "OrgFlavors to HO",
  "pellets_to_ho": "Pellets to HO",
  "to_flavors": "To Flavors",
  "to_sanitizers": "To Sanitizers",
  "flavors": "Flavors"
}
```

---

## Database Schema Recommendation

### Products Table
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Daily Sales Table
```sql
CREATE TABLE daily_sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    product_id INT NOT NULL,
    sales_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_daily_product (date, product_id)
);
```

### Expense Types Table
```sql
CREATE TABLE expense_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Daily Expenses Table
```sql
CREATE TABLE daily_expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    product_id INT NOT NULL,
    expense_type_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (expense_type_id) REFERENCES expense_types(id),
    INDEX idx_date_product (date, product_id),
    INDEX idx_expense_type (expense_type_id)
);
```

### Daily Summary Table
```sql
CREATE TABLE daily_summary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL UNIQUE,
    total_sales DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_expenses DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    daily_cash DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    cumulative_cash DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Product Daily Summary Table
```sql
CREATE TABLE product_daily_summary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    product_id INT NOT NULL,
    sales DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    expenses DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    cash DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_product_date (date, product_id)
);
```

---

## API Endpoints Recommendation

### Sales Endpoints
```
POST   /api/sales/daily          - Create/Update daily sales for a product
GET    /api/sales/daily/:date    - Get all sales for a specific date
GET    /api/sales/product/:id    - Get sales history for a product
```

### Expense Endpoints
```
POST   /api/expenses/daily           - Create/Update daily expense
GET    /api/expenses/daily/:date     - Get all expenses for a specific date
GET    /api/expenses/types           - Get all expense types
GET    /api/expenses/product/:id     - Get expense history for a product
```

### Summary Endpoints
```
GET    /api/summary/daily/:date              - Get daily summary with calculations
GET    /api/summary/product/:id/:date        - Get product summary for a date
GET    /api/summary/range/:start/:end        - Get summary for date range
```

---

## Frontend Display Best Practices

### Expense Display Logic
```javascript
// Only show expense fields that have values
const displayExpenses = (expenses) => {
  return expenses
    .filter(expense => expense.amount > 0)
    .map(expense => ({
      name: expense.type_name,
      amount: expense.amount,
      category: expense.category
    }));
};

// Group expenses by category for better organization
const groupedExpenses = groupBy(displayExpenses, 'category');
```

### Calculation Functions
```javascript
// Calculate product daily cash
const calculateProductCash = (product) => {
  return product.sales - product.total_expenses;
};

// Calculate today's total cash
const calculateTodayCash = (products) => {
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0);
  const totalExpenses = products.reduce((sum, p) => sum + p.total_expenses, 0);
  return totalSales - totalExpenses;
};

// Calculate cumulative cash
const calculateCumulativeCash = (yesterdayCash, todayCash) => {
  return yesterdayCash + todayCash;
};
```

---

## Validation Rules

1. **Sales Amount**: Must be >= 0
2. **Expense Amount**: Must be > 0 (don't save zero expenses)
3. **Date**: Cannot be future date
4. **Product**: Must be active product
5. **Expense Type**: Must be valid and active expense type

---

## Notes for Implementation

1. **Dynamic Expense Form**: Build form dynamically based on active expense types
2. **Auto-calculation**: Implement real-time calculation before submission
3. **Sparse Data Handling**: Only store expenses with values > 0
4. **Historical Data**: Maintain audit trail for all changes
5. **Performance**: Index on date and product_id for fast queries
6. **Flexibility**: Easy to add/remove expense types without code changes

---

## Additional Considerations

- Implement soft deletes for products and expense types
- Add user authentication and tracking (who entered the data)
- Consider adding exchange rate table for currency conversion
- Implement data export functionality (Excel, PDF)
- Add reporting and analytics features
- Consider caching for frequently accessed summaries
