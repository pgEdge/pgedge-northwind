import { getAccessToken } from "@auth0/nextjs-auth0/edge";

export default async function SupplierFormLoader() {
  try {
    const accessToken = await getAccessToken();
    return accessToken;
  } catch (error) {
    return undefined;
  }
}
