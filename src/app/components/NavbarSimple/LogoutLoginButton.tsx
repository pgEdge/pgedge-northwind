import { UserProvider, useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@mantine/core";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoutLoginButton() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const authEnabled = process.env.AUTH0_ENABLED ? true : false;

  return (
    <>
      {authEnabled &&
        (user && !isLoading ? (
          <Button
            radius="xl"
            type="submit"
            onClick={() => router.push("/api/auth/logout")}
          >
            Logout
          </Button>
        ) : (
          <Button
            radius="xl"
            type="submit"
            onClick={() => router.push("/api/auth/login")}
          >
            Login
          </Button>
        ))}
    </>
  );
}
