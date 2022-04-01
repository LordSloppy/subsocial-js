import { ApiPromise } from '@polkadot/api'
import { FlatSubsocialApi } from '../flat-subsocial'
import { SubsocialApi } from '../subsocial'
import { SubsocialApiProps } from '../subsocial/basic'
import { getSubstrateApi } from './substrate'

let flatSubsocial!: FlatSubsocialApi 
let subsocial!: SubsocialApi
let isLoadingSubsocial = false

type Api = SubsocialApi & {
  api: ApiPromise
}

type NewSubsocialApiProps = Omit<SubsocialApiProps, 'substrateApi'> & {
  substrateNodeUrl: string,
  substrateApi?: ApiPromise
}

/**
 * Create a new or return existing connection to Subsocial API
 * (includes Substrate and IPFS connections).
 */
export const newSubsocialApi = async ({ substrateNodeUrl, substrateApi: initApi, ...props }: NewSubsocialApiProps) => {
  if (!subsocial && !isLoadingSubsocial) {
    isLoadingSubsocial = true
    const substrateApi = initApi || await getSubstrateApi(substrateNodeUrl)
    subsocial = new SubsocialApi({ substrateApi, ...props })
    isLoadingSubsocial = false;

    (subsocial as any).api = substrateApi
  }
  return subsocial as Api
}

/**
 * Create a new or return existing connection to Flat Subsocial API
 * (with wrapper which return flat structs).
 */
export const newFlatSubsocialApi = async (props: NewSubsocialApiProps) => {
  if (flatSubsocial) return flatSubsocial

  const subsocial = await newSubsocialApi(props)
  flatSubsocial = new FlatSubsocialApi(subsocial)
  return flatSubsocial
}

export const createSubsocialApiResolver = (context: NewSubsocialApiProps) => () => newSubsocialApi(context)
export const createFlatSubsocialApiResolver = (context: NewSubsocialApiProps) => () => newFlatSubsocialApi(context)