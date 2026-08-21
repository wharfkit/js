<script lang="ts">
    interface Props {
        data: {content?: string} | string
    }

    let {data}: Props = $props()

    let content = $derived(typeof data === 'string' ? data : (data?.content ?? ''))
</script>

<textarea class="prompt-textarea" readonly rows="9" spellcheck="false" value={content}></textarea>

<style>
    .prompt-textarea {
        width: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: 12px 14px;
        resize: none;
        overflow-y: auto;
        border: 1px solid var(--web-ui-border);
        border-radius: var(--web-ui-radius-sm);
        background: var(--web-ui-surface);
        color: var(--web-ui-text);
        font-family: var(--web-ui-font-mono);
        font-size: 12px;
        line-height: 1.6;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        user-select: text;
        -webkit-user-select: text;
    }

    .prompt-textarea:focus-visible {
        outline: 2px solid var(--web-ui-ring);
        outline-offset: 2px;
    }
</style>
