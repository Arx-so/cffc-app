/**
 * Chainable stand-in for the Supabase client.
 *
 * The real client builds queries by chaining (`from().select().eq().single()`)
 * and only resolves when awaited, so the mock mirrors that: every method returns
 * the builder, and the builder is thenable. Results are queued per table in FIFO
 * order, which matches how a process issues several queries against one table.
 *
 * `calls` records the chain that was actually built. For a data-access module the
 * query IS the output, so asserting on it is asserting real behavior — not
 * asserting on the mock's own bookkeeping.
 */

export type SupabaseError = { message: string; code?: string } | null;
export type SupabaseResult<T = unknown> = {
  data: T | null;
  error: SupabaseError;
  /** Present when the query used `{ count: "exact" }` / a head request. */
  count?: number | null;
};

export interface RecordedStep {
  method: string;
  args: unknown[];
}

export interface RecordedCall {
  table: string;
  steps: RecordedStep[];
}

export const ok = <T>(data: T): SupabaseResult<T> => ({ data, error: null });
export const fail = (message: string, code?: string): SupabaseResult<never> => ({
  data: null,
  error: code ? { message, code } : { message },
});

/** Result of a head/count query: no rows, just the total. */
export const count = (n: number): SupabaseResult<never> => ({ data: null, error: null, count: n });

export const createSupabaseMock = () => {
  const queues = new Map<string, SupabaseResult[]>();
  const calls: RecordedCall[] = [];
  const storageQueue: SupabaseResult[] = [];
  const storageCalls: RecordedStep[] = [];

  const nextFor = (table: string): SupabaseResult => {
    const queue = queues.get(table);
    if (!queue || queue.length === 0) return { data: null, error: null };
    return queue.shift()!;
  };

  const makeBuilder = (table: string) => {
    const record: RecordedCall = { table, steps: [] };
    calls.push(record);

    const resolve = () => Promise.resolve(nextFor(table));

    const builder: Record<string | symbol, unknown> = {};
    const proxy: any = new Proxy(builder, {
      get(_target, prop) {
        if (prop === "then") {
          // Awaiting the chain resolves the queued result.
          return (onFulfilled: any, onRejected: any) =>
            resolve().then(onFulfilled, onRejected);
        }
        if (prop === "catch") {
          return (onRejected: any) => resolve().catch(onRejected);
        }
        if (prop === "finally") {
          return (onFinally: any) => resolve().finally(onFinally);
        }
        if (typeof prop === "symbol") return undefined;
        return (...args: unknown[]) => {
          record.steps.push({ method: prop, args });
          return proxy;
        };
      },
    });
    return proxy;
  };

  const auth = {
    getSession: jest.fn(async () => ({ data: { session: null }, error: null })),
    getUser: jest.fn(async () => ({ data: { user: null }, error: null })),
    signInWithPassword: jest.fn(async () => ({ data: { user: null, session: null }, error: null })),
    signUp: jest.fn(async () => ({ data: { user: null, session: null }, error: null })),
    signOut: jest.fn(async () => ({ error: null })),
    resetPasswordForEmail: jest.fn(async () => ({ data: {}, error: null })),
    updateUser: jest.fn(async () => ({ data: { user: null }, error: null })),
    setSession: jest.fn(async () => ({ data: { session: null }, error: null })),
    signInWithIdToken: jest.fn(async () => ({ data: { user: null, session: null }, error: null })),
    signInWithOAuth: jest.fn(async () => ({ data: { url: null, provider: "google" }, error: null })),
    verifyOtp: jest.fn(async () => ({ data: { user: null, session: null }, error: null })),
    exchangeCodeForSession: jest.fn(async () => ({ data: { session: null }, error: null })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  };

  const storageBucket = {
    createSignedUrl: jest.fn(async (path: string, expiry: number) => {
      storageCalls.push({ method: "createSignedUrl", args: [path, expiry] });
      return storageQueue.shift() ?? { data: null, error: null };
    }),
    upload: jest.fn(async (path: string, body: unknown, options?: unknown) => {
      storageCalls.push({ method: "upload", args: [path, body, options] });
      return storageQueue.shift() ?? { data: { path }, error: null };
    }),
    remove: jest.fn(async (paths: string[]) => {
      storageCalls.push({ method: "remove", args: [paths] });
      return storageQueue.shift() ?? { data: null, error: null };
    }),
    getPublicUrl: jest.fn((path: string) => ({
      data: { publicUrl: `https://cdn.test/${path}` },
    })),
  };

  const client = {
    from: jest.fn((table: string) => makeBuilder(table)),
    rpc: jest.fn((fn: string, args?: unknown) => makeBuilder(`rpc:${fn}`).select(args)),
    auth,
    storage: { from: jest.fn(() => storageBucket) },
  };

  return {
    client,
    auth,
    storageBucket,
    /** Queue a result for the next awaited chain on `table` (FIFO). */
    queue(table: string, ...results: SupabaseResult[]) {
      const existing = queues.get(table) ?? [];
      queues.set(table, [...existing, ...results]);
      return this;
    },
    /** Queue a result for the next storage operation (FIFO). */
    queueStorage(...results: SupabaseResult[]) {
      storageQueue.push(...results);
      return this;
    },
    calls,
    storageCalls,
    /** All chains built against `table`, in order. */
    callsFor: (table: string) => calls.filter((c) => c.table === table),
    /**
     * Args of the nth `method` call against `table`, counting across all chains.
     * (`update` is usually not on the first chain, so indexing chains would miss it.)
     */
    argsOf: (table: string, method: string, nth = 0) =>
      calls
        .filter((c) => c.table === table)
        .flatMap((c) => c.steps)
        .filter((s) => s.method === method)[nth]?.args,
    reset() {
      queues.clear();
      calls.length = 0;
      storageQueue.length = 0;
      storageCalls.length = 0;
      Object.values(auth).forEach((fn) => (fn as jest.Mock).mockClear?.());
      Object.values(storageBucket).forEach((fn) => (fn as jest.Mock).mockClear?.());
      client.from.mockClear();
      client.rpc.mockClear();
      client.storage.from.mockClear();
    },
  };
};

export type SupabaseMock = ReturnType<typeof createSupabaseMock>;
