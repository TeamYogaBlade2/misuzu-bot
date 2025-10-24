// SPDX-License-Identifier:  AGPL-3.0-or-later

import { App } from '@octokit/app';
import { createWebMiddleware } from '@octokit/webhooks';

const app = new App({
  appId: ESBUILDENV.APPID,
  privateKey: ESBUILDENV.PRIVATE_KEY,
  webhooks: {
    secret: ESBUILDENV.WEBHOOK_SECRET,
  },
  // https://github.com/octokit/octokit.js/issues/2211
  oauth: {
    clientId: '',
    clientSecret: '',
  }
});

app.webhooks.on('issue_comment.created', async e => {
  return
  // FIXME: performed_via_github_app filter is not working...?
  if(e.payload.issue.html_url === ESBUILDENV.DASHBOARD_ISSUE_URL && !e.payload.issue.performed_via_github_app) {
    // if(e.payload.comment.body)
    const res = await e.octokit.request(`POST /repos/{owner}/{repo}/issues/{issue_number}/comments`, {
      owner: e.payload.repository.owner.login,
      repo: e.payload.repository.name,
      issue_number: e.payload.issue.number,
      body: 'pong!',
    });
    console.log(res.data);
    if(res.status !== 201) {
      throw new Error(`response status is not 200: ${res.status}`);
    }
  }
});

const buildRepos: Record<string, {
  apt: string,
  cmd: string,
  getPrefix: () => string,
}> = {
  'linux': {
    apt: 'gcc-arm-none-eabi',
    cmd: 'ARCH=arm CROSS_COMPILE=arm-none-eabi- make lenovo-blade_defconfig all',
    getPrefix() {
      return 'mainline-linux'
    },
  }
};

app.webhooks.on('push', async e => {
  // const repo = e.payload.repository.full_name.split('/');
  const owner = 'TeamYogaBlade2';
  const repo = e.payload.repository.name;
  // const ref = e.payload.ref;
  const commit = e.payload.after;

  const recipe = buildRepos[repo]
  if(!recipe) {
    return
  }

  await e.octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
    owner,
    repo: 'misuzu-bot',
    workflow_id: 'builder.yml',
    ref: 'main',
    inputs: {
      repo: owner + '/' + repo,
      ref: commit,
      prefix: recipe.getPrefix(),
      apt: recipe.apt,
      cmd: recipe.cmd,
    },
  });
});

app.webhooks.on('workflow_dispatch', async e => {

  await e.octokit.request('POST /repos/{owner}/{repo}/statuses/{sha}', {
    owner, repo,
    sha: commit,
    state: 'pending',
    target_url: 'https://github.com/TeamYogaBlade2/misuzu-bot/actions/workflows/builder.yml', // FIXME: Get the actual run url
    context: 'TODO',
  });
});

const middleware = createWebMiddleware(app.webhooks);

export default {
  async fetch(req: Request): Promise<Response|undefined> {
    return await middleware(req) ?? new Response("Not Found", { status: 404 });
  }
};
