import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { z } from 'zod';

type Config = { page2: string[]; page3: string[] };

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function Onboarding() {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);

  const { data: config } = useQuery<Config>({
    queryKey: ['config'],
    queryFn: () => api<Config>('config'),
  });

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ currentStep: number }>('onboarding-me'),
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (meQuery.data?.currentStep) setStep(meQuery.data.currentStep);
  }, [meQuery.data]);

  const start = useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      api('onboarding-start', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: () => setStep(2),
  });

  const save = useMutation({
    mutationFn: (body: { step: number; data: Record<string, unknown> }) =>
      api('onboarding-save', { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: (_, v) => setStep(Math.min(3, (v?.step ?? 1) + 1)),
    onSettled: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });

  if (!config) return <div>Loading…</div>;

  return (
    <div className="max-w-xl mx-auto">
      <Stepper current={step} />

      {step === 1 && <CredentialsForm onSubmit={(v) => start.mutate(v)} loading={start.isPending} />}

      {step === 2 && (
        <DynamicStep
          fields={config.page2}
          onSubmit={(data) => save.mutate({ step: 2, data })}
          loading={save.isPending}
        />
      )}

      {step === 3 && (
        <DynamicStep
          fields={config.page3}
          onSubmit={(data) => save.mutate({ step: 3, data })}
          loading={save.isPending}
        />
      )}
    </div>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex gap-2 mb-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`h-2 flex-1 rounded ${i <= current ? 'bg-blue-600' : 'bg-gray-200'}`} />
      ))}
    </div>
  );
}

function CredentialsForm({ onSubmit, loading }: { onSubmit: (v: { email: string; password: string }) => void; loading: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = credSchema.safeParse({ email, password });
        if (!parsed.success) {
          setError(parsed.error.errors[0]?.message ?? 'Invalid input');
          return;
        }
        setError(null);
        onSubmit(parsed.data);
      }}
    >
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input className="w-full border rounded p-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Password</label>
        <input className="w-full border rounded p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button className="btn px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
        {loading ? 'Saving…' : 'Continue'}
      </button>
    </form>
  );
}

function DynamicStep({ fields, onSubmit, loading }: { fields: string[]; onSubmit: (data: Record<string, unknown>) => void; loading: boolean }) {
  const [form, setForm] = useState<Record<string, string>>({});
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      {fields.includes('about') && (
        <div>
          <label className="block text-sm mb-1">About Me</label>
          <textarea className="w-full border rounded p-2" rows={5} value={form.about ?? ''} onChange={(e) => setForm({ ...form, about: e.target.value })} />
        </div>
      )}
      {fields.includes('address') && (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-sm mb-1">Street</label>
            <input className="w-full border rounded p-2" value={form.address_street ?? ''} onChange={(e) => setForm({ ...form, address_street: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm mb-1">City</label>
            <input className="w-full border rounded p-2" value={form.address_city ?? ''} onChange={(e) => setForm({ ...form, address_city: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm mb-1">State</label>
            <input className="w-full border rounded p-2" value={form.address_state ?? ''} onChange={(e) => setForm({ ...form, address_state: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm mb-1">Zip</label>
            <input className="w-full border rounded p-2" value={form.address_zip ?? ''} onChange={(e) => setForm({ ...form, address_zip: e.target.value })} />
          </div>
        </div>
      )}
      {fields.includes('birthdate') && (
        <div>
          <label className="block text-sm mb-1">Birthdate</label>
          <input className="w-full border rounded p-2" type="date" value={form.birthdate ?? ''} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} />
        </div>
      )}
      <button className="btn px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
        {loading ? 'Saving…' : 'Continue'}
      </button>
    </form>
  );
}


