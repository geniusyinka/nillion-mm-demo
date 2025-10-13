# The "All The Things" Demo ✨

A Whirlwind Tour of NilDb/Nucs/SecretVaults Phase 2 (drafted by Claude)

## Welcome, Nillionaire! 🚀

Hey there! This is an internal, "batteries-included" demo designed to showcase the new Phase 2 features of `secretvaults-ts` in a (mostly) real-world application. It brings together all the pieces of the nildb phase 2 stack to demonstrate a builder's journey.

We've wrapped most of the `secretvaults-ts` SDK calls inside custom React Query hooks (e.g., `useProfile`, `useCreateCollectionMutation`). This architecture keeps Ui components clean and gives us things like caching, automatic refetching, and loading state management for free.

The data flow is a simple, standard Crud (Create, Read, Update, Delete) pattern for a "builder" profile and their "collections" and "data". It's a bit contrived, but hopefully it hits all the key integration points you'd need to build a full-fledged dApp using EIP-712 signing.

## Getting Started 🛠️

Follow these steps to get the demo up and running on your local machine.

### 1. Install Dependencies

First things first, let's get all the project dependencies installed using `pnpm`.

```bash
pnpm install
```

### 2. Spin Up the Backend

This demo runs against a local stack defined by [docker-compose.yml](./infra/docker-compose.yml) to bring everything online, including `nilchain`, `nilauth`, `nildb` nodes, databases and a proxy. Pull the latest images first, just to be safe.

```bash
# Pull the latest images
docker compose -f infra/docker-compose.yml pull

# Start all services and detach
docker compose -f infra/docker-compose.yml up -d
```

### 3. Fund Your Payment Wallet

You'll need a Keplr wallet to pay for your subscription in the demo. Grab your Keplr address and use our handy script to send yourself some devnet `NIL` tokens.

```bash
pnpm tsx scripts/transfer.ts <YOUR_KEPLR_ADDRESS>

# Example:
# pnpm tsx scripts/transfer.ts nillion1z8w0zqzj3q9z3z8w0zqzj3q9z3z8w0zqzj3
```
This will send 50 `NIL` by default, which is more than enough.

### 4. Run the App!

Time for the main event! Launch the Vite development server.

```bash
pnpm dev
```

### 5. Walk Through the App Experience

Launch your browser and go to `http://localhost:5173` (or whatever port Vite tells you).
You'll be greeted by a login screen. Connect both your MetaMask (for identity) and Keplr (for payments) wallets.
Once you're connected, the app will take over! It'll automatically: 

   1. Check for an active subscription.
   2. Since you don't have one, it will kick off the payment flow, prompting you for approval in Keplr and MetaMask.
   3. Once payment is validated, it will register your builder profile.

### 6. Explore

Voilà! You're ready to explore. Click around the tabs to:
   
- 📚 Collections: Create and delete a pre-defined collection.	
- ➕ Create Data: Add some secret records.	
- 🔍 Read Data: See the data you've added.	
- ❓ Queries: Run a pre-defined query against your secret data.
