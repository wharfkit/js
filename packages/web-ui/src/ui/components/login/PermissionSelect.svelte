<script lang="ts">
    import type {ChainDefinition} from '@wharfkit/common'
    import type {LoginContext, UserInterfaceWalletPlugin} from '@wharfkit/session'
    import SelectCard from '../SelectCard.svelte'
    import Spinner from '../Spinner.svelte'

    interface Props {
        context: LoginContext
        chain: ChainDefinition
        walletPlugin: UserInterfaceWalletPlugin
        onselect?: (permissionLevel: string) => void
    }

    let {context, chain, walletPlugin, onselect}: Props = $props()

    interface AccountsByAuthorizers {
        accounts: {account_name: string; permission_name: string}[]
    }

    let loading = $state(true)
    let permissions = $state<string[]>([])
    let publicKey = $state('')
    let failure = $state('')
    let started = false

    async function load() {
        try {
            let key = walletPlugin.metadata.publicKey
            if (!key && walletPlugin.retrievePublicKey) {
                key = String(await walletPlugin.retrievePublicKey(chain.id))
            }
            if (!key) {
                throw new Error('The wallet did not provide a public key.')
            }
            publicKey = String(key)
            const response = await context.getClient(chain).call<AccountsByAuthorizers>({
                path: '/v1/chain/get_accounts_by_authorizers',
                params: {keys: [publicKey]},
            })
            const found = response.accounts.map(
                (account) => `${account.account_name}@${account.permission_name}`
            )
            permissions = [...new Set(found)]
        } catch (error) {
            failure = error instanceof Error ? error.message : String(error)
        } finally {
            loading = false
        }
    }

    $effect(() => {
        if (started) return
        started = true
        load()
    })
</script>

{#if loading}
    <div class="permission-loading">
        <Spinner />
        <p>Looking up your accounts…</p>
    </div>
{:else if failure}
    <p class="permission-note">{failure}</p>
{:else if permissions.length > 0}
    <div class="permission-list">
        {#each permissions as permissionLevel}
            {@const [account, permission] = permissionLevel.split('@')}
            <SelectCard
                label={account}
                caption="@{permission}"
                icon={false}
                onclick={() => onselect?.(permissionLevel)}
            />
        {/each}
    </div>
{:else}
    <p class="permission-note">
        No accounts on {chain.name} use the key this wallet provided. Go back to pick a different wallet.
    </p>
    <p class="permission-key">{publicKey}</p>
{/if}

<style>
    .permission-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .permission-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 40px 0;
    }

    .permission-loading p {
        margin: 0;
        font-size: 14px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }

    .permission-note {
        margin: 0;
        font-size: 14px;
        line-height: 1.5;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }

    .permission-key {
        margin: 10px 0 0;
        padding: 10px 12px;
        background: var(--web-ui-surface);
        border-radius: var(--web-ui-radius-xs);
        font-family: var(--web-ui-font-mono);
        font-size: 12px;
        line-height: 1.5;
        color: var(--web-ui-text-secondary);
        overflow-wrap: anywhere;
    }
</style>
