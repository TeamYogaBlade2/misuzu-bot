import { App, createWebMiddleware } from '@octokit/app';

const app = new App({
  appId: ESBUILDENV.APPID,
  privateKey: ESBUILDENV.PRIVATE_KEY,
  webhooks: {
    secret: ESBUILDENV.WEBHOOK_SECRET,
  },
});

const middleware = createWebMiddleware(app);

export default {
  async fetch(req: Request): Promise<Response|undefined> {
    const res = middleware(req);
    return res;
  }
};
