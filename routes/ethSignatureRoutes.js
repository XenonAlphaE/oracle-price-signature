const express = require("express");
const path = require("path");
const fs = require("fs");

const { ethers } = require("ethers");
const encodePhase = require('../utils/encodePhase')

const router = express.Router();
const KEYSTORE_DIR = path.join(process.cwd(), "seeds");

let signer;

// Pick your private key file (e.g., privateKey.txt with hex key)
const PRIVATE_KEY_FILE = path.join(KEYSTORE_DIR, "ethseed.txt");
function getSigner() {
    let privateKey;

    if (fs.existsSync(PRIVATE_KEY_FILE)) {
      // Load existing key
      const encrypted = fs.readFileSync(PRIVATE_KEY_FILE, "utf-8").trim();
      privateKey = encodePhase.decryptPhase(process.env.ENCODE_SALT, encrypted)
      console.log("✅ Loaded existing private key");
    } else {
      throw new Error("not found seed eth")
    }
    // ✅ Ensure 0x prefix
    if (!privateKey.startsWith("0x")) {
      privateKey = "0x" + privateKey;
    }
    
    if(!signer){
      signer = new ethers.Wallet(privateKey);
      console.log("👉 Signer address:", signer.address);
    }

  return signer;
}


router.post("/sign", async (req, res) => {
  const { key , tokenPrice, buyAmount, deltaStake  } = req.body; // allow symbol input, default to SOL


  try {
    // Ensure key is valid bytes32
    if (!ethers.isHexString(key, 32)) {
      return res.status(400).json({ error: "Invalid key (must be 32-byte hex)" });
    }


    const messageHash = ethers.solidityPackedKeccak256(
        ["uint256","bytes32", "uint256", "uint256"],
        [tokenPrice, key, buyAmount, deltaStake]
    );
    const signer = getSigner();

    const signature = await signer.signMessage(ethers.getBytes(messageHash));


    res.json({
      address: signer.address,
      signature,
      messageHash,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
