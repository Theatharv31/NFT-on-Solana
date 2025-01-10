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

import {Connection, LAMPORTS_PER_SOL, clusterApiUrl} from "@solana/web3.js";

// for intereacting with metaplex we require umi
import {
    generateSigner,
    keypairIdentity,
    percentAmount,
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

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi, {
  mint: collectionMint,
  name: "My Collection",
  symbol: "MC",
  uri: "https://raw.githubusercontent.com/solana-developers/professional-education/main/labs/sample-nft-collection-offchain-data.json",
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
});
await transaction.sendAndConfirm(umi);

const createCollectionNft = await fetchDigitalAsset(
    umi,
    collectionMint.publicKey
);

console.log("created collection");

console.log(
    `Created Collection 📦! Address is ${getExplorerLink(
      "address",
      createCollectionNft.mint.publicKey,
      "devnet"
    )}`
  );

