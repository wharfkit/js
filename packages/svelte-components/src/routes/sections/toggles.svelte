<script>
	import { Card, Checkbox, Cluster, Stack, Switch } from '$lib';
</script>

<Stack id="toggles" tag="section">
	<h2 class="text-headline">Toggles</h2>

	<Card title="Switch">
		<Cluster>
			<Stack class="gap-4">
				<p class="text-label">Default</p>
				<Switch id="1" checked />
			</Stack>

			<Stack class="gap-4">
				<p class="text-label">Disabled</p>
				<Switch id="1" checked={false} disabled />
			</Stack>
		</Cluster>
	</Card>

	<Card title="Checkbox">
		<Cluster>
			<Stack class="gap-4">
				<p class="text-label">Default</p>
				<Checkbox id="2" checked />
			</Stack>

			<Stack class="gap-4">
				<p class="text-label">Disabled</p>
				<Checkbox id="2" checked={false} disabled />
			</Stack>
		</Cluster>
	</Card>
</Stack>
