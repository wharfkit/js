import {
    ABI,
    API,
    BlockTimestamp,
    Checksum256,
    Float64,
    Int64,
    Name,
    PermissionLevel,
    Struct,
    TimePoint,
    UInt32,
    UInt64,
    UInt8,
} from '@wharfkit/antelope'

export namespace V1 {}

export namespace V2 {
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
        @Struct.field(GetVotersResponseVoter, {array: true})
        declare voters: GetVotersResponseVoter[]
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

    @Struct.type('account_sequence')
    export class AccountSequence extends Struct {
        @Struct.field(Name) declare account: Name
        @Struct.field(UInt64) declare sequence: UInt64
    }

    @Struct.type('action_receipt')
    export class ActionReceipt extends Struct {
        @Struct.field(Name) declare receiver: Name
        @Struct.field(UInt64) declare global_sequence: UInt64
        @Struct.field(UInt64) declare recv_sequence: UInt64
        @Struct.field(AccountSequence, {array: true}) declare auth_sequence: AccountSequence[]
    }

    @Struct.type('action_ram_delta')
    export class ActionRamDelta extends Struct {
        @Struct.field(Name) declare account: Name
        @Struct.field(Int64) declare delta: Int64
    }

    @Struct.type('action')
    export class Action extends Struct {
        @Struct.field(BlockTimestamp) declare timestamp: BlockTimestamp
        @Struct.field(UInt32) declare block_num: UInt32
        @Struct.field(Checksum256, {optional: true}) declare block_id: Checksum256
        @Struct.field(Checksum256) declare trx_id: Checksum256
        @Struct.field(ActionAct) declare act: ActionAct
        @Struct.field(ActionReceipt, {array: true, optional: true})
        declare receipts: ActionReceipt[]
        @Struct.field(ActionRamDelta, {array: true, optional: true})
        declare account_ram_deltas: ActionRamDelta[]
        @Struct.field(UInt64) declare global_sequence: UInt64
        @Struct.field(Name) declare producer: Name
        @Struct.field(UInt64) declare action_ordinal: UInt64
        @Struct.field(UInt64) declare creator_action_ordinal: UInt64
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
    @Struct.type('get_account_response_link')
    export class GetAccountResponseLink extends Struct {
        @Struct.field(BlockTimestamp) declare timestamp: BlockTimestamp
        @Struct.field(Name) declare permission: Name
        @Struct.field(Name) declare code: Name
        @Struct.field(Name) declare action: Name
    }

    @Struct.type('get_account_response')
    export class GetAccountResponse extends Struct {
        @Struct.field(Float64) declare query_time_ms: Float64
        @Struct.field(API.v1.AccountObject) declare account: API.v1.AccountObject
        @Struct.field(GetAccountResponseLink, {array: true}) declare links: GetAccountResponseLink[]
        @Struct.field(TokenInfo, {array: true}) declare tokens: TokenInfo[]
        @Struct.field(UInt64) declare total_actions: UInt64
        @Struct.field(Action, {array: true}) declare actions: Action[]
    }

    // For the `health` field
    @Struct.type('health_entry')
    export class HealthEntry extends Struct {
        @Struct.field('string') declare service: string
        @Struct.field('string') declare status: string
        @Struct.field('any', {optional: true}) declare service_data?:
            | NodeosRPCServiceData
            | ElasticsearchServiceData
        @Struct.field(UInt64) declare time: UInt64
    }

    @Struct.type('nodeos_rpc_service_data')
    export class NodeosRPCServiceData extends Struct {
        @Struct.field(UInt64) declare head_block_num: UInt64
        @Struct.field('string') declare head_block_time: string
        @Struct.field(UInt64) declare time_offset: UInt64
        @Struct.field(UInt64) declare last_irreversible_block: UInt64
        @Struct.field('string') declare chain_id: string
    }

    @Struct.type('elasticsearch_service_data')
    export class ElasticsearchServiceData extends Struct {
        @Struct.field('string') declare active_shards: string
        @Struct.field(UInt64) declare head_offset: UInt64
        @Struct.field(UInt64) declare first_indexed_block: UInt64
        @Struct.field(UInt64) declare last_indexed_block: UInt64
        @Struct.field(UInt64) declare total_indexed_blocks: UInt64
        @Struct.field(UInt64) declare missing_blocks: UInt64
        @Struct.field('string') declare missing_pct: string
    }

    // For the `features` field
    @Struct.type('streaming_features')
    export class StreamingFeatures extends Struct {
        @Struct.field('bool') declare enable: boolean
        @Struct.field('bool') declare traces: boolean
        @Struct.field('bool') declare deltas: boolean
    }

    @Struct.type('tables_features')
    export class TablesFeatures extends Struct {
        @Struct.field('bool') declare proposals: boolean
        @Struct.field('bool') declare accounts: boolean
        @Struct.field('bool') declare voters: boolean
    }

    // For the `features` in the main type
    @Struct.type('features')
    export class Features extends Struct {
        @Struct.field(StreamingFeatures) declare streaming: StreamingFeatures
        @Struct.field(TablesFeatures) declare tables: TablesFeatures
        @Struct.field('bool') declare index_deltas: boolean
        @Struct.field('bool') declare index_transfer_memo: boolean
        @Struct.field('bool') declare index_all_deltas: boolean
        @Struct.field('bool') declare deferred_trx: boolean
        @Struct.field('bool') declare failed_trx: boolean
        @Struct.field('bool') declare resource_limits: boolean
        @Struct.field('bool') declare resource_usage: boolean
    }

    // The main type
    @Struct.type('get_health_response')
    export class GetHealthResponse extends Struct {
        @Struct.field('string') declare version: string
        @Struct.field('string') declare version_hash: string
        @Struct.field('string') declare host: string
        @Struct.field(HealthEntry, {array: true}) declare health: HealthEntry[]
        @Struct.field(Features) declare features: Features
        @Struct.field(Float64) declare query_time_ms: Float64
    }
}
