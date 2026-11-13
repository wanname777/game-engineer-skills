import { installRenderContract } from './renderer';
const canvas = document.querySelector<HTMLCanvasElement>('#motion-canvas');
if (!canvas) throw new Error('Missing motion export canvas');
installRenderContract(canvas);
