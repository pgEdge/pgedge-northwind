import { handleAuth } from "@auth0/nextjs-auth0";
import util from "node:util";

export const GET = handleAuth({
  onError: (req, error) => {
    console.error(error);
    console.log("error request", req.nextUrl);
    console.log(
      "auth error cookies",
      util.inspect(req, {
        showHidden: true,
        colors: true,
        depth: null,
      }),
    );
  },
});
