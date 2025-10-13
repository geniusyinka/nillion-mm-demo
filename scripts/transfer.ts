import { DirectSecp256k1Wallet } from "@cosmjs/proto-signing";
import { SigningStargateClient } from "@cosmjs/stargate";
import { hexToBytes } from "@noble/hashes/utils.js";
import { Command } from "commander";

// Define network constants
const DENOM = "unil";
const ADDRESS_PREFIX = "nillion";
const NIL_TO_UNIL = 1_000_000;

type TransferOptions = {
  rootKey: string;
  amount: string;
  rpcEndpoint: string;
};

async function runTransfer(recipientAddress: string, options: TransferOptions): Promise<void> {
  // ✅ ADD: Convert amount from NIL to unil. Using Number is acceptable for
  // many cases, but for high-precision values, a BigInt or a dedicated
  // decimal library would be more robust to prevent floating-point errors.
  const amountInUnil = (Number(options.amount) * NIL_TO_UNIL).toString();

  console.log("🚀 Starting fund transfer...");

  try {
    // 1. Create a wallet instance from the private key.
    const privateKeyBytes = hexToBytes(options.rootKey);
    const wallet = await DirectSecp256k1Wallet.fromKey(privateKeyBytes, ADDRESS_PREFIX);
    const [senderAccount] = await wallet.getAccounts();
    console.log(`👤 Sender address: ${senderAccount.address}`);

    // 2. Create a signing client to connect to the chain.
    const client = await SigningStargateClient.connectWithSigner(options.rpcEndpoint, wallet);
    console.log(`✅ Connected to nilchain at ${options.rpcEndpoint}`);

    // 3. Define the transaction details.
    const amount = {
      denom: DENOM,
      amount: amountInUnil,
    };
    const fee = {
      amount: [],
      gas: "200000",
    };
    const memo = "Dev funds transfer";

    console.log(`💸 Attempting to send ${options.amount} NIL (${amountInUnil} ${DENOM}) to ${recipientAddress}...`);

    // 4. Sign and broadcast the transaction.
    const result = await client.sendTokens(senderAccount.address, recipientAddress, [amount], fee, memo);

    // 5. Log the result.
    console.log("\n🎉 Transfer successful!");
    console.log(`🔗 Transaction Hash: ${result.transactionHash}`);
    console.log(`⛽ Gas Used: ${result.gasUsed}`);
  } catch (error) {
    console.error("\n❌ Transfer failed!");
    console.error(error);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const program = new Command();

  program.name("fund-transfer").description("A CLI script to transfer funds on the Nillion network.").version("1.0.0");

  program
    .argument("<address>", "The bech32 address of the recipient")
    .option(
      "--root-key <key>",
      "Private key of the sender",
      "97f49889fceed88a9cdddb16a161d13f6a12307c2b39163f3c3c397c3c2d2434",
    )
    .option("--amount <number>", "Amount to send in NIL", "50")
    .option("--rpc-endpoint <url>", "The RPC endpoint for the Nillion chain", "http://localhost:40648")
    .action(runTransfer);

  await program.parseAsync(process.argv);
}

await main();
