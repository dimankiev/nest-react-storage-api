// scripts/compileScripts.js
const { execSync } = require('child_process');
const path = require('path');

const filesToCompile = [
    'libs/auth/src/utils/rsa-keypair.ts'
];

const compiledDir = path.join(__dirname, 'compiled');

const compileFiles = (filePaths, outDir) => {
    filePaths.forEach(file => {
        const cmd = `tsc ${file} --outDir ${outDir}`;

        try {
            execSync(cmd);
            console.log(`Compiled ${file} to ${outDir}`);
        } catch (err) {
            const { stdout, stderr } = err;
            console.error(`Error compiling ${file}:\n`, stderr);
        }
    });
};

const compileScripts = () => {
    compileFiles(filesToCompile, compiledDir);
}

// Export the compileScripts function
module.exports = {
    compileScripts
};