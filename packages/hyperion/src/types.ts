import {
    ABI,
    BlockTimestamp,
    Checksum256,
    Float64,
    Name,
    PermissionLevel,
    Struct,
    TimePoint,
    UInt32,
    UInt64,
    UInt8,
} from '@wharfkit/antelope'

@Struct.type('get_abi_snapshot_response')
export class GetABISnapshotResponse extends Struct {
    @Struct.field(UInt32) declare block_num: UInt32
    @Struct.field(ABI) declare abi: ABI
    @Struct.field(Float64) declare query_time_ms: Float64
}

@Struct.type('get_voters_response_voter')
export class GetVotersResponseVoter extends Struct {
    @Struct.field(Name) declare account: Name
    @Struct.field(Float64) declare weight: Float64
    @Struct.field(UInt32) declare last_vote: UInt32
}

@Struct.type('get_voters_response')
export class GetVotersResponse extends Struct {
    @Struct.field(GetVotersResponseVoter, {array: true}) declare voters: GetVotersResponseVoter[]
}

@Struct.type('get_links_response_link')
export class GetLinksResponseLink extends Struct {
    @Struct.field(UInt32) declare block_num: UInt32
    @Struct.field(BlockTimestamp) declare timestamp: BlockTimestamp
    @Struct.field(Name) declare account: Name
    @Struct.field('string') declare permission: string
    @Struct.field('string') declare code: string
    @Struct.field('string') declare action: string
    @Struct.field('bool', {optional: true}) declare irreversible?: boolean
}

@Struct.type('total_count')
export class TotalCount extends Struct {
    @Struct.field(UInt32) declare value: UInt32
    @Struct.field('string') declare relation: string
}

@Struct.type('get_links_response')
export class GetLinksResponse extends Struct {
    @Struct.field(Float64) declare query_time_ms: Float64
    @Struct.field('bool') declare cached: boolean
    @Struct.field('bool', {optional: true}) declare hot_only?: boolean
    @Struct.field(UInt32, {optional: true}) declare lib?: UInt32
    @Struct.field(TotalCount) declare total: TotalCount
    @Struct.field(GetLinksResponseLink, {array: true}) declare links: GetLinksResponseLink[]
}

@Struct.type('approval')
export class Approval extends Struct {
    @Struct.field(Name) declare actor: Name
    @Struct.field(Name) declare permission: Name
    @Struct.field(TimePoint) declare time: TimePoint
}

@Struct.type('proposal')
export class Proposal extends Struct {
    @Struct.field(Approval, {array: true}) declare provided_approvals: Approval[]
    @Struct.field(Approval, {array: true}) declare requested_approvals: Approval[]
    @Struct.field(UInt32) declare block_num: UInt32
    @Struct.field(Name) declare proposer: Name
    @Struct.field(Name) declare proposal_name: Name
    @Struct.field(UInt64) declare primary_key: UInt64
    @Struct.field('bool') declare executed: boolean
}

@Struct.type('get_proposals_response')
export class GetProposalsResponse extends Struct {
    @Struct.field(Float64, {optional: true}) declare query_time?: Float64
    @Struct.field('bool') declare cached: boolean
    @Struct.field(TotalCount) declare total: TotalCount
    @Struct.field(Proposal, {array: true}) declare proposals: Proposal[]
    @Struct.field(Float64) declare query_time_ms: Float64
}

@Struct.type('act')
export class ActionAct extends Struct {
    @Struct.field(Name) declare account: Name
    @Struct.field(Name) declare name: Name
    @Struct.field(PermissionLevel, {array: true}) declare authorization: PermissionLevel[]
    @Struct.field('any') declare data: any
}

@Struct.type('action')
export class Action extends Struct {
    @Struct.field(UInt32) declare block_num: UInt32
    @Struct.field(BlockTimestamp) declare timestamp: BlockTimestamp
    @Struct.field(Checksum256) declare trx_id: Checksum256
    @Struct.field(ActionAct) declare act: ActionAct
}

@Struct.type('get_actions_response')
export class GetActionsResponse extends Struct {
    @Struct.field(Float64) declare query_time_ms: Float64
    @Struct.field('bool') declare cached: boolean
    @Struct.field(UInt32, {optional: true}) declare lib?: UInt32
    @Struct.field(TotalCount) declare total: TotalCount
    @Struct.field(Action, {array: true}) declare actions: Action[]
}

@Struct.type('account_info')
export class AccountInfo extends Struct {
    @Struct.field(Name) declare name: Name
    @Struct.field(Checksum256) declare trx_id: Checksum256
    @Struct.field(TimePoint) declare timestamp: TimePoint
}

@Struct.type('get_created_accounts_response')
export class GetCreatedAccountsResponse extends Struct {
    @Struct.field(Float64) declare query_time_ms: Float64
    @Struct.field(AccountInfo, {array: true}) declare accounts: AccountInfo[]
}

@Struct.type('get_creator_response')
export class GetCreatorResponse extends Struct {
    @Struct.field(Float64) declare query_time_ms: Float64
    @Struct.field(Name) declare account: Name
    @Struct.field(Name) declare creator: Name
    @Struct.field(BlockTimestamp) declare timestamp: BlockTimestamp
    @Struct.field(UInt32) declare block_num: UInt32
    @Struct.field(Checksum256) declare trx_id: Checksum256
}

@Struct.type('delta')
export class Delta extends Struct {
    @Struct.field(BlockTimestamp) declare timestamp: BlockTimestamp
    @Struct.field(UInt8) declare present: UInt8
    @Struct.field(Name) declare code: Name
    @Struct.field(Name) declare scope: Name
    @Struct.field(Name) declare table: Name
    @Struct.field(Name) declare primary_key: Name
    @Struct.field(Name) declare payer: Name
    @Struct.field(UInt64) declare block_num: UInt64
    @Struct.field(Checksum256) declare block_id: Checksum256
    @Struct.field('any') declare data: any
}

@Struct.type('get_deltas_response')
export class GetDeltasResponse extends Struct {
    @Struct.field(Float64) declare query_time_ms: Float64
    @Struct.field(TotalCount) declare total: TotalCount
    @Struct.field(Delta, {array: true}) declare deltas: Delta[]
}

@Struct.type('get_table_state_response')
export class GetTableStateResponse extends Struct {
    @Struct.field(Float64) declare query_time_ms: Float64
    @Struct.field(Name) declare code: Name
    @Struct.field(Name) declare table: Name
    @Struct.field(UInt64) declare block_num: UInt64
    @Struct.field('string') declare after_key: string
    @Struct.field('string') declare next_key: string
    @Struct.field('any', {array: true}) declare results: any[]
}

@Struct.type('get_key_accounts_response')
export class GetKeyAccountsResponse extends Struct {
    @Struct.field(Name, {array: true}) declare account_names: Name[]
}

@Struct.type('token_info')
export class TokenInfo extends Struct {
    @Struct.field('string') declare symbol: string
    @Struct.field(Float64) declare amount: Float64
    @Struct.field('string') declare contract: 'string'
    @Struct.field(UInt32, {optional: true}) declare precision?: UInt32
    @Struct.field('string', {optional: true}) declare error?: string
}
@Struct.type('get_tokens_response')
export class GetTokensResponse extends Struct {
    @Struct.field(Name) declare account: Name
    @Struct.field(Float64) declare query_time_ms: Float64
    @Struct.field(TokenInfo, {array: true}) declare tokens: TokenInfo[]
}

@Struct.type('get_transaction_response')
export class GetTransactionResponse extends Struct {
    @Struct.field(Float64) declare query_time_ms: Float64
    @Struct.field('bool') declare executed: boolean
    @Struct.field(Checksum256) declare trx_id: Checksum256
    @Struct.field(UInt32) declare lib: UInt32
    @Struct.field('bool') declare cached_lib: boolean
    @Struct.field(Action, {array: true}) declare actions: Action[]
}
