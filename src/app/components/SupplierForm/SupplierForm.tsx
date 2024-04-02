import { useForm } from '@mantine/form';
import { TextInput, Textarea, SimpleGrid, Button, Title } from '@mantine/core';
import { createSupplier, updateSupplier } from '@/app/data/api';
import { useRouter } from 'next/navigation';

interface SupplierFormProps {
  supplier?: {
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
  };
  onSuccess?: (supplierId: number) => void;
}

const SupplierForm = ({ supplier, onSuccess }: SupplierFormProps) => {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      supplier_id: supplier?.supplier_id || 0,
      company_name: supplier?.company_name || '',
      contact_name: supplier?.contact_name || '',
      contact_title: supplier?.contact_title || '',
      address: supplier?.address || '',
      city: supplier?.city || '',
      region: supplier?.region || '',
      postal_code: supplier?.postal_code || '',
      country: supplier?.country || '',
      phone: supplier?.phone || '',
      fax: supplier?.fax || '',
      homepage: supplier?.homepage || '',
    },
  });

  const handleSubmit = async (values: any) => {
    const supplierId:number = values.supplier_id;
    try {
      const result =
        supplierId > 0
          ? await updateSupplier(supplierId, values)
          : await createSupplier(values);

      if (result.supplier_id) {
        console.log(`Supplier ${supplierId > 0 ? 'updated' : 'created'} with ID: ${result.supplier_id}`);
        router.push(`/suppliers`);
        onSuccess?.(result.supplier_id);
      } else {
        console.error(`Failed to ${supplierId > 0 ? 'update' : 'create'} supplier`);
      }
    } catch (error) {
      console.error(`Error ${supplierId > 0 ? 'updating' : 'creating'} supplier:`, error);
    }
  };

  return (
    <>
      <Title order={3} fw={600} mb="lg">
        {supplier ? 'Update Supplier' : 'Create Supplier'}
      </Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>

      <SimpleGrid cols={2} verticalSpacing="sm" spacing="xl">
        <TextInput
          required
          label="Company Name"
          placeholder="Company Name"
          {...form.getInputProps('company_name')}
        />
        <TextInput
          label="Contact Name"
          placeholder="Contact Name"
          {...form.getInputProps('contact_name')}
        />
        <TextInput
          label="Contact Title"
          placeholder="Contact Title"
          {...form.getInputProps('contact_title')}
        />
        <TextInput
          label="Address"
          placeholder="Address"
          {...form.getInputProps('address')}
        />
        <TextInput
          label="City"
          placeholder="City"
          {...form.getInputProps('city')}
        />
        <TextInput
          label="Region"
          placeholder="Region"
          {...form.getInputProps('region')}
        />
        <TextInput
          label="Postal Code"
          placeholder="Postal Code"
          {...form.getInputProps('postal_code')}
        />
        <TextInput
          label="Country"
          placeholder="Country"
          {...form.getInputProps('country')}
        />
        <TextInput
          label="Phone"
          placeholder="Phone"
          {...form.getInputProps('phone')}
        />
        <TextInput
          label="Fax"
          placeholder="Fax"
          {...form.getInputProps('fax')}
        />
        <TextInput
          label="Homepage"
          placeholder="Homepage"
          {...form.getInputProps('homepage')}
        />
      </SimpleGrid>
      <Button type="submit" mt="xl">
        Submit
      </Button>
    </form></>
  );
};

export default SupplierForm;