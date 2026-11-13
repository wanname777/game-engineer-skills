#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const index = args.indexOf('--project');
const project = index >= 0 ? args[index + 1] : resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
if (!project) throw new Error('--project requires the game project directory');
if (index >= 0) args.splice(index, 2);
const script = resolve(project, 'scripts/render-motion.mjs');
try { await access(script); } catch { throw new Error(`Missing renderer at ${script}. Pass --project with the project containing scripts/render-motion.mjs.`); }
const child = spawn(process.execPath, [script, ...args], { cwd: project, stdio: 'inherit' });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('close', code => { process.exitCode = code ?? 1; });
