<script lang="ts">
    import type {ChainDefinition} from '@wharfkit/common'
    import type {LoginContext} from '@wharfkit/session'
    import Button from '../Button.svelte'
    import SelectCard from '../SelectCard.svelte'
    import Spinner from '../Spinner.svelte'
    import TextInput from '../TextInput.svelte'
    import type {LookupFailure} from '../../../lib/login-steps.js'
    import {classifyLookupFailure} from '../../../lib/login-steps.js'
    import {isValidName} from '../../../lib/name.js'

    interface Props {
        context: LoginContext
        chain?: ChainDefinition
        account: string
        onselect?: (permissionLevel: string) => void
        onfail?: (failure: LookupFailure) => void
    }

    let {context, chain, account, onselect, onfail}: Props = $props()

    interface AccountPermission {
        name: string
        parent: string
    }

    let loading = $state(true)
    let permissions = $state<AccountPermission[]>([])
    let manual = $state('')
    let showError = $state(false)
    let started = false

    let manualValid = $derived(isValidName(manual))

    function choose(permission: string) {
        onselect?.(`${account}@${permission}`)
    }

    function submitManual() {
        if (!manualValid) {
            showError = true
            return
        }
        choose(manual)
    }

    async function load() {
        // Without a chain there is no endpoint to read permissions from, so they get named by hand.
        if (!chain) {
            loading = false
            return
        }
        try {
            const response = await context.getClient(chain).v1.chain.get_account(account)
            permissions = response.permissions.map((permission) => ({
                name: String(permission.perm_name),
                parent: String(permission.parent),
            }))
            if (permissions.length === 0) {
                onfail?.('not-found')
                return
            }
            if (permissions.length === 1) {
                choose(permissions[0].name)
                return
            }
            loading = false
        } catch (error) {
            onfail?.(classifyLookupFailure(error))
        }
    }

    $effect(() => {
        if (started) return
        started = true
        load()
    })
</script>

{#if loading}
    <div class="choice-loading">
        <Spinner />
        <p>Looking up {account}…</p>
    </div>
{:else if chain}
    <div class="choice-list">
        {#each permissions as permission}
            <SelectCard
                label={permission.name}
                caption={permission.parent ? `Under ${permission.parent}` : undefined}
                icon={false}
                onclick={() => choose(permission.name)}
            />
        {/each}
    </div>
{:else}
    <div class="choice-manual">
        <p class="choice-note">
            The permissions on {account} can't be listed without a blockchain to read them from. Name
            the permission you sign with.
        </p>
        <TextInput
            bind:value={manual}
            label="Permission"
            placeholder="active"
            prefix="@"
            invalid={showError && !manualValid}
            autofocus
            onenter={submitManual}
        />
        {#if showError && !manualValid}
            <p class="choice-error">
                Permission names use the letters a–z, the digits 1–5, and periods, up to 12
                characters.
            </p>
        {/if}
        <Button block onclick={submitManual}>Continue</Button>
    </div>
{/if}

<style>
    .choice-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .choice-manual {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .choice-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 40px 0;
    }

    .choice-loading p {
        margin: 0;
        font-size: 14px;
        color: var(--web-ui-text-secondary);
        font-family: var(--web-ui-font);
    }

    .choice-note {
        margin: 0;
        font-family: var(--web-ui-font);
        font-size: 13px;
        line-height: 1.5;
        color: var(--web-ui-text-secondary);
    }

    .choice-error {
        margin: -4px 0 0;
        font-family: var(--web-ui-font);
        font-size: 12px;
        line-height: 1.5;
        color: var(--web-ui-error);
    }
</style>
