<script lang="ts">
    import type {UserInterfaceLoginResponse} from '@wharfkit/session'
    import Modal from './components/Modal.svelte'
    import ErrorView from './components/ErrorView.svelte'
    import Login from './views/Login.svelte'
    import Transact from './views/Transact.svelte'
    import Prompt from './views/Prompt.svelte'
    import SessionKeyConsent from './views/SessionKeyConsent.svelte'
    import SessionKeyConflict from './views/SessionKeyConflict.svelte'
    import SessionKeyMismatch from './views/SessionKeyMismatch.svelte'
    import SessionKeyRemove from './views/SessionKeyRemove.svelte'
    import {uiState} from './stores/state.svelte.js'

    interface Props {
        closeOnOverlayClick?: boolean
        closeOnEscape?: boolean
        oncancel?: () => void
        onlogincomplete?: (response: UserInterfaceLoginResponse) => void
        onpromptconfirm?: () => void
        onskconsentapprove?: () => void
        onskconflictselect?: (choice: 'add' | 'replace' | 'cancel') => void
        onskmismatchselect?: (choice: 'update' | 'dismiss') => void
        onskremoveconfirm?: () => void
        ontransactdone?: () => void
    }

    let {
        closeOnOverlayClick = true,
        closeOnEscape = true,
        oncancel,
        onlogincomplete,
        onpromptconfirm,
        onskconsentapprove,
        onskconflictselect,
        onskmismatchselect,
        onskremoveconfirm,
        ontransactdone,
    }: Props = $props()
</script>

<Modal {closeOnOverlayClick} {closeOnEscape} onclose={oncancel}>
    {#if uiState.view === 'login'}
        <Login onclose={oncancel} oncomplete={onlogincomplete} />
    {:else if uiState.view === 'transact'}
        <Transact onclose={oncancel} ondone={ontransactdone} />
    {:else if uiState.view === 'prompt'}
        <Prompt
            title={uiState.promptTitle}
            body={uiState.promptBody}
            onclose={oncancel}
            onconfirm={onpromptconfirm}
        />
    {:else if uiState.view === 'error'}
        <ErrorView
            message={uiState.errorMessage}
            details={uiState.errorDetails}
            onclose={oncancel}
        />
    {:else if uiState.view === 'sk-consent'}
        <SessionKeyConsent onclose={oncancel} onapprove={onskconsentapprove} />
    {:else if uiState.view === 'sk-conflict'}
        <SessionKeyConflict onclose={oncancel} onselect={onskconflictselect} />
    {:else if uiState.view === 'sk-mismatch'}
        <SessionKeyMismatch onclose={oncancel} onselect={onskmismatchselect} />
    {:else if uiState.view === 'sk-remove'}
        <SessionKeyRemove onclose={oncancel} onconfirm={onskremoveconfirm} />
    {/if}
</Modal>
