/**
 * Deployment script to generate a new key pair for the server
 * Saves the keys in the server's directory "./keys"
 * Keys are being used to sign JWT tokens
 */

const fs = require('fs');
const path = require('path');

async function generateKeys() {
    // Import the compiled generateRSAKeyPair function
    const { generateRSAKeyPair } = require('./compiled/rsa-keypair');

    try {
        // Generate the key pair
        const { publicKey, privateKey } = await generateRSAKeyPair();

        // Define the keys directory
        const keysDir = path.join(__dirname, '../keys');

        // Ensure the keys directory exists
        if (!fs.existsSync(keysDir)) {
            fs.mkdirSync(keysDir);
        }

        // Write the public key to a file
        fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey, 'utf8');

        // Write the private key to a file
        fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey, 'utf8');

        console.log('Keys have been saved successfully!');
    } catch (error) {
        console.error('Error generating or saving keys:', error);
    }
}

// Export the generateKeys function
module.exports = {
    generateKeys
}