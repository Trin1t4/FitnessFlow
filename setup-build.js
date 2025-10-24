import { existsSync, symlinkSync, unlinkSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure server directory exists
const serverDir = resolve(__dirname, 'server');
if (!existsSync(serverDir)) {
  mkdirSync(serverDir, { recursive: true });
}

// Path where server expects to find files
const serverPublicPath = resolve(__dirname, 'server', 'public');

// Path where vite builds files
const distPublicPath = resolve(__dirname, 'dist', 'public');

try {
  // Remove existing symlink or directory if it exists
  if (existsSync(serverPublicPath)) {
    try {
      unlinkSync(serverPublicPath);
    } catch (err) {
      console.log('No symlink to remove, continuing...');
    }
  }

  // Create symlink from server/public -> ../dist/public
  const relativePath = '../dist/public';
  symlinkSync(relativePath, serverPublicPath, 'dir');
  console.log('✅ Created symlink: server/public -> dist/public');
} catch (err) {
  console.error('❌ Error creating symlink:', err.message);
  console.log('Falling back to directory copy method...');
  
  // Fallback: copy files if symlink fails
  const { copyFileSync, readdirSync, statSync } = await import('fs');
  const { join } = await import('path');
  
  function copyRecursive(src, dest) {
    try {
      mkdirSync(dest, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }

    if (!existsSync(src)) {
      console.log(`Source directory ${src} does not exist yet, skipping copy...`);
      return;
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

  if (existsSync(distPublicPath)) {
    copyRecursive(distPublicPath, serverPublicPath);
    console.log('✅ Copied files from dist/public to server/public');
  }
}
