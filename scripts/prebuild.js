const { compileScripts } = require('./compileScripts');
const { generateKeys } = require('./generateKeys');

// Precompile required scripts
compileScripts();

// Generate and save keys for JWT
generateKeys().then(_ => false);