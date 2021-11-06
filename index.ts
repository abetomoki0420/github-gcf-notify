import type { HttpFunction } from "@google-cloud/functions-framework/build/src/functions"
import { PullRequestOpenedEvent, PullRequest } from "@octokit/webhooks-types";
import { Octokit } from "@octokit/rest"

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN
const octokit = new Octokit({auth: GITHUB_ACCESS_TOKEN})

const isGitHubPullRequestEvent = (e: any): e is PullRequestOpenedEvent => {
  return "pull_request" in e;
}

type Formatter = (pull_request: PullRequest) => string

export const initFunction = (formatter: Formatter):HttpFunction => {
  
  return async (req, res,) => {
    const { body } = req;
    
    if(!isGitHubPullRequestEvent(body)){
      res.status(200).send();
      return;
    }
    const { pull_request } = body;
    const { number: pull_request_number , user , head } = pull_request
    const { owner, name: repo_name } = pull_request.base.repo;
    await octokit.issues.update({
      owner: owner.login,
      repo: repo_name,
      issue_number:pull_request_number,
      body: formatter(pull_request)
    });
  }
}
