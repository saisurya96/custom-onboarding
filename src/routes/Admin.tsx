import { useMutation, useQuery } from '@tanstack/react-query';

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

  const assigned = new Map<string, number>();
  for (const c of data.page2) assigned.set(c, 2);
  for (const c of data.page3) assigned.set(c, 3);

  const setPage = (c: string, page: 2 | 3) => {
    const p2 = new Set(data.page2);
    const p3 = new Set(data.page3);
    p2.delete(c); p3.delete(c);
    (page === 2 ? p2 : p3).add(c);
    const next = { page2: Array.from(p2), page3: Array.from(p3) };
    if (next.page2.length === 0 || next.page3.length === 0) return; // enforce non-empty
    save.mutate(next);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Admin: Configure Steps</h1>
      <div className="grid grid-cols-2 gap-6">
        {[2, 3].map((page) => (
          <div key={page} className="border rounded p-4">
            <div className="font-medium mb-2">Page {page}</div>
            <div className="space-y-2">
              {components.map((c) => (
                <div key={c} className="flex items-center justify-between">
                  <span>{label(c)}</span>
                  <div className="flex gap-2">
                    <button
                      className={`px-2 py-1 rounded border ${assigned.get(c) === 2 ? 'bg-blue-600 text-white' : ''}`}
                      onClick={() => setPage(c, 2)}
                    >P2</button>
                    <button
                      className={`px-2 py-1 rounded border ${assigned.get(c) === 3 ? 'bg-blue-600 text-white' : ''}`}
                      onClick={() => setPage(c, 3)}
                    >P3</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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


