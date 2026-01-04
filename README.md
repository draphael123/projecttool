# CSV Report Combiner

A production-quality Next.js 14 application for combining multiple CSV files into a single report based on a template schema. Built with TypeScript, Tailwind CSS, and shadcn/ui.

> **Latest Update:** All TypeScript errors resolved. Ready for deployment.

**Status:** Latest build includes all TypeScript fixes and @types/papaparse dependency.

## Features

- **Template-based Schema**: Define output structure using a template CSV file
- **Multi-file Upload**: Combine unlimited CSV files
- **Intelligent Instructions**: Natural language parsing that automatically configures your report
- **Auto Column Mapping**: Intelligent header matching using similarity algorithms
- **Data Transforms**: Trim, case conversion, date/number parsing, string replacement
- **Filters**: Filter rows using various operators (equals, contains, greater than, etc.)
- **Deduplication**: Remove duplicates based on composite keys with multiple strategies
- **Derived Fields**: Create new fields using concat, fallback, and math operations
- **Preview Table**: View first 200 rows with pagination
- **Export**: Download merged CSV file
- **Privacy-First**: 100% client-side processing - your data never leaves your device

## 📖 User Guide

For detailed instructions on how to use the tool, see **[USER_GUIDE.md](./USER_GUIDE.md)** - A comprehensive guide with examples, tips, and troubleshooting.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Validation**: Zod
- **CSV Processing**: Papa Parse
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd csv-report-combiner
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

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. **Upload Template CSV**: Navigate to `/builder` and upload a CSV file that defines your desired output schema (column headers)

2. **Upload Input Files**: Upload one or more CSV files to combine. The app will automatically attempt to map columns based on header similarity

3. **Configure Report**: Use the configuration tabs to:
   - **Mapping**: Manually adjust column mappings (template → source)
   - **Transforms**: Apply data transformations (trim, case, parse, replace)
   - **Filters**: Filter rows based on conditions
   - **Dedupe**: Configure deduplication rules (key columns + strategy)
   - **Derived**: Create calculated fields
   - **Output**: Set output options (source file column, column order)

4. **Generate & Preview**: Click "Generate Report" to process the data and preview the first 200 rows

5. **Download**: Click "Download CSV" to save the merged report

## Processing Pipeline

The data processing follows this pipeline:

1. **Parse**: Read and parse all CSV files
2. **Map**: Map source columns to template columns
3. **Transform**: Apply data transformations
4. **Derive**: Calculate derived fields
5. **Filter**: Apply filter conditions
6. **Dedupe**: Remove duplicates based on rules
7. **Output**: Format final output with template column order

## Deployment to Vercel

1. Push your code to GitHub

2. Import your repository in [Vercel](https://vercel.com)

3. Vercel will automatically detect Next.js and configure the build settings

4. Click "Deploy"

The app will be available at `https://your-project.vercel.app`

### Environment Variables

No environment variables are required for the MVP. All processing happens client-side.

## Project Structure

```
.
├── app/
│   ├── builder/          # Builder page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── csv-utils.ts      # CSV parsing and utilities
│   ├── processor.ts      # Data processing pipeline
│   ├── schemas.ts        # Zod validation schemas
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
├── public/               # Static assets
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint configuration included
- Follows Next.js 14 App Router conventions

### Key Concepts

- **Type Safety**: Full TypeScript coverage with Zod validation
- **Client-side Processing**: All CSV processing happens in the browser (no backend required)
- **Component Architecture**: Modular, reusable components using shadcn/ui
- **State Management**: React hooks for local state management

## Limitations & Future Enhancements

### Current Limitations

- Client-side processing only (limited by browser memory)
- Maximum 200 rows shown in preview (full data available for download)
- No authentication or data persistence
- No database (MVP)

### Potential Enhancements

- Server-side processing for large files
- Save/load report configurations
- Export to other formats (Excel, JSON)
- Advanced transformations
- Data validation rules
- Column type detection and conversion
- Multi-format date parsing
- Custom JavaScript expressions for derived fields

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

