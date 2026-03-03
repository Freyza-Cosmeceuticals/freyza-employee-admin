// @ts-ignore
import { VITE_VERCEL_COMMIT_REF } from "$env/static/private"

export const load = async () => {
  return {
    deploymentGitBranch: VITE_VERCEL_COMMIT_REF
  }
}
