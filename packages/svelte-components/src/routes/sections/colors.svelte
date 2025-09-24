<script lang="ts">
	import { Stack, SchemeSwitch as Scheme } from '$lib';
</script>

<Stack tag="section" id="colors" class="">
	<h2 class="text-headline">Color Roles</h2>
	<Scheme />

	<p>
		From the <a
			class="underline"
			href="https://m3.material.io/styles/color/roles#1950f337-a1cb-4ebf-9d84-e0643d99c578"
			>Google Material Design documentation
		</a>:
	</p>
	<Stack tag="ul" class="list-disc  gap-2">
		<li>
			<strong>Surface</strong> – A role used for backgrounds and large, low-emphasis areas of the screen.
		</li>
		<li>
			<strong>Primary (and Secondary, Tertiary, etc.)</strong> – Accent color roles used to emphasize
			or de-emphasize foreground elements.
		</li>
		<li>
			<strong>Container</strong> – Roles used as a fill color for foreground elements like buttons. They
			should not be used for text or icons.
		</li>
		<li>
			<strong>On</strong> – Roles starting with this term indicate a color for text or icons on top of
			its paired parent color. For example, "on primary" is used for text and icons against the "primary"
			fill color.
		</li>
		<li>
			<strong>Variant</strong> – Roles ending with this term offer a lower emphasis alternative to
			its non-variant pair. For example, "outline variant" is a <strike>less</strike>
			<strong>more</strong> emphasized version of the "outline" color. <strong>Note:</strong> this is
			inverted from MD3 in our system.
		</li>
	</Stack>

	<div>
		<div class=" flex flex-col gap-1">
			<div class="bg-primary min-h-20 p-4">
				<span class="text-on-primary font-bold">
					Primary: High-emphasis fills, texts, and icons against surface
				</span>
			</div>
			<div class="bg-on-primary min-h-20 p-4">
				<span class="text-primary font-bold"> On primary: Text and icons against primary </span>
			</div>
			<div class="bg-primary-container min-h-20 p-4">
				<span class="text-on-primary-container font-bold">
					Primary container: Standout fill color against surface, for key components like a FAB
				</span>
			</div>
			<div class="bg-on-primary-container min-h-20 p-4">
				<span class="text-primary-container font-bold">
					On primary container: Text and icons against primary container
				</span>
			</div>

			<div class="bg-background min-h-20 p-4">
				<span class="text-on-background font-bold">Background</span>
			</div>

			<div class="bg-surface p-4">
				<span class="text-on-surface col-span-full font-bold">
					Surface: Default color for element backgrounds
				</span>
				<div class=" rounded-lg p-6">
					<div class="text-on-surface font-black">
						Text On Surface: Text and icons against any surface or surface container color
					</div>
					<div class="text-on-surface-variant font-bold">
						Text On Surface Variant: Lower-emphasis color for text and icons against any surface or
						surface container color
					</div>
					<div class="border-outline text-outline mt-6 rounded-lg border p-4 font-bold">
						Outline
					</div>
					<div
						class="border-outline-variant text-outline-variant mt-2 rounded-lg border p-4 font-bold"
					>
						Outline Variant
					</div>
				</div>

				<Stack>
					<p>There are also five surface container roles named based on their level of emphasis:</p>
					<Stack tag="ul" class="list-inside list-disc gap-2">
						<li><strong>Surface container lowest</strong>: Lowest-emphasis container color</li>
						<li><strong>Surface container low</strong>: Low-emphasis container color</li>
						<li><strong>Surface container</strong>: Default container color</li>
						<li><strong>Surface container high</strong>: High-emphasis container color</li>
						<li>
							<strong>Surface container highest</strong>: Highest-emphasis container color
						</li></Stack
					>
					<p>
						<strong>Surface container</strong> is the default role, but the others are especially helpful
						for creating hierarchy and nested containers
					</p>

					<p>Here they are shown against the surface as a background:</p>
				</Stack>

				<div class="mt-2 grid grid-cols-5 *:p-2">
					<div class="bg-surface-container-lowest h-20 font-bold">Lowest</div>
					<div class="bg-surface-container-low h-20 font-bold">Low</div>
					<div class="bg-surface-container h-20 font-bold">Default</div>
					<div class="bg-surface-container-high h-20 font-bold">High</div>
					<div class="bg-surface-container-highest h-20 font-bold">Highest</div>
				</div>
			</div>

			<p class="my-4">Here they are shown as the background for a default surface:</p>
			<div class="bg-surface-container-lowest min-h-20 p-4">
				<span class="text-on-surface font-bold">Surface Container Lowest</span>
				<div class="flex *:flex-1">
					<div class="bg-surface min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface</span>
					</div>
				</div>
			</div>

			<div class="bg-surface-container-low min-h-20 p-4">
				<span class="text-on-surface font-bold">Surface Container Low</span>
				<div class="flex *:flex-1">
					<div class="bg-surface min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface</span>
					</div>
				</div>
			</div>
			<div class="bg-surface-container min-h-20 p-4">
				<span class="text-on-surface font-bold">Surface Container (Default)</span>
				<div class="flex *:flex-1">
					<div class="bg-surface min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface</span>
					</div>
				</div>
			</div>
			<div class="bg-surface-container-high min-h-20 p-4">
				<span class="text-on-surface font-bold">Surface Container High</span>
				<div class="flex *:flex-1">
					<div class="bg-surface min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface</span>
					</div>
				</div>
			</div>
			<div class="bg-surface-container-highest min-h-20 p-4">
				<span class="text-on-surface font-bold">Surface Container Highest</span>
				<div class="flex *:flex-1">
					<div class="bg-surface min-h-20 p-4">
						<span class="text-on-surface font-bold">Surface</span>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-error min-h-20 p-4">
			<span class="text-on-error font-bold"
				>Error: Attention-grabbing color against surface for fills, icons, and text, indicating
				urgency</span
			>
		</div>
		<div class="bg-on-error min-h-20 p-4">
			<span class="text-error font-bold">On error: Text and icons against error</span>
		</div>
		<div class="bg-error-container min-h-20 p-4">
			<span class="text-on-error-container font-bold">
				Error container: Attention-grabbing fill color against surface
			</span>
		</div>
		<div class="bg-on-error-container min-h-20 p-4">
			<span class="text-error-container font-bold">
				On error container: Text and icons against error container
			</span>
		</div>

		<div class="bg-success min-h-20 p-4">
			<span class="text-on-success font-bold">success</span>
		</div>
		<div class="bg-on-success min-h-20 p-4">
			<span class="text-success font-bold">On success</span>
		</div>
		<div class="bg-success-container min-h-20 p-4">
			<span class="text-on-success-container font-bold">success Container</span>
		</div>
		<div class="bg-on-success-container min-h-20 p-4">
			<span class="text-success-container font-bold">On success Container</span>
		</div>
	</div>
</Stack>
