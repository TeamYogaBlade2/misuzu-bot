import { App, createWebMiddleware } from '@octokit/app';

const app = new App({
  appId: ESBUILDENV.APPID,
  privateKey: ESBUILDENV.PRIVATE_KEY,
  webhooks: {
    secret: ESBUILDENV.WEBHOOK_SECRET,
  },
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
    const res = middleware(req);
    return res;
  }
};
