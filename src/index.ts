// SPDX-License-Identifier:  AGPL-3.0-or-later

import { App, createWebMiddleware } from '@octokit/app';

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

app.webhooks.on('issue_comment.created', e => {
  if(e.payload.issue.url === ESBUILDENV.DASHBOARD_ISSUE_URL) {
    // if(e.payload.comment.body)
    e.octokit.request(`POST /repos/{owner}/{repo}/issues/{issue_number}/comments`, {
      owner: e.payload.repository.owner.login,
      repo: e.payload.repository.name,
      issue_number: e.payload.issue.number,
      body: 'pong!',
    });
  }
});

const middleware = createWebMiddleware(app);

export default {
  async fetch(req: Request): Promise<Response|undefined> {
    return await middleware(req) ?? new Response("Not Found", { status: 404 });
  }
};
