/**
 * This file is necessary to ensure protection of all routes in the `admin`
 * directory. It makes the routes in this directory _dynamic_ routes, which
 * send a server request, and thus trigger `hooks.server.ts`.
 **/

// export const load = async ({ setHeaders }) => {
//   setHeaders({
//     "cache-control": "no-store",
//   })
// }
