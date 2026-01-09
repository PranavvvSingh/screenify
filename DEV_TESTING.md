# Development Testing Guide

## Testing UI and Components During Development

This guide explains how to test candidate page UI and components while the full authentication and invite flow is still being implemented.

---

## The Solution: Dev Preview Pages

We've created standalone preview pages at `/app/dev-preview/` that:
- ✅ Allow testing UI and styling without authentication
- ✅ Work independently from production pages
- ✅ No complex setup required
- ✅ Only accessible in development mode

---

## How to Use

### Access Preview Pages

Simply navigate to the preview URLs directly in your browser:

- **Preview Home:** `http://localhost:3000/dev-preview`
- **Candidate Dashboard Preview:** `http://localhost:3000/dev-preview/candidate-dashboard`
- **Quiz Page Preview:** `http://localhost:3000/dev-preview/quiz`
- **Invite Page Preview:** `http://localhost:3000/dev-preview/invite`

These pages display the UI with sample data and do not require authentication.

---

## What Preview Pages Are For

**Use preview pages for:**
- Testing component styling and layout
- Iterating on UI design quickly
- Verifying responsive behavior
- Checking theme/color consistency
- Component-level testing

**Preview pages do NOT:**
- Connect to real database
- Require authentication
- Process actual business logic
- Store or retrieve real data
- Test the complete user flow

---

## File Structure

```
/app/dev-preview/
├── page.tsx                    # Preview home page with links
├── candidate-dashboard/
│   └── page.tsx               # Candidate dashboard preview
├── quiz/
│   └── page.tsx               # Quiz page preview
└── invite/
    └── page.tsx               # Invite page preview
```

All preview pages are standalone and can be modified independently for testing purposes.

---

## Testing Production Pages

To test the actual production flow with authentication and database:

1. **Implement the full invite system** with real tokens and database records
2. **Create test data** using database seeding or admin tools
3. **Use proper test accounts** with complete role setup
4. **Follow the actual user journey** from invite link to completion

Preview pages are **only for UI testing**, not for testing the complete application flow.

---

## Benefits of This Approach

✅ **Simple** - No complex OAuth or localStorage logic needed
✅ **Fast** - Direct access without authentication
✅ **Isolated** - Changes to preview pages don't affect production code
✅ **Focused** - Ideal for UI/component testing during development
✅ **Safe** - Only works in development mode

---

**Questions?** This system allows quick UI iteration while keeping production code clean and focused on real user flows.
