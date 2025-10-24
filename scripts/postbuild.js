import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function copyRecursive(src, dest) {
  try {
    mkdirSync(dest, { recursive: true });
  } catch (err) {
    // Directory might already exist
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying build files from dist/public to server/public...');
copyRecursive('dist/public', 'server/public');
console.log('Build files copied successfully!');
