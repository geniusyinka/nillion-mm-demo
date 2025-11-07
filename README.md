# Passwordless Notes Demo

A secure, passwordless notes application built with **MetaMask** and **Nillion**. Users authenticate using their Ethereum wallet signatures instead of traditional passwords, and their notes are stored securely on Nillion's privacy-preserving network.

## Features

- 🔐 **Passwordless Authentication** - Sign in with MetaMask wallet
- 📝 **Secure Notes** - Create, read, update, and delete encrypted notes
- 🔒 **Privacy-First** - Notes stored on Nillion's decentralized network
- ⚡ **Web3 Native** - Built for the decentralized web

## Prerequisites

- Node.js 18+ and pnpm
- MetaMask browser extension installed
- A MetaMask wallet with an account

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

## Usage

1. **Connect MetaMask** - Click "Connect MetaMask" on the login screen
2. **Authenticate** - Sign the authentication message with your wallet
3. **Create Notes** - Start creating and managing your secure notes
4. **Access Anytime** - Your notes are tied to your wallet, accessible from anywhere

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool
- **Nillion NUC SDK** - Passwordless authentication
- **Nillion Secret Vaults** - Secure data storage
- **MetaMask** - Wallet provider
- **TypeScript** - Type safety

## How It Works

1. User connects MetaMask wallet
2. Nillion NUC SDK generates a Decentralized Identifier (DID) from wallet signature
3. User authenticates with Nillion network using NUC credentials
4. Notes are stored encrypted in Nillion Secret Vaults
5. Only the authenticated user can access their notes

## Project Structure

```
src/
├── components/
│   ├── notes/          # Note editor and list components
│   └── layouts/       # App header and footer
├── context/            # React context providers
├── hooks/              # Custom React hooks
│   └── notes/          # Notes-specific hooks
├── screens/            # Main app screens
└── config.ts           # Nillion network configuration
```

## Learn More

- [Nillion Documentation](https://docs.nillion.com)
- [NUC SDK Reference](https://docs.nillion.com/nuc)
- [MetaMask Developer Docs](https://docs.metamask.io)

## License

MIT

