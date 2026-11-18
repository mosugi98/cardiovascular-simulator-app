import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildReviewMarkdown } from './clinicalReview.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = path.join(root, 'docs', 'clinical-content-review.md');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, buildReviewMarkdown(), 'utf8');
console.log(`Wrote ${path.relative(root, target)}`);
