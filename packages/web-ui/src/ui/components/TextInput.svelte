<script lang="ts">
    interface Props {
        value: string
        label: string
        placeholder?: string
        invalid?: boolean
        autofocus?: boolean
        prefix?: string
        onenter?: () => void
    }

    let {
        value = $bindable(),
        label,
        placeholder,
        invalid = false,
        autofocus = false,
        prefix,
        onenter,
    }: Props = $props()

    let input = $state<HTMLInputElement | undefined>()

    $effect(() => {
        if (autofocus) input?.focus()
    })

    function onkeydown(event: KeyboardEvent) {
        // @wc-ignore
        if (event.key === 'Enter') {
            event.preventDefault()
            onenter?.()
        }
    }
</script>

<label class="field">
    <span class="field-label">{label}</span>
    <span class="field-control" class:invalid>
        {#if prefix}
            <span class="field-prefix" aria-hidden="true">{prefix}</span>
        {/if}
        <input
            bind:this={input}
            bind:value
            {placeholder}
            {onkeydown}
            type="text"
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            aria-invalid={invalid}
        />
    </span>
</label>

<style>
    .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .field-label {
        font-family: var(--web-ui-font);
        font-size: 12px;
        font-weight: 500;
        color: var(--web-ui-text-secondary);
    }

    .field-control {
        display: flex;
        align-items: center;
        gap: 2px;
        height: 44px;
        padding: 0 14px;
        border: 1px solid var(--web-ui-border);
        border-radius: var(--web-ui-radius-sm);
        background: var(--web-ui-bg);
        transition: border-color 150ms var(--web-ui-ease);
        box-sizing: border-box;
    }

    .field-control:hover {
        border-color: var(--web-ui-text-secondary);
    }

    .field-control:focus-within {
        border-color: var(--web-ui-accent);
        outline: 2px solid var(--web-ui-ring);
        outline-offset: 1px;
    }

    .field-control.invalid {
        border-color: var(--web-ui-error);
    }

    .field-prefix {
        font-family: var(--web-ui-font-mono);
        font-size: 15px;
        color: var(--web-ui-text-secondary);
    }

    input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        color: var(--web-ui-text);
        font-family: var(--web-ui-font-mono);
        font-size: 15px;
        letter-spacing: -0.005em;
        padding: 0;
    }

    input::placeholder {
        color: var(--web-ui-text-secondary);
        opacity: 0.7;
    }
</style>
