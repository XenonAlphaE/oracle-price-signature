const express = require("express");
const fs = require("fs");
const path = require("path");
const nacl = require("tweetnacl");
const axios = require("axios");
const BN = require("bn.js");
const { Keypair } = require("@solana/web3.js");
const encodePhase = require('../utils/encodePhase')

const router = express.Router();
const KEYSTORE_DIR = path.join(process.cwd(), "seeds");
const solana_price_url = "https://www.binance.com/api/v3/ticker/price?symbol=SOLUSDT";


// helper: create fixed-size padded symbol buffer
function toPaddedSymbol(symbolStr, padChar = "_", length = 8) {
  const buf = Buffer.alloc(length, padChar.charCodeAt(0)); // fill with padChar
  buf.write(symbolStr); // write actual symbol
  return buf;
}

// ---- Simple in-memory cache ----
let cachedResult = null;
let cacheExpiry = 0; // epoch seconds
const CACHE_TTL = 10; // seconds


router.post("/price", async (req, res) => {
  const { symbol = "SOL", decimals = 6 } = req.body; // allow symbol input, default to SOL

  const tokenSymbol = toPaddedSymbol(symbol); // e.g. "SOL_____" length = 8

  try {
    const nowSec = Math.floor(Date.now() / 1000);

    // If cache still valid, return cached result
    if (cachedResult && nowSec < cacheExpiry) {
      return res.json(cachedResult);
    }



    // Load oracle keypair
    const oracleFilePath = path.join(KEYSTORE_DIR, "solseed.txt");
    const encrypted = fs.readFileSync(oracleFilePath).toString()
    const decrypted = encodePhase.decryptPhase(
      process.env.ENCODE_SALT,
      encrypted
    );
    const oracleSecret = new Uint8Array(JSON.parse(decrypted));
    const oracleKeypair = Keypair.fromSecretKey(oracleSecret);


    // Fetch price from Binance
    const { data } = await axios.get(solana_price_url);
    const priceUsd = parseFloat(data.price); // e.g., 25.123
    const scale = Math.pow(10, decimals);
    const scaledPrice = Math.floor(priceUsd * scale);

    const timestamp = nowSec;

    // Canonical message
    const msg = Buffer.concat([
      Buffer.from("SOL_PRICE_v1"),
      tokenSymbol,
      new BN(scaledPrice).toArrayLike(Buffer, "le", 8),
      new BN(timestamp).toArrayLike(Buffer, "le", 8),
    ]);

    // Sign with oracle
    const signature = nacl.sign.detached(msg, oracleKeypair.secretKey);

    // Build result
    cachedResult = {
      symbol,
      decimals,
      priceUsd,
      scaledPrice,
      timestamp,
      tokenSymbol: tokenSymbol.toString(),
      msg: Array.from(msg),            // return raw bytes
      signature: Array.from(signature),// 64-byte sig
      pubkeyBytes: Array.from(oracleKeypair.publicKey.toBytes()), // [u8; 32]
      pubkeyBase58: oracleKeypair.publicKey.toBase58()
    };

    // Set expiry
    cacheExpiry = nowSec + CACHE_TTL;

    res.json(cachedResult);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
