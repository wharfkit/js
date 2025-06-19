<script lang="ts">
	import {
		Fieldset,
		Label,
		FormSection,
		Stack,
		Form,
		FormContent,
		FormHeader,
		Button,
		TextInput,
		Card,
		HR
	} from '$lib';
	import IconButton from '$lib/components/IconButton.svelte';
	import X from '@lucide/svelte/icons/x';

	const test = $state([1, 2, 3, 4]);
	const addfield = () => test.push(Math.random());
	const removefield = (i: number) => test.splice(i, 1);
</script>

<Stack tag="section" id="forms">
	<h2 class="text-headline">Forms</h2>

	<Card>
		<Form>
			<FormSection>
				<FormHeader title="Section 1" text="These are some standard fields in section one" />

				<FormContent>
					<ul class="space-y-4">
						<li class="text-on-surface">
							<TextInput label="Name" id="1" />
						</li>
						<li class="text-on-surface">
							<TextInput label="Email" id="2" />
						</li>
					</ul>
				</FormContent>
			</FormSection>

			<HR />

			<FormSection>
				<FormHeader
					title="Section 2"
					text="These are some dynamically created fields in section two"
				/>

				<FormContent>
					<ul class="@container grid grid-cols-[1fr_auto] gap-x-2">
						{#each test as item, index (index)}
							<li class="subgrid text-on-surface my-2 items-center first:mt-0 last:mb-0">
								<Fieldset>
									{#if index === 0}
										<Label for={String(index)}>
											<span>Numbers</span>
										</Label>
									{/if}
									<TextInput placeholder={String(item)} id={String(index)} />
								</Fieldset>

								{#if index !== 0}
									<IconButton
										icon={X}
										size="large"
										class="text-on-surface-variant"
										onclick={() => removefield(index)}
									/>
								{/if}
							</li>
						{/each}
					</ul>
					<Button class="float-right" variant="primary" onclick={addfield}>Add</Button>
				</FormContent>
			</FormSection>

			<HR />

			<div class="space-x-4 justify-self-end">
				<Button variant="text" onclick={() => {}}>Cancel</Button>
				<Button variant="primary" onclick={() => {}} type="submit">Submit</Button>
			</div>
		</Form>
	</Card>
</Stack>
