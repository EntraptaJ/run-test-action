// src/run.ts
import { spawn } from 'child_process';
import BufferList from 'bl';

export default function run(
  command: string,
  options: {
    cwd?: string;
  } = {},
): Promise<{ code: number; bl: BufferList }> {
  const args = command.split(/\s/);
  const bin = args.shift() as string;

  const child = spawn(bin, args, {
    cwd: options.cwd,
  });
  // @ts-ignore
  const stdout = child.stdout ? new BufferList() : ('' as BufferList);
  // @ts-ignore
  const stderr = child.stderr ? new BufferList() : ('' as BufferList);

  if (child.stdout) child.stdout.on('data', (data) => stdout.append(data));

  if (child.stderr) child.stderr.on('data', (data) => stderr.append(data));

  return new Promise((resolve, reject) => {
    child.on('error', reject);

    child.on('exit', (code) => resolve({ code, bl: stdout }));
  });
}
