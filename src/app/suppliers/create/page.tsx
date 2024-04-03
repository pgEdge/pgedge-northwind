"use client";

import SupplierForm from "@/app/components/SupplierForm/SupplierForm";
import { withPageAuthRequired } from '@auth0/nextjs-auth0/client';


function Suppliers() {

  return <SupplierForm />
}

export default withPageAuthRequired(Suppliers, {
  // onRedirecting: () => <Loading />,
  onRedirecting: () => <>Loading</>,
  // onError: error => <ErrorMessage>{error.message}</ErrorMessage>
  onError: error => <>{error.message}</>
});