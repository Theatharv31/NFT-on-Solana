import {
    createNft,
    fetchDigitalAsset,
    mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from "@solana-developers/helpers";

import {createUmi} from "@metaplex-foundation/umi-bundle-defaults";

import {Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl} from "@solana/web3.js";

// for intereacting with metaplex we require umi
import {
    generateSigner,
    keypairIdentity,
    percentAmount,
    publicKey
  } from "@metaplex-foundation/umi";


const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

//Loaded some sol in umi user acc


await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded user", user.publicKey.toBase58());
 

//Umi / metaplex has its own way of making key-pair using user.secretKey.
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set Up Umi instance for user");

const collectionAddress = publicKey(
    "HPb4FxhjP95Bzker54dCL6wZ3A7eSbcsWQa3JuvLjNHF"
);

console.log("Creating a NFT...");

const mint = generateSigner(umi);


const transaction = await createNft(umi, {
    mint,
    name: "My NFT",
    uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-offchain-data.json",
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
      key: collectionAddress,
      verified: false,
    },
  });

  await transaction.sendAndConfirm(umi);

const createdNft = await fetchDigitalAsset(umi, mint.publicKey);

console.log(
    `🖼️ Created NFT! Address is ${getExplorerLink(
      "address",
      createdNft.mint.publicKey,
      "devnet"
    )}`
  );