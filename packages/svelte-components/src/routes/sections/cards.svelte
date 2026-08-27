<script>
	import { Button, Card, Stack, Switcher } from '$lib';
</script>

<Stack tag="section" id="cards">
	<h2 class="text-headline">Cards</h2>
	<p>Consistent card shape and color, with a predefined slot for a title</p>
	<Card title="Card Title">
		<p>Card content</p>
	</Card>
	<p>Cards can be nested</p>
	<Card title="Outer">
		<Stack>
			<Card class="bg-surface-container">nested inner</Card>
			<Switcher>
				<Button variant="text">Cancel</Button>
				<Button variant="primary">Confirm</Button>
			</Switcher>
		</Stack>
	</Card>
</Stack>
