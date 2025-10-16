<script lang="ts">
	import { Stack, Button, Cluster, Card } from '$lib';
	import AssetInput from '$lib/components/input/AssetInput.svelte';
	import BytesInput from '$lib/components/input/BytesInput.svelte';
	import DatetimeInput from '$lib/components/input/DatetimeInput.svelte';
	import NameInput, { NameValidationError } from '$lib/components/input/NameInput.svelte';
	import NumberInput from '$lib/components/input/NumberInput.svelte';
	import PublicKeyInput from '$lib/components/input/PublicKeyInput.svelte';
	import SymbolInput from '$lib/components/input/SymbolInput.svelte';
	import TextInput from '$lib/components/input/TextInput.svelte';

	import { Asset, Name, PublicKey } from '@wharfkit/antelope';

	let input: AssetInput;

	let value = $state(Asset.from('0.0000 FOO'));
	let valid = $state(false);

	let min = $state(1);
	let max = $state(100);

	let numberValue: number | undefined = $state(undefined);
	let bytesValue = $state(0);
	let publickey: PublicKey | undefined = $state(
		PublicKey.from('PUB_K1_6gqJ7sdPgjHLFLtks9cRPs5qYHa9U3CwK4P2JasTLWKQBdT2GF')
	);
	let symbolinput: Asset.SymbolType = $state(Asset.Symbol.from('0,UNKNOWN'));

	let nameinput: Name = $state(Name.from('teamgreymass'));

	let nameInput1Error = $state<NameValidationError>();
	let nameInput2Error = $state<NameValidationError>();
	let nameInput3Error = $state<NameValidationError>();
</script>

<Stack tag="section" id="inputs">
	<h2 class="text-headline">Inputs</h2>

	<h3 class="text-title">Text Input</h3>
	<Card>
		<Stack>
			<TextInput placeholder="Account Name" value="xpx1x12x3axp" />
			<TextInput label="Input with Label" />
		</Stack>
	</Card>

	<h3 class="text-title">Number Input</h3>
	<Card>
		<Stack>
			<NumberInput label="Number" />

			<NumberInput
				id="numberInput"
				label="Number input with unit"
				unit="kb"
				bind:value={numberValue}
				min={0}
				max={100}
				step={1}
				debug
			/>
		</Stack>
	</Card>

	<h3 class="text-title">Datetime Input</h3>
	<p>TODO: Styling needed</p>
	<Card>
		<Stack>
			<DatetimeInput />
		</Stack>
	</Card>

	<h3 class="text-title">Asset Input</h3>
	<Card>
		<Stack>
			<AssetInput
				label="Enter token value"
				bind:this={input}
				bind:value
				bind:valid
				bind:min
				bind:max
				debug
			/>

			<Cluster>
				<Button variant="secondary" onclick={() => input.set(Asset.from('0.0000 EOS'))}
					>EOS (0)</Button
				>
				<Button variant="secondary" onclick={() => input.set(Asset.from('1.0000 EOS'))}
					>EOS (1)</Button
				>
				<Button variant="secondary" onclick={() => input.set(Asset.from('2100000000.0000 EOS'))}>
					EOS (MAX)
				</Button>

				<Button
					variant="secondary"
					onclick={() => input.set(Asset.from('46116860184.27387903 WAX'))}
				>
					WAX (MAX)
				</Button>
				<Button variant="secondary" onclick={() => input.set(Asset.from('0 FOO'))}
					>No Decimals</Button
				>
				<Button
					variant="secondary"
					onclick={() => input.set(Asset.from('4611686018427387903 TEST'))}
				>
					Maximum No Decimals
				</Button>
				<Button
					variant="secondary"
					onclick={() => input.set(Asset.from('461168601842738.7903 TEST'))}
				>
					Maximum 4 Decimals
				</Button>
				<Button
					variant="secondary"
					onclick={() => input.set(Asset.from('46116860184.27387903 TEST'))}
				>
					Maximum 8 Decimals
				</Button>
			</Cluster>

			<div>
				<label>
					Minimum
					<input type="number" bind:value={min} />
				</label>
			</div>

			<div>
				<label>
					Maximum
					<input type="number" bind:value={max} />
				</label>
			</div>

			<Button disabled={!valid} onclick={() => alert(value)}>Do a thing with the token!</Button>

			<Stack>
				<h4>Page State</h4>
				<pre>Valid Input: {valid}<br />Asset: {value}
			</pre>
			</Stack>
		</Stack>
	</Card>

	<h3 class="text-title">Bytes Input</h3>
	<Card>
		<Stack>
			<BytesInput id="bytesInput" bind:value={bytesValue} debug />
		</Stack>
	</Card>

	<h3 class="text-title">PublicKey Input</h3>
	<Card>
		<Stack>
			<PublicKeyInput id="publickeyinput" bind:value={publickey} debug />
		</Stack>
	</Card>

	<h3 class="text-title">Name Input</h3>
	<Card>
		<Stack>
			<NameInput id="nameinput" bind:value={nameinput} />
			<NameInput
				id="invalid-name"
				label="Invalid Name"
				value="999.gm"
				bind:error={nameInput1Error}
			/>
			<!-- In real usage, you'd handle each error on each input with translated error text -->
			<!-- Here we're just doing one per input as an example -->
			{#if nameInput1Error === NameValidationError.INVALID_CHARACTERS}
				<small class="text-error">Error: Invalid Name</small>
			{/if}
			<NameInput
				id="invalid-length"
				label="Invalid Length"
				value="1234512345123"
				bind:error={nameInput2Error}
			/>
			{#if nameInput2Error === NameValidationError.INVALID_LENGTH_MAX}
				<small class="text-error">Error: Invalid Maximum length</small>
			{/if}
			<NameInput id="invalid-length" label="Invalid Length" value="" bind:error={nameInput3Error} />
			{#if nameInput3Error === NameValidationError.INVALID_LENGTH_MIN}
				<small class="text-error">Error: Invalid Minimum length</small>
			{/if}
		</Stack>
	</Card>

	<h3 class="text-title">Symbol Input</h3>
	<Card>
		<Stack>
			<SymbolInput id="symbolinput" bind:value={symbolinput} debug />
		</Stack>
	</Card>
</Stack>
