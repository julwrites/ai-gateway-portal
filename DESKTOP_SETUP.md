# AI Gateway Portal Desktop App Setup

This guide explains how to set up and run the AI Gateway Portal as a desktop application using Tauri 2.0.

## Prerequisites

Before you can build and run the desktop app, you'll need to install the following dependencies:

1. **Rust and Cargo**: Required for compiling the Tauri desktop wrapper
   - Install from [https://www.rust-lang.org/tools/install](https://www.rust-lang.org/tools/install)
   - Verify installation with: `rustc --version` and `cargo --version`

2. **System Dependencies**: Tauri requires various system libraries depending on your OS

   - **macOS**:
     - Install Xcode Command Line Tools: `xcode-select --install`
     - Homebrew is recommended: [https://brew.sh/](https://brew.sh/)

   - **Windows**:
     - Microsoft Visual C++ (MSVC)
     - WebView2 (included with Windows 11 and recent Windows 10 updates)

   - **Linux**:
     ```bash
     # Debian/Ubuntu
     sudo apt update
     sudo apt install libwebkit2gtk-4.0-dev \
         build-essential \
         curl \
         wget \
         libssl-dev \
         libgtk-3-dev \
         libayatana-appindicator3-dev \
         librsvg2-dev
     ```

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

   If you encounter dependency conflicts during installation, you can use one of these solutions:
   ```bash
   # Option 1: Force installation (may cause issues if dependencies are incompatible)
   npm install --force
   
   # Option 2: Use legacy peer dependencies behavior (recommended)
   npm install --legacy-peer-deps
   ```

2. **Build Tauri App**:
   ```bash
   # Development mode (with hot reloading)
   npm run desktop
   
   # Production build
   npm run tauri build
   ```

## Development Workflow

### Web vs Desktop Development

This project is structured as a dual-target application that can run as both:

- A traditional Next.js web application (using Next.js API routes)
- A Tauri desktop application (using Rust for backend functionality)

The application automatically detects whether it's running in desktop or web mode and uses the appropriate APIs.

### Key Files

- `src/lib/tauri-api.ts`: API bridge to handle both web and desktop scenarios
- `src-tauri/`: Contains all Tauri-specific code and configuration

### Desktop-specific Features

When running as a desktop app:

1. The application uses Rust-based Tauri commands instead of Next.js API routes
2. The application runs as a standalone desktop window
3. API calls are proxied through Tauri's IPC bridge

## Customizing the Desktop App

### Icons

Replace the placeholder icons in `src-tauri/icons/` with your actual application icons:

- `32x32.png`: 32×32 icon for Windows
- `128x128.png`: 128×128 icon for Linux
- `128x128@2x.png`: 256×256 high-DPI icon for Linux
- `icon.icns`: macOS icon bundle
- `icon.ico`: Windows icon bundle

### Configuration

- `src-tauri/tauri.conf.json`: Main configuration file for the desktop app
  - Window settings (size, title, etc.)
  - App metadata
  - Security settings

## Troubleshooting

### Common Issues

1. **Missing System Dependencies**:
   - Error messages will usually indicate which dependency is missing
   - Install the required system packages as mentioned in Prerequisites

2. **Rust Compilation Errors**:
   - Make sure your Rust toolchain is up to date: `rustup update`
   - Check the error messages for specific issues

3. **JavaScript/TypeScript Integration Issues**:
   - Check that the Tauri API is properly imported in client-side code
   - Verify that the invoke commands match the registered commands in `main.rs`

4. **API Connectivity**:
   - If the app starts but API calls fail, check that the commands are properly registered in `main.rs`
   - Verify the arguments are correctly formatted between JS and Rust
