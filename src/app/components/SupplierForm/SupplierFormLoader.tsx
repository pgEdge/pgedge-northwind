import { getAccessToken } from "@auth0/nextjs-auth0";

export default async function SupplierFormLoader() {
  const accessToken = await getAccessToken();
  return accessToken;
}
