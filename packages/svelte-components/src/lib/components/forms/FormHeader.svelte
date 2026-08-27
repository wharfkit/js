<script lang="ts">
	export interface FormHeaderProps {
		title: string;
		text: string;
	}
	let props: FormHeaderProps = $props();
</script>

<header class="col-span-full space-y-2 @3xl:col-span-1">
	<h3 class="text-title font-semibold">{props.title}</h3>
	<p class="max-w-prose text-pretty @3xl:text-balance">{props.text}</p>
</header>
