import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

type Config = { page2: string[]; page3: string[] };
const components = ['about', 'address', 'birthdate'] as const;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Admin() {
  const { data, refetch } = useQuery<Config>({ queryKey: ['config'], queryFn: () => api('config') });

  const save = useMutation({
    mutationFn: (body: Config) => api('config', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => refetch(),
  });

  if (!data) return <div>Loading…</div>;

  const [assignment, setAssignment] = useState<Record<string, 2 | 3>>({});
  useEffect(() => {
    const next: Record<string, 2 | 3> = {};
    for (const c of data.page2) next[c] = 2;
    for (const c of data.page3) next[c] = 3;
    setAssignment(next);
  }, [data.page2, data.page3]);

  const page2 = useMemo(() => components.filter((c) => assignment[c] === 2), [assignment]);
  const page3 = useMemo(() => components.filter((c) => assignment[c] === 3), [assignment]);
  const valid = page2.length > 0 && page3.length > 0 && page2.length + page3.length === components.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Admin: Configure Steps</h1>
      <div className="border rounded">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-3 border-b">Section</th>
              <th className="text-left p-3 border-b">Page</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <tr key={c} className="border-b">
                <td className="p-3">{label(c)}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      className={`px-2 py-1 rounded border ${assignment[c] === 2 ? 'bg-blue-600 text-white' : ''}`}
                      onClick={() => setAssignment({ ...assignment, [c]: 2 })}
                    >2</button>
                    <button
                      className={`px-2 py-1 rounded border ${assignment[c] === 3 ? 'bg-blue-600 text-white' : ''}`}
                      onClick={() => setAssignment({ ...assignment, [c]: 3 })}
                    >3</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          disabled={!valid || save.isPending}
          onClick={() => save.mutate({ page2, page3 })}
        >Save changes</button>
        {!valid && (
          <span className="text-sm text-red-600">Both pages must have at least one component.</span>
        )}
      </div>
    </div>
  );
}

function label(c: string) {
  if (c === 'about') return 'About Me';
  if (c === 'address') return 'Address';
  if (c === 'birthdate') return 'Birthdate';
  return c;
}


