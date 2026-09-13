# Reports, notifications, and side-panel polish

## Goal
Make side panels and chat visually correct, make Reports easier to read, and ensure important user actions create persistent notifications that appear in the top navigation.

## Changes
- Remove the extra close control from the shared slide-in panel so every panel shows one accessible X button.
- Correct user-message foreground styling in the compact AI chat so text remains readable in light and dark themes.
- Replace the current report flow visualization with finance-appropriate, responsive charts: cash-flow trend, income-versus-spending comparison, and category allocation with percentages. Keep date-range and account filters connected to every chart and summary.
- Replace the mocked header notification count with live unread data from the user's notification records.
- Add a reusable action-notification helper and connect it to successful major user actions across accounts, transactions, assets, debts/payments, investments/contributions, automations, shared-account actions, referrals, reports, settings, and AI conversations.
- Prevent notification-management actions from recursively generating more notifications, and refresh the header badge immediately after create/read/delete operations.
- Fix the existing Investments type error discovered during validation.

## Technical details
- Reuse the existing notification table and query cache; no new data store is needed.
- Keep notifications user-scoped through the existing signed-in user policies.
- Use semantic theme tokens and existing Recharts components, with accessible labels and compact mobile layouts.
- Validate the production build, then verify reports, the notification badge, side panels, and compact chat at desktop and mobile sizes.
