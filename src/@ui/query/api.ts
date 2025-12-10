import type { ExpiryData, VersionData } from '@iamssen/exocortex';
import type { APIConfig } from '@iamssen/exocortex/server';
import type {
  DefaultError,
  QueryFunction,
  QueryFunctionContext,
  UseQueryOptions,
} from '@tanstack/react-query';

type Routes = {
  [P in APIConfig[number] as P['__apiPath__']]: {
    data: P['__data__'];
    query: P['__query__'];
  };
};

const API_ENDPOINT =
  import.meta.env.API_ENDPOINT ?? 'https://192.168.1.98:9999';

async function queryFn(ctx: QueryFunctionContext<[string]>): Promise<any> {
  const path = ctx.queryKey[0];
  const res = await fetch(`${API_ENDPOINT}/${path}`);
  return res.headers.get('Content-Type')?.startsWith('text/')
    ? res.text()
    : res.json();
}

export function api<P extends keyof Routes, Data = PickData<Routes[P]['data']>>(
  path: P,
  ...args: Routes[P]['query'] extends never
    ? [
        query?: {},
        options?: Omit<
          UseQueryOptions<Routes[P]['data'], DefaultError, Data>,
          'queryKey' | 'queryFn'
        >,
      ]
    : {} extends Routes[P]['query']
      ? [
          query?: Routes[P]['query'],
          options?: Omit<
            UseQueryOptions<Routes[P]['data'], DefaultError, Data>,
            'queryKey' | 'queryFn'
          >,
        ]
      : [
          query: Routes[P]['query'],
          options?: Omit<
            UseQueryOptions<Routes[P]['data'], DefaultError, Data>,
            'queryKey' | 'queryFn'
          >,
        ]
): UseQueryOptions<Routes[P]['data'], DefaultError, Data> {
  const refetchInterval = path.startsWith('finance/quote/')
    ? 1000 * 60
    : 1000 * 60 * 10;

  const [query = {}, options = {}] = args;
  const searchParams = new URLSearchParams(query);

  return {
    queryKey: [
      path + (searchParams.size > 0 ? `?${searchParams.toString()}` : ''),
    ],
    queryFn: queryFn as QueryFunction<Routes[P]['data']>,
    select: defaultSelect as any,
    refetchInterval,
    ...options,
  };
}

type PickData<T> =
  T extends ExpiryData<infer U> ? U : T extends VersionData<infer U> ? U : T;

function defaultSelect<T>(data: T): PickData<T> {
  if (typeof data === 'object' && data !== null) {
    if ('expires' in data && 'refreshDate' in data && 'data' in data) {
      return (data as ExpiryData<any>).data;
    } else if ('version' in data && 'refreshDate' in data && 'data' in data) {
      return (data as VersionData<any>).data;
    }
  }
  return data as any;
}
