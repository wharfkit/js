<script>
	import { Col, Table, Button, TH, TD, TR, Card, Chip, DD, DL, DLRow, Stack } from '$lib';

	const items = [
		{ title: 'Some title', description: String(Math.random()) },
		{ title: 'Some title', description: String(Math.random()) },
		{ title: 'Some title', description: String(Math.random()) },
		{ title: 'Some title', description: String(Math.random()) },
		{ title: 'Some title', description: String(Math.random()) }
	];
</script>

<Stack tag="section" id="tabular">
	<h2 class="text-headline">Tabular Data</h2>

	<Stack>
		<h3 class="text-title">Description List</h3>

		<p>
			For a two-column key-value type data we can use the description list component. This will
			collapse the value under the key and right-align it on smaller screens. Note there is no row
			striping here.
		</p>

		<Card class="max-w-md" title="Some items">
			<DL {items} />
		</Card>

		<p>
			For displaying a component in the description, or multiple values under a single key, you can
			use the components declaratively.
		</p>

		<p>
			Note: If using the components declaratively you'll need to wrap the child component correctly
			or you'll get a warning. There are CSS rules that'll visually yell at you to fix it :)
		</p>

		<Card class="max-w-md">
			<DL>
				<DLRow title="First">
					<DD>
						<Chip>teamgreymass</Chip>
						<!-- <Account name="teamgreymass" /> -->
					</DD>
				</DLRow>
				<DLRow title="Second">
					<DD>
						<!-- <Account name="unicove.gm" /> -->
					</DD>
					<DD>
						<!-- <Account name="test.gm" /> -->
					</DD>
				</DLRow>
				<DLRow title="Warning">
					<!-- <Account name="unicove.gm" /> -->
				</DLRow>
			</DL>
		</Card>
	</Stack>

	<Stack>
		<h3 class="text-title">Tables</h3>
		<p>
			For tabular data with more than two columns and with simple layout requirements (i.e. displays
			the same on mobile) you can use the Table elements.
		</p>
		<p>
			For tabular data with more advanced layout requirements (e.g. transitions from card on mobile
			to table on desktop) a custom component with a grid context should probably be used instead.
		</p>

		<Card title="Default Table">
			<Table>
				{#snippet thead()}
					<TH>Test</TH>
					<TH>Test</TH>
					<TH class="text-right">Random Number</TH>
					<TH></TH>
				{/snippet}

				{#each items as item, index (index)}
					<TR>
						<TD>Test</TD>
						<TD>Test</TD>
						<TD class="text-right">{item.description}</TD>
						<TD class="py-0">
							<Button variant="text">Action</Button>
							<Button variant="text">Action</Button>
						</TD>
					</TR>
				{/each}
			</Table>
		</Card>

		<p>Add a colgroup snippet for columnar styling.</p>

		<Card title="Column Highlighting">
			<Table>
				{#snippet thead()}
					<TH>Test</TH>
					<TH>Test</TH>
					<TH class="text-right">Random Number</TH>
					<TH></TH>
				{/snippet}

				{#snippet colgroup()}
					<Col />
					<Col />
					<Col class="bg-surface-container" />
					<Col />
				{/snippet}

				{#each items as item, index (index)}
					<TR>
						<TD>Test</TD>
						<TD>Test</TD>
						<TD class="text-right">{item.description}</TD>
						<TD class="py-0">
							<Button variant="text">Action</Button>
							<Button variant="text">Action</Button>
						</TD>
					</TR>
				{/each}
			</Table>
		</Card>

		<p>Use the `full` attribute to make the table full width.</p>

		<Card title="Full-width Table">
			<Table full>
				{#snippet thead()}
					<TH>Test</TH>
					<TH>Test</TH>
					<TH class="text-right">Random Number</TH>
					<TH></TH>
				{/snippet}

				{#snippet colgroup()}
					<Col />
					<Col />
					<Col class="bg-surface-container" />
					<Col />
				{/snippet}

				{#each items as item, index (index)}
					<TR>
						<TD>Test</TD>
						<TD>Test</TD>
						<TD class="text-right">{item.description}</TD>
						<TD class="py-0 text-right">
							<Button variant="text">Action</Button>
							<Button variant="text">Action</Button>
						</TD>
					</TR>
				{/each}
			</Table>
		</Card>

		<p>Use the `fixed` attribute to make the table columns fixed, equal width.</p>

		<Card title="Fixed-width Columns">
			<Table full fixed>
				{#snippet thead()}
					<TH>Test</TH>
					<TH>Test</TH>
					<TH class="text-right">Random Number</TH>
					<TH></TH>
				{/snippet}

				{#snippet colgroup()}
					<Col />
					<Col />
					<Col class="bg-surface-container" />
					<Col />
				{/snippet}

				{#each items as item, index (index)}
					<TR>
						<TD>Test</TD>
						<TD>Test</TD>
						<TD class="text-right">{item.description}</TD>
						<TD class="py-0 text-right">
							<Button variant="text">Action</Button>
							<Button variant="text">Action</Button>
						</TD>
					</TR>
				{/each}
			</Table>
		</Card>
	</Stack>
</Stack>
