// @ts-ignore
import { VERCEL_COMMIT_REF } from "$env/static/private"

export const load = async () => {
  return {
    deploymentGitBranch: VERCEL_COMMIT_REF
  }
}
