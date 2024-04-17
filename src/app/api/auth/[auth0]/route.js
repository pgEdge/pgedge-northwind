import { handleAuth } from "@auth0/nextjs-auth0/edge";
import util from "node:util";

export const runtime = "edge";

export const GET = handleAuth({
  onError: (req, error) => {
    console.error(error);
    console.log("error request", req.nextUrl);
  },
});
