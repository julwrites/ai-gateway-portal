# AI Gateway Portal

An administrative interface for LiteLLM, packaged as a Tauri desktop application.

## Features

- Team management
- User management
- API key management
- Model management
- Configurable API Base URL and API Key through the Tauri menu bar

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri)
- [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites)

### Setup

```bash
# Install dependencies
npm install

# Start the Next.js development server
npm run dev

# OR start the Tauri development with the Next.js server
npm run tauri dev
```

### Building for Production

```bash
# Build the Next.js app and create the Tauri desktop application
npm run tauri build
```

This will create platform-specific binaries in the `src-tauri/target/release` directory.

## Configuration

When running as a desktop application, the API Base URL and API Key can be configured through the "Configuration" menu in the menu bar.

For development or when running the web app directly, these values can be set using environment variables:

```
NEXT_PUBLIC_API_BASE_URL=http://your-api-url
LITELLM_API_KEY=your-api-key
```

You can create a `.env` file at the root of the project with these values during development.

## Project Structure

- `src/`: Next.js frontend code
  - `app/`: Next.js app router components and pages
  - `components/`: Reusable React components
  - `lib/`: Utility functions and configuration
  - `types/`: TypeScript type definitions
- `src-tauri/`: Tauri backend code
  - `src/`: Rust source code for the desktop app
  - `Cargo.toml`: Rust dependencies
  - `tauri.conf.json`: Tauri configuration

## License

See the LICENSE file in the repository.
