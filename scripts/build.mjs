import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await Promise.all(['index.html', 'styles.css', 'main.js'].map(file => copyFile(file, `dist/${file}`)));
await cp('public', 'dist/public', { recursive: true });
console.log('Static portfolio built to dist/');
