<script>
	// @ts-nocheck

	import { Card, Checkbox, Cluster, Stack, Switch } from '$lib';
	import Button from '$lib/components/Button.svelte';

	let checkBoxDisabled = $state(false);
	let checkBoxChecked = $state(false);
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

			<Stack class="gap-4">
				<p class="text-label">Dynamic Checked State</p>
				<Checkbox id="2" checked={checkBoxChecked} />
				<Button
					variant="primary"
					onclick={() => {
						checkBoxChecked = !checkBoxChecked;
					}}
				>
					{checkBoxChecked ? 'Set Unchecked' : 'Set Checked'}
				</Button>
			</Stack>

			<Stack class="gap-4">
				<p class="text-label">Dynamic Disabled State</p>
				<Checkbox id="2" checked={false} disabled={checkBoxDisabled} />
				<Button
					variant="primary"
					onclick={() => {
						checkBoxDisabled = !checkBoxDisabled;
					}}
				>
					{checkBoxDisabled ? 'Set Enabled' : 'Set Disabled'}
				</Button>
			</Stack>
		</Cluster>
	</Card>
</Stack>
