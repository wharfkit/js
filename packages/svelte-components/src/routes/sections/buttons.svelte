<script>
	import { Button, Card, Cluster, Code, CopyButton, IconButton, Stack } from '$lib';
	import User from '@lucide/svelte/icons/user';
</script>

<Stack tag="section" id="buttons">
	<h2 class="text-headline">Buttons</h2>

	<p>Buttons can be links if the `href` attribute is present</p>
	<p>
		Primary and Secondary buttons get a height of <Code inline>h-12</Code> since they are mostly block
		level elements. Text and pill buttons are smaller to fit into inline contexts e.g. table rows
	</p>

	<Card title="Primary">
		<Cluster>
			<Stack class="gap-2">
				<p class="text-label">Default</p>
				<Button variant="primary" onclick={() => {}}>EOS (0)</Button>
			</Stack>
			<Stack class="gap-2">
				<p class="text-label">Disabled</p>
				<Button variant="primary" disabled onclick={() => {}}>EOS (0)</Button>
			</Stack>
		</Cluster>
	</Card>

	<Card title="Secondary">
		<Cluster>
			<Stack class="gap-2">
				<p class="text-label">Default</p>
				<Button variant="secondary" onclick={() => {}}>EOS (1)</Button>
			</Stack>
			<Stack class="gap-2">
				<p class="text-label">Disabled</p>
				<Button variant="secondary" disabled onclick={() => {}}>EOS (1)</Button>
			</Stack>
		</Cluster>
	</Card>

	<Card title="Pill">
		<Cluster>
			<Stack class="gap-1">
				<p class="text-label">Default</p>
				<Button variant="pill" aria-current={undefined}>EOS (MAX)</Button>
			</Stack>
			<Stack class="gap-1">
				<p class="text-label">Active</p>
				<Button variant="pill" aria-current={true} onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
		</Cluster>
	</Card>

	<Card title="Text">
		<Cluster>
			<Stack class="gap-1">
				<p class="text-label">Default</p>
				<Button variant="text" onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
			<Stack class="gap-1">
				<p class="text-label">Disabled</p>
				<Button variant="text" disabled onclick={() => {}}>EOS (MAX)</Button>
			</Stack>
		</Cluster>
	</Card>

	<Card title="Icon Buttons">
		<Stack>
			<Cluster>
				<Stack class="gap-1">
					<p class="text-label">Default</p>
					<IconButton icon={User} onclick={() => {}}>Cancel</IconButton>
				</Stack>
				<Stack class="gap-1">
					<p class="text-label">Large</p>
					<IconButton size="large" icon={User} onclick={() => {}}>Cancel</IconButton>
				</Stack>
			</Cluster>

			<Stack class="gap-1">
				<p class="">Copy Button</p>
				<CopyButton data="test" />
			</Stack>
		</Stack>
	</Card>
</Stack>
