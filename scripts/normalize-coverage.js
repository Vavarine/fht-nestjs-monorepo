const fs = require('fs');
const path = require('path');

const lcovPath = path.join(__dirname, '..', 'coverage', 'lcov.info');

if (fs.existsSync(lcovPath)) {
  let content = fs.readFileSync(lcovPath, 'utf8');
  // Replace Windows backslashes with forward slashes
  content = content.replace(/\\/g, '/');
  fs.writeFileSync(lcovPath, content, 'utf8');
  console.log('✅ Coverage paths normalized for SonarCloud');
} else {
  console.log('⚠️  No lcov.info file found');
}
