<script lang="ts">
    import Button from '../Button.svelte'
    import TextInput from '../TextInput.svelte'
    import {isValidName} from '../../../lib/name.js'

    interface Props {
        value: string
        error?: string
        onsubmit?: (account: string) => void
    }

    let {value = $bindable(), error = '', onsubmit}: Props = $props()

    let showError = $state(false)

    let valid = $derived(isValidName(value))

    function submit() {
        if (!valid) {
            showError = true
            return
        }
        onsubmit?.(value)
    }
</script>

<div class="entry">
    <TextInput
        bind:value
        label="Account name"
        placeholder="youraccount"
        invalid={Boolean(error) || (showError && !valid)}
        autofocus
        onenter={submit}
    />

    {#if showError && !valid}
        <p class="entry-error">
            Account names use the letters a–z, the digits 1–5, and periods, up to 12 characters.
        </p>
    {:else if error}
        <p class="entry-error">{error}</p>
    {/if}

    <Button block onclick={submit}>Continue</Button>
</div>

<style>
    .entry {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .entry-error {
        margin: -4px 0 0;
        font-family: var(--web-ui-font);
        font-size: 12px;
        line-height: 1.5;
        color: var(--web-ui-error);
    }
</style>
