// src/index.ts
import { getInput, setFailed } from '@actions/core';
import { sync } from 'glob';
import { parse } from 'path';
import spawn from 'advanced-spawn-async'
import run from  './run'
import * as github from '@actions/github';

const token = getInput('github-token');
const octokit = new github.GitHub(token);

interface FailTestArgs {
  pr: number;
  result: string;
}

async function failTest({ pr, result }: FailTestArgs): Promise<void> {
  const message: string = `\`npm run test\` has failed\n\`\`\`${result}\`\`\``;
  octokit.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: pr,
    body: message,
  });
  setFailed(message);
}

async function runTests(): Promise<void> {
  const { pull_request: pr } = github.context.payload;
  if (!pr) throw new Error('Event payload missing `pull_request`');

  try {
    const filenames = sync(`${process.env.GITHUB_WORKSPACE}/**/package.json`);
    for (const filename of filenames) {
      await run(`npm install`, { cwd: parse(filename).dir });
      const test = await spawn('npm', ['test'], { cwd: parse(filename).dir }).onclose
      console.log(test)
      if (test.status !== 0) failTest({ pr: pr.number, result: test.output.toString() })
    }
  } catch (error) {
    setFailed(error.message);
  }
}

runTests();
