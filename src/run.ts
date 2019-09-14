// src/run.ts
import { spawn } from 'child_process';

export default async function run(
  command: string,
  options: {
    cwd?: string;
  } = {},
): Promise<{ code: number; result: string }> {
  return new Promise((resolve, reject) => {
    const args = command.split(/\s/);
    const bin = args.shift() as string;

    spawn(bin, args, {
      stdio: 'ignore',
      cwd: options.cwd || process.cwd(),
      shell: true,
    }).on('close', (code: number, result) => resolve({ code, result }));
  });
}
