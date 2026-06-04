---
name: testing-react19-app
description: Test the React 19 migrated app end-to-end. Use when verifying React 19 patterns (ref-as-prop, Context-as-provider) work correctly after migration.
---

# Testing the React 19 App

## Prerequisites

- Node.js installed
- `npm install` run in the repo root

## Starting the Dev Server

```bash
cd /home/ubuntu/repos/congenial-octo-rotary-phone
npm start
```

The app runs on `http://localhost:3000` by default (CRA dev server).

If port 3000 is already in use, kill the existing process first:
```bash
lsof -ti:3000 | xargs kill -9
```

## App Structure

- **LoginPage** (unauthenticated state): Email + Password form with validation
- **Dashboard** (authenticated state): Tabs (Overview, Settings), theme toggle, logout
- **Auth**: Any email + password combination works (mock auth, sets user to "John Doe")

## Key Test Flows

### 1. Ref Forwarding (ref-as-prop pattern)

**Action:** Submit the login form with empty fields.

**Expected:** 
- "Email is required" and "Password is required" error messages appear
- Email input receives focus (cursor appears in email field)

**Why this matters:** The Input component accepts `ref` as a regular prop (React 19). If ref forwarding is broken, `emailRef.current?.focus()` won't work.

### 2. Context as Provider (AuthContext)

**Action:** Enter any email and password, submit the form.

**Expected:**
- Dashboard renders with "Hello, John Doe!" in the Welcome card
- "Dashboard" heading visible
- Overview tab active by default

**Why this matters:** AuthContext uses `<AuthContext value={...}>` instead of `<AuthContext.Provider>`. If broken, user would be null and show "Hello, Guest!".

### 3. Context as Provider (ThemeContext)

**Action:** Click "Settings" tab, then click "Toggle Theme".

**Expected:**
- Settings tab shows "Current theme: light" initially
- After toggle, shows "Current theme: dark"

**Why this matters:** ThemeContext uses `<ThemeContext value={...}>`. Theme state must propagate through the new provider pattern.

### 4. Logout (Context state management)

**Action:** Click "Logout" button in header.

**Expected:** Returns to LoginPage with empty form.

## Build & Test Verification

```bash
npm run build    # Should produce optimized bundle with no errors
npm test         # Should pass (tests LoginPage renders)
```

## Common Issues

- If the app shows a blank page, check browser console for React errors about refs or context — this might indicate an incomplete migration.
- If "Hello, Guest!" appears instead of "Hello, John Doe!", the AuthContext provider pattern might be broken.
- Port conflicts: The dev server defaults to port 3000. Kill existing processes if needed.

## Devin Secrets Needed

None — this app uses mock authentication with no external services.
