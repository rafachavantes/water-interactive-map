# Water Infrastructure Interactive Map

An interactive mapping application built with Next.js, shadcn/ui, and Leaflet
for canal companies to visualize and manage water infrastructure.

## Features

### 🗺️ Interactive Map

- Powered by Leaflet with OpenStreetMap tiles
- Responsive design that works on all screen sizes
- Smooth zoom and pan interactions

### 🎛️ Layer Management

- Left sidebar with accordion-style layer filters
- Hierarchical organization of map elements by type
- Toggle visibility of different infrastructure categories:
  - Rides
  - Meters
  - Pivots
  - Pumps
  - Land areas
  - Hazards
  - Maintenance zones
  - Other infrastructure

### 📋 Element Details Panel

- Floating panel that appears when selecting map elements
- Editable element properties:
  - Name and type
  - Color coding
  - Farm assignment
  - Status tracking
- Collapsible sections for:
  - Basic details
  - Live data integration
  - Files & links
  - Notes
  - Privacy settings

### 🎨 Drawing Tools

- Figma-style drawing toolbar at the bottom
- Four drawing tools:
  - **Line Tool**: Draw straight lines for pipelines and connections
  - **Draw Tool**: Freehand drawing for irregular shapes
  - **Area Tool**: Rectangle tool for defining zones and boundaries
  - **Point Tool**: Add precise coordinate markers

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Maps**: Leaflet with React Leaflet
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd water-interactive-map
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── globals.css     # Global styles with Tailwind
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main application page
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── InteractiveMap.tsx    # Main map component
│   ├── LayerFilters.tsx      # Left sidebar filters
│   ├── ElementDetailsPanel.tsx # Floating details panel
│   └── DrawingTools.tsx      # Bottom drawing toolbar
├── lib/                # Utilities and data
│   ├── utils.ts        # Utility functions
│   └── mapData.ts      # Sample data and constants
└── types/              # TypeScript type definitions
    └── index.ts        # Shared interfaces
```

## Usage

### Adding Map Elements

1. Click on any drawing tool at the bottom
2. Draw or place elements on the map
3. Click on placed elements to edit their properties

### Managing Layers

1. Use the left sidebar to toggle layer visibility
2. Expand accordion sections to see subcategories
3. Use the search bar to find specific elements

### Editing Elements

1. Click on any map marker to select it
2. The details panel will appear on the right
3. Click the edit button to modify properties
4. Save changes when done

## Customization

### Adding New Element Types

1. Update the `MapElement` type in `src/types/index.ts`
2. Add new categories to `layerCategories` in `src/lib/mapData.ts`
3. Update the drawing tools if needed

### Styling

- Modify `src/app/globals.css` for global styles
- Use Tailwind classes for component styling
- Customize shadcn/ui components in `src/components/ui/`

## Documentation

This project has comprehensive documentation for both developers and AI assistants:

| Document | Purpose | Audience |
|----------|---------|----------|
| **CLAUDE.md** | Quick reference & AI guidance | AI assistants, new developers |
| **docs/BUBBLE_IMPLEMENTATION_PLAN.md** | Detailed Bubble.io implementation | Bubble developers |
| **docs/PROJECT_CONTEXT.md** | Session history & decisions | All team members |
| **docs/freehand_draw_investigation_report.md** | Freehand drawing solution | Technical implementers |
| **AGENTS.md** | Next.js architecture rules | Next.js developers |
| **SUPABASE_SETUP.md** | Database setup guide | Backend developers |

**Start Here:**
- **New to project**: Read `CLAUDE.md` → `docs/PROJECT_CONTEXT.md`
- **Implementing Bubble**: Read `docs/BUBBLE_IMPLEMENTATION_PLAN.md`
- **Working with Next.js**: Read `AGENTS.md` + `CLAUDE.md`

## Contributing

1. Read `CLAUDE.md` for project overview and architecture
2. Check `docs/PROJECT_CONTEXT.md` for latest status
3. Create a feature branch: `git checkout -b feature-name`
4. Make your changes and commit: `git commit -m 'Add feature'`
5. Update `docs/PROJECT_CONTEXT.md` with your session summary
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
