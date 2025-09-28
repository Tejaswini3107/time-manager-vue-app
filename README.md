# Time Manager UI - Vue.js Version

This project has been successfully converted from React TypeScript to Vue.js with Vue Single File Components.

## Features

- **Vue 3** with Composition API
- **Vue Single File Components** (.vue files)
- **Chart.js** for interactive charts and graphs
- **Tailwind CSS** for styling
- **Lucide Vue Next** for icons
- **Vite** for build tooling

## Project Structure

```
src/
├── main.js              # Vue app entry point
├── App.vue              # Main application component
├── components/          # Vue components
│   ├── User.vue         # User management component
│   ├── ClockManager.vue # Time clock functionality
│   ├── WorkingTimes.vue # Working times display
│   ├── WorkingTime.vue  # Time entry form
│   ├── ChartManager.vue # Analytics charts
│   ├── DashboardCharts.vue # Dashboard charts
│   ├── MetricsCards.vue # Key metrics display
│   ├── ActivityFeed.vue # Activity feed
│   ├── StatusIndicators.vue # System status
│   └── ui/              # Reusable UI components
│       ├── button.vue
│       ├── card.vue
│       ├── card-header.vue
│       ├── card-title.vue
│       ├── card-content.vue
│       ├── badge.vue
│       ├── input.vue
│       ├── label.vue
│       └── utils.js
└── index.css            # Global styles
```

## Key Changes from React

1. **Framework**: React → Vue 3
2. **Language**: TypeScript → JavaScript
3. **File Extensions**: .tsx → .vue
4. **State Management**: useState → ref/reactive
5. **Lifecycle**: useEffect → onMounted/onUnmounted
6. **Props**: TypeScript interfaces → Vue props
7. **Icons**: lucide-react → lucide-vue-next
8. **Templates**: JSX → Vue template syntax

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production

## Dependencies

- **vue**: ^3.4.0
- **vue-router**: ^4.2.0
- **lucide-vue-next**: ^0.400.0
- **chart.js**: ^4.4.0
- **vue-chartjs**: ^5.3.0
- **recharts**: ^2.15.2
- **sonner**: ^2.0.3
- **class-variance-authority**: ^0.7.1
- **clsx**: *
- **tailwind-merge**: *

## Development Dependencies

- **@vitejs/plugin-vue**: ^5.0.0
- **vite**: 6.3.5
- **tailwindcss**: ^3.4.0
- **autoprefixer**: ^10.4.0
- **postcss**: ^8.4.0