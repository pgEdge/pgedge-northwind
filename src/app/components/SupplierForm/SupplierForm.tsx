"use client";
import { useForm } from "@mantine/form";
import { TextInput, Textarea, SimpleGrid, Button, Title } from "@mantine/core";
import { createSupplier, fetchSupplier, updateSupplier } from "@/app/data/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Supplier {
  supplier_id: number;
  company_name: string;
  contact_name: string;
  contact_title: string;
  address: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  phone: string;
  fax: string;
  homepage: string;
}
interface SupplierFormProps {
  token: string;
  supplier_id?: number;
  onSuccess?: (supplierId: number) => void;
}

const SupplierForm = ({ token, supplier_id, onSuccess }: SupplierFormProps) => {
  const [supplier, setSupplier] = useState({} as Supplier);

  const form = useForm({
    initialValues: {
      supplier_id: 0,
      company_name: "",
      contact_name: "",
      contact_title: "",
      address: "",
      city: "",
      region: "",
      postal_code: "",
      country: "",
      phone: "",
      fax: "",
      homepage: "",
    },
  });

  useEffect(() => {
    (async () => {
      if (!supplier_id) return;
      try {
        const result = await fetchSupplier(supplier_id);
        setSupplier(result.data);
        form.setValues(result.data);
      } catch (error) {
        console.error("Error fetching supplier:", error);
      }
    })();
  }, [supplier_id, token]);

  const router = useRouter();

  const handleSubmit = async (values: any) => {
    const supplierId: number = values.supplier_id;
    try {
      const result =
        supplierId > 0
          ? await updateSupplier(supplierId, values, token)
          : await createSupplier(values, token);

      if (result) {
        console.log(
          `Supplier ${supplierId > 0 ? "updated" : "created"} with ID: ${result}`,
        );
        router.push(`/suppliers`);
        onSuccess?.(result);
      } else {
        console.error(
          `Failed to ${supplierId > 0 ? "update" : "create"} supplier`,
        );
      }
    } catch (error) {
      console.error(
        `Error ${supplierId > 0 ? "updating" : "creating"} supplier:`,
        error,
      );
    }
  };

  return (
    <>
      <Title order={3} fw={600} mb="lg">
        {supplier ? "Update Supplier" : "Create Supplier"}
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <SimpleGrid cols={2} verticalSpacing="sm" spacing="xl">
          <TextInput
            required
            label="Company Name"
            placeholder="Company Name"
            {...form.getInputProps("company_name")}
          />
          <TextInput
            label="Contact Name"
            placeholder="Contact Name"
            {...form.getInputProps("contact_name")}
          />
          <TextInput
            label="Contact Title"
            placeholder="Contact Title"
            {...form.getInputProps("contact_title")}
          />
          <TextInput
            label="Address"
            placeholder="Address"
            {...form.getInputProps("address")}
          />
          <TextInput
            label="City"
            placeholder="City"
            {...form.getInputProps("city")}
          />
          <TextInput
            label="Region"
            placeholder="Region"
            {...form.getInputProps("region")}
          />
          <TextInput
            label="Postal Code"
            placeholder="Postal Code"
            {...form.getInputProps("postal_code")}
          />
          <TextInput
            label="Country"
            placeholder="Country"
            {...form.getInputProps("country")}
          />
          <TextInput
            label="Phone"
            placeholder="Phone"
            {...form.getInputProps("phone")}
          />
          <TextInput
            label="Fax"
            placeholder="Fax"
            {...form.getInputProps("fax")}
          />
          <TextInput
            label="Homepage"
            placeholder="Homepage"
            {...form.getInputProps("homepage")}
          />
        </SimpleGrid>
        <Button type="submit" mt="xl">
          Submit
        </Button>
      </form>
    </>
  );
};

export default SupplierForm;
