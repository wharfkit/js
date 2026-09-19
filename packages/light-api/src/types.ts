import {
    Checksum256,
    Int64,
    Name,
    PublicKey,
    Struct,
    UInt32,
    UInt64,
    UInt8,
} from '@wharfkit/antelope'

export interface ChainInfoLike {
    block_num: number
    block_time: string
    chainid: string
    decimals: number
    description: string
    network: string
    production: number
    rex_enabled?: number
    sync: number
    systoken: string
}

export interface PermissionAuthKeyLike {
    public_key: string
    pubkey: string
    weight: number
}

export interface PermissionAuthAccountLike {
    actor: string
    permission: string
    weight: number
}

export interface PermissionAuthLike {
    accounts: PermissionAuthAccountLike[]
    keys: PermissionAuthKeyLike[]
    threshold?: number
}

export interface PermissionLike {
    auth: PermissionAuthLike
    perm: string
    threshold?: number
}

export interface CodeHashAccountLike {
    account_name: string
    code_hash: string
}

export type NetworkInfo = ChainInfoLike[]
export type TopHolderRow = [string, string]
export type TopRamRow = [string, number]
export type TopStakeRow = [string, number, number]
export type KeyLookupResponse = Record<
    string,
    {
        chain?: ChainInfoLike
        accounts?: Record<string, PermissionLike[]>
    }
>
export type CodeHashResponse = Record<
    string,
    {
        chain?: ChainInfoLike
        accounts?: Record<string, CodeHashAccountLike>
    }
>

@Struct.type('chain_info')
export class ChainInfo extends Struct {
    @Struct.field(UInt64) declare block_num: UInt64
    @Struct.field('string') declare block_time: string
    @Struct.field(Checksum256) declare chainid: Checksum256
    @Struct.field(UInt32) declare decimals: UInt32
    @Struct.field('string') declare description: string
    @Struct.field('string') declare network: string
    @Struct.field(UInt8) declare production: UInt8
    @Struct.field(UInt8, {optional: true}) declare rex_enabled?: UInt8
    @Struct.field(Int64) declare sync: Int64
    @Struct.field('string') declare systoken: string
}

@Struct.type('permission_auth_key')
export class PermissionAuthKey extends Struct {
    @Struct.field(PublicKey) declare public_key: PublicKey
    @Struct.field('string') declare pubkey: string
    @Struct.field(UInt32) declare weight: UInt32
}

@Struct.type('permission_auth_account')
export class PermissionAuthAccount extends Struct {
    @Struct.field(Name) declare actor: Name
    @Struct.field(Name) declare permission: Name
    @Struct.field(UInt32) declare weight: UInt32
}

@Struct.type('permission_auth')
export class PermissionAuth extends Struct {
    @Struct.field(PermissionAuthAccount, {array: true}) declare accounts: PermissionAuthAccount[]
    @Struct.field(PermissionAuthKey, {array: true}) declare keys: PermissionAuthKey[]
    @Struct.field(UInt32, {optional: true}) declare threshold?: UInt32
}

@Struct.type('permission')
export class Permission extends Struct {
    @Struct.field(PermissionAuth) declare auth: PermissionAuth
    @Struct.field(Name) declare perm: Name
    @Struct.field(UInt32, {optional: true}) declare threshold?: UInt32
}

@Struct.type('link_auth')
export class LinkAuth extends Struct {
    @Struct.field(Name) declare code: Name
    @Struct.field(Name) declare requirement: Name
    @Struct.field('string') declare type: string
}

@Struct.type('delegated_bandwidth_from')
export class DelegatedBandwidthFrom extends Struct {
    @Struct.field(Name) declare del_from: Name
    @Struct.field(Int64) declare net_weight: Int64
    @Struct.field(Int64) declare cpu_weight: Int64
}

@Struct.type('delegated_bandwidth_to')
export class DelegatedBandwidthTo extends Struct {
    @Struct.field(Name) declare account_name: Name
    @Struct.field(Int64) declare cpu_weight: Int64
    @Struct.field(Int64) declare net_weight: Int64
}

@Struct.type('resource_info')
export class ResourceInfo extends Struct {
    @Struct.field(Int64) declare cpu_weight: Int64
    @Struct.field(Int64) declare net_weight: Int64
    @Struct.field(UInt64) declare ram_bytes: UInt64
}

@Struct.type('balance_entry')
export class BalanceEntry extends Struct {
    @Struct.field('string') declare amount: string
    @Struct.field('string') declare contract: string
    @Struct.field('string') declare currency: string
    @Struct.field('string') declare decimals: string
}

@Struct.type('code_hash_entry')
export class CodeHashEntry extends Struct {
    @Struct.field(Checksum256) declare code_hash: Checksum256
}

@Struct.type('rex_display_balances')
export class RexDisplayBalances extends Struct {
    @Struct.field('string') declare fund: string
    @Struct.field('string') declare matured: string
    @Struct.field('string') declare maturing: string
    @Struct.field('string') declare savings: string
}

@Struct.type('rex_pool')
export class RexPool extends Struct {
    @Struct.field(UInt64) declare loan_num: UInt64
    @Struct.field('string') declare namebid_proceeds: string
    @Struct.field('string') declare total_lendable: string
    @Struct.field('string') declare total_lent: string
    @Struct.field('string') declare total_rex: string
    @Struct.field('string') declare total_rent: string
    @Struct.field('string') declare total_unlent: string
}

@Struct.type('rex_raw_balance')
export class RexRawBalance extends Struct {
    @Struct.field('string', {optional: true}) declare matured_rex?: string
    @Struct.field('string', {optional: true}) declare rex_balance?: string
    @Struct.field('any', {optional: true}) declare rex_maturities?: any
    @Struct.field('string', {optional: true}) declare vote_stake?: string
}

@Struct.type('rex_raw')
export class RexRaw extends Struct {
    @Struct.field(RexRawBalance, {optional: true}) declare bal?: RexRawBalance
    @Struct.field('string') declare fund: string
    @Struct.field(RexPool) declare pool: RexPool
}

@Struct.type('account_info_response')
export class AccountInfoResponse extends Struct {
    @Struct.field(Name) declare account_name: Name
    @Struct.field(ChainInfo) declare chain: ChainInfo
    @Struct.field(DelegatedBandwidthFrom, {array: true})
    declare delegated_from: DelegatedBandwidthFrom[]
    @Struct.field(DelegatedBandwidthTo, {array: true})
    declare delegated_to: DelegatedBandwidthTo[]
    @Struct.field(LinkAuth, {array: true}) declare linkauth: LinkAuth[]
    @Struct.field(Permission, {array: true}) declare permissions: Permission[]
    @Struct.field(ResourceInfo) declare resources: ResourceInfo
    @Struct.field(CodeHashEntry, {optional: true}) declare code?: CodeHashEntry
}

@Struct.type('balances_response')
export class BalancesResponse extends Struct {
    @Struct.field(Name) declare account_name: Name
    @Struct.field(BalanceEntry, {array: true}) declare balances: BalanceEntry[]
    @Struct.field(ChainInfo) declare chain: ChainInfo
}

@Struct.type('rex_balance_response')
export class RexBalanceResponse extends Struct {
    @Struct.field(Name) declare account_name: Name
    @Struct.field(ChainInfo) declare chain: ChainInfo
    @Struct.field(RexDisplayBalances) declare rex: RexDisplayBalances
}

@Struct.type('rex_raw_response')
export class RexRawResponse extends Struct {
    @Struct.field(Name) declare account_name: Name
    @Struct.field(ChainInfo) declare chain: ChainInfo
    @Struct.field(RexRaw) declare rexraw: RexRaw
}

@Struct.type('account_response')
export class AccountResponse extends Struct {
    @Struct.field(Name) declare account_name: Name
    @Struct.field(BalanceEntry, {array: true}) declare balances: BalanceEntry[]
    @Struct.field(ChainInfo) declare chain: ChainInfo
    @Struct.field(CodeHashEntry, {optional: true}) declare code?: CodeHashEntry
    @Struct.field(DelegatedBandwidthFrom, {array: true})
    declare delegated_from: DelegatedBandwidthFrom[]
    @Struct.field(DelegatedBandwidthTo, {array: true})
    declare delegated_to: DelegatedBandwidthTo[]
    @Struct.field(LinkAuth, {array: true}) declare linkauth: LinkAuth[]
    @Struct.field(Permission, {array: true}) declare permissions: Permission[]
    @Struct.field(RexDisplayBalances) declare rex: RexDisplayBalances
    @Struct.field(ResourceInfo) declare resources: ResourceInfo
}
