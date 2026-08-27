<script>
	import { Card, Cluster, Code, Stack, Switcher } from '$lib';
</script>

<Stack tag="section" id="layout" class="max-w-prose">
	<h2 class="text-headline">Layout</h2>
	<p>
		These layout components are inspired by the elemental layouts defined by Heydon Pickering and
		Andy Bell in <a class="underline" href="https://every-layout.dev/">Every Layout</a>.
	</p>
	<p>
		We're only using a couple here; the others are either easy enough to implement on an ad-hoc
		basis with tailwind (e.g. Box, Center) without introducing new elements, or they are more
		situational and a degree of control is required (e.g. Grid, Sidebar)
	</p>
	<Stack>
		<h3 class="text-title">Stack</h3>
		<p>Stacks children vertically with a default gap</p>
		<p>Note: Stack provides no leading or trailing space</p>
		<Stack>
			<Card>
				<p>Child 1</p>
			</Card>
			<Card>
				<p>Child 2</p>
			</Card>
			<Card>
				<p>Child 3</p>
			</Card>
		</Stack>

		<p>
			You can push items to the top or bottom of the stack by using mt-auto or mb-auto if the parent
			has a defined height
		</p>
		<Stack class="h-72">
			<Card>
				<p>Child 1</p>
			</Card>
			<Card>
				<p>Child 2 - Then a bigger gap to the bottom of the element</p>
			</Card>
			<Card class="mt-auto">
				<p>Child 3 with <Code inline>mt-auto</Code></p>
			</Card>
		</Stack>

		<p>You can customize the gap if needed</p>
		<Stack class="gap-2">
			<Card>
				<p>Child 1</p>
			</Card>
			<Card>
				<p>Child 2</p>
			</Card>
			<Card>
				<p>Child 3</p>
			</Card>
		</Stack>
	</Stack>

	<Stack>
		<h3 class="text-title">Switcher</h3>
		<p>
			The Switcher switches a flexbox context between horizontal and a vertical layout at a
			predefined parent-based breakpoint.
		</p>
		<p>
			This layout is useful when all elements inside the switcher are considered of equal
			importance.
		</p>
		<p>
			For example, if the breakpoint is 30rem the layout will switch to vertical when the parent
			container itself is less than 30rem wide.
		</p>

		<Switcher threshold="30rem">
			<Card>
				<p>Child 1</p>
			</Card>
			<Card>
				<p>Child 2</p>
			</Card>
			<Card>
				<p>Child 3</p>
			</Card>
		</Switcher>

		<p>This switcher is set to a 60rem threshold</p>

		<Switcher threshold="60rem">
			<Card>
				<p>Child 1</p>
			</Card>
			<Card>
				<p>Child 2</p>
			</Card>
			<Card>
				<p>Child 3</p>
			</Card>
		</Switcher>
	</Stack>

	<Stack>
		<h3 class="text-title">Cluster</h3>
		<p>
			Clusters children horizontally with a default gap. The cluster will re-flow when the screen
			size changes.
		</p>
		<p>This is essentially just typical flex-wrap behaviour with some default gaps.</p>
		<p>Note: no leading or trailing horizontal gap.</p>
		<Cluster>
			<Card>
				<p>Child 1</p>
			</Card>
			<Card>
				<p>Child 2 is larger</p>
			</Card>
			<Card>
				<p>Child 3 is also large</p>
			</Card>
			<Card>
				<p>Child 4</p>
			</Card>
			<Card>
				<p>Child 5</p>
			</Card>
			<Card>
				<p>Child 6</p>
			</Card>
		</Cluster>
	</Stack>
</Stack>
