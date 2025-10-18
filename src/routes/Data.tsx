import { useQuery } from '@tanstack/react-query';

type Row = {
  id: string;
  email: string;
  about_me: string | null;
  birthdate: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
};

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`/api/${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function DataPage() {
  const { data } = useQuery<Row[]>({
    queryKey: ['data-table'],
    queryFn: () => api<Row[]>('data'),
    refetchInterval: 5000,
  });
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            {['Email','About','Birthdate','Street','City','State','Zip'].map((h) => (
              <th key={h} className="text-left p-2 border-b">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-2">{r.email}</td>
              <td className="p-2">{r.about_me ?? ''}</td>
              <td className="p-2">{r.birthdate ?? ''}</td>
              <td className="p-2">{r.address_street ?? ''}</td>
              <td className="p-2">{r.address_city ?? ''}</td>
              <td className="p-2">{r.address_state ?? ''}</td>
              <td className="p-2">{r.address_zip ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


