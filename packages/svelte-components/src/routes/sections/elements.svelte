<script>
	import { Card, Cluster, Stack } from '$lib';
	import Account from '$lib/components/elements/Account.svelte';
	import AssetElement from '$lib/components/elements/Asset.svelte';
	import Block from '$lib/components/elements/Block.svelte';
	import DateTime from '$lib/components/elements/DateTime.svelte';
	import Key from '$lib/components/elements/Key.svelte';
	import Number from '$lib/components/elements/Number.svelte';
	import Ram from '$lib/components/elements/Ram.svelte';
	import { Asset, PublicKey } from '@wharfkit/antelope';

	const asset = Asset.from('100 USD');
	const publicKey = PublicKey.from('PUB_K1_6gqJ7sdPgjHLFLtks9cRPs5qYHa9U3CwK4P2JasTLWKQBdT2GF');
</script>

<Stack tag="section" id="elements">
	<h2 class="text-headline">Formatting Elements</h2>
	<Card title="Account/Name">
		<Cluster>
			<Stack class="gap-2">
				<h4 class="text-label">Default</h4>
				<Account name="teamgreymass" href="#elements" />
			</Stack>
			<Stack class="gap-2">
				<h4 class="text-label">With Icon</h4>
				<Account name="teamgreymass" icon href="#elements" />
			</Stack>
		</Cluster>
	</Card>

	<Card title="Number">
		<Cluster class="gap-6">
			<Stack class="gap-2">
				<h4 class="text-label">Default</h4>
				<Number number={2_000_000.0} />
			</Stack>
			<Stack class="gap-2">
				<h4 class="text-label">Different Locale</h4>
				<Number number={2_000_000.0} locale="es-ES" />
			</Stack>
			<Stack class="gap-2">
				<h4 class="text-label">With prefix</h4>
				<Number number={2_000_000.0} prefixed />
			</Stack>
			<Stack class="gap-2">
				<h4 class="text-label">With delta</h4>
				<Number delta number={-2_000} />
				<Number delta number={2_000} />
				<Number delta number={0} />
			</Stack>
		</Cluster>
	</Card>

	<Card title="Asset">
		<Cluster class="gap-6">
			<Stack class="gap-2">
				<h4 class="text-label">Default</h4>
				<AssetElement value={asset} />
			</Stack>
			<Stack class="gap-2">
				<h4 class="text-label">Value</h4>
				<AssetElement variant="value" value={asset} />
			</Stack>
			<Stack class="gap-2">
				<h4 class="text-label">Short</h4>
				<AssetElement variant="short" value={asset} />
			</Stack>
			<Stack class="gap-2">
				<h4 class="text-label">Full</h4>
				<AssetElement variant="full" value={asset} />
			</Stack>
		</Cluster>
	</Card>

	<Card title="Block">
		<Cluster class="gap-6">
			<Stack class="gap-2">
				<h4 class="text-label">Default</h4>
				<Block number="12345" href="#elements" />
			</Stack>

			<Stack class="gap-2">
				<h4 class="text-label">With Icon</h4>
				<Block number="12345" icon href="#elements" />
			</Stack>
		</Cluster>
	</Card>

	<Card title="Key">
		<Cluster class="gap-6">
			<Stack class="gap-2">
				<h4 class="text-label">Default</h4>
				<Key key={publicKey} href="#elements" />
			</Stack>
			<Stack class="gap-2">
				<h4 class="text-label">With Icon</h4>
				<Key key={publicKey} icon href="#elements" />
			</Stack>
		</Cluster>
	</Card>

	<Card title="Datetime">
		<Cluster class="gap-6">
			<Stack class="gap-2">
				<h4 class="text-label">Default</h4>
				<DateTime datetime={new Date()} />
			</Stack>
			<Stack class="gap-2">
				<h4 class="text-label">Different Locale</h4>
				<DateTime locale="ko-KR" datetime={new Date()} />
			</Stack>
		</Cluster>
	</Card>

	<Card title="Ram">
		<Cluster class="gap-6">
			<Stack class="gap-2">
				<h4 class="text-label">Default</h4>
				<Ram bytes={2048} />
			</Stack>
		</Cluster>
	</Card>
</Stack>
