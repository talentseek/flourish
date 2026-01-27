# Plan: Custom Auth UI (Better Auth)

## Goal
Implement a premium, custom-designed authentication flow (`/login`, `/sign-up`, `/forgot-password`) using Better Auth hooks and ShadCN components, replacing the Clerk hosted pages.

## Context
-   **Stack**: Next.js App Router, ShadCN UI, Tailwind CSS.
-   **Auth**: Better Auth (`auth-client` hooks).
-   **Constraint**: Migrated users (from Clerk) do not have passwords. They **must** use "Forgot Password" or "Magic Link" to set a new password. The UI must guide them clearly.

## Design Requirements
-   **Aesthetic**: "Flourish Premium" — Glassmorphism, clean typography, subtle animations.
-   **Layout**: Centered card layout with a high-quality background (e.g., abstract mesh or map-themed).
-   **Feedback**: Use `sonner` for success/error toasts.

## Components Needed
-   `LoginForm`: Handles Email/Password + "Forgot Password" link.
-   `SignUpForm`: Name, Email, Password.
-   `ForgotPasswordForm`: Request reset link.
-   `ResetPasswordForm`: Enter new password (from link).

## Architecture

### 1. Routes
-   `/login`: Main entry point. Tab switcher for "Sign In" / "Sign Up"? Or distinct pages. -> **Distinct pages** are better for SEO and deep linking, but a toggle is smoother UX. let's go with **`/auth`** layout that handles shared background.
    -   `src/app/(auth)/layout.tsx`: Shared layout with background.
    -   `src/app/(auth)/login/page.tsx`: Login form.
    -   `src/app/(auth)/sign-up/page.tsx`: Signup form.
    -   `src/app/(auth)/forgot-password/page.tsx`: Request reset.
    -   `src/app/(auth)/reset-password/page.tsx`: Handle token.

### 2. Implementation Steps

#### Phase 1: Infrastructure & Components
- [ ] **Check Components**: Ensure `Card`, `Input`, `Button`, `Label`, `Tabs` are installed (ShadCN).
- [ ] **Layout**: Create `src/app/(auth)/layout.tsx` with a stunning background.

#### Phase 2: Forms
- [ ] **Login Page**:
    -   Use `authClient.signIn.email`.
    -   Error handling (toast).
    -   "Forgot Password?" link.
- [ ] **Sign Up Page**:
    -   Use `authClient.signUp.email`.
    -   Collect `name` (required for our schema).
- [ ] **Forgot Password**:
    -   Use `authClient.sendVerificationEmail` or `forgetPassword` (check Better Auth docs for specific function).
    -   **Crucial for Migrated Users**: Add a callout: "Migrated from the old system? Reset your password here."

#### Phase 3: Switchover (Frontend)
- [ ] **Middleware Update**: Redirect unauthenticated users to `/login` instead of Clerk's URL.
- [ ] **Remove Clerk**: Delete `sign-in/` and `sign-up/` Clerk folders.
- [ ] **Navbar**: Update "Sign Out" button to use `authClient.signOut`.

## Verification
-   **Test Login**: Test with `mjcbeckett@gmail.com` (migrated) -> Should fail password -> Use "Forgot Password" flow -> Verify email received (mocked or real) -> Set new password -> Login success.
-   **Test Signup**: Create new user.
