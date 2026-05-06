<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into **HabitFlow**, a React + Vite habit-tracking application. Here is a summary of every change made:

- **`src/main.jsx`** — PostHog is initialized with `posthog.init()` using environment variables, and the app is wrapped in `<PostHogProvider>` so that `usePostHog()` is available throughout the component tree.
- **`src/App.jsx`** — `usePostHog()` is called in the root `App` component. Nine analytics events are captured at the exact moment each user action occurs (in event handlers, not in effects).
- **`.env`** — `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN` and `VITE_PUBLIC_POSTHOG_HOST` keys were added (values are never committed to source control via `.gitignore`).
- **`package.json`** — `posthog-js` and `@posthog/react` were installed as production dependencies.

## Tracked events

| Event | Description | File |
|---|---|---|
| `habit_created` | Fired when a user creates a new habit via the HabitForm modal | `src/App.jsx` |
| `habit_completed` | Fired when a user marks a habit as done for a given day | `src/App.jsx` |
| `habit_uncompleted` | Fired when a user unchecks a previously completed habit | `src/App.jsx` |
| `habit_edited` | Fired when a user saves edits to an existing habit | `src/App.jsx` |
| `habit_deleted` | Fired when a user confirms deletion of a habit | `src/App.jsx` |
| `daily_goal_reached` | Fired when the user completes enough habits to meet their daily goal for the first time that day | `src/App.jsx` |
| `settings_saved` | Fired when the user saves changes in the Settings panel | `src/App.jsx` |
| `filter_changed` | Fired when the user clicks one of the habit filter buttons (All, Pending, Done, Streak 2+) | `src/App.jsx` |
| `stats_viewed` | Fired when the user navigates to the Statistics page | `src/App.jsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/402410/dashboard/1523486
- **Habit Creation Over Time** (line chart): https://us.posthog.com/project/402410/insights/e1pKJvI5
- **Habit Completions vs Uncompletions** (line chart): https://us.posthog.com/project/402410/insights/3sIJglWa
- **Daily Goal Achievement** (bar chart): https://us.posthog.com/project/402410/insights/NzjtNhZw
- **Habit Creation to Goal Completion Funnel**: https://us.posthog.com/project/402410/insights/FSCR661l
- **Habit Filter Usage Breakdown** (bar chart by filter value): https://us.posthog.com/project/402410/insights/E2Ry6YSX

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
