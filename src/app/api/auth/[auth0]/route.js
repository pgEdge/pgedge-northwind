import { handleAuth,handleLogout } from "@auth0/nextjs-auth0/edge";
import util from "node:util";

export const runtime = "edge";

const logoutUrl = [
  `${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout?`,
  `client_id=${process.env.AUTH0_CLIENT_ID}`,
  `&returnTo=${process.env.AUTH0_BASE_URL}`,
];

export const GET = handleAuth({
  logout: handleLogout({ returnTo: logoutUrl.join('') }),
  onError: (req, error) => {
    console.error(error);
    console.log("error request", req.nextUrl);
  },
});
