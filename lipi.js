const fs = require('fs');
const path = require('path');
const compiler = require('./compile');

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: lipi <file.lipi>');
  process.exit(1);
}

const filePath = args[0];
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const code = fs.readFileSync(filePath, 'utf8'); 
if (typeof compiler.compile === 'function') {
  const jsCode = compiler.compile(code); 
  compiler.runner(jsCode);
} else {
  require('./compile');
}
