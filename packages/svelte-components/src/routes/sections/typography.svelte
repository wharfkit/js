<script>
	import { Card, Cluster, Code, Stack } from '$lib';
</script>

<Stack id="typography" tag="section" class="max-w-prose">
	<h2 class="text-headline">Typography</h2>
	<p>
		We want valid and semantic HTML so we use utility classes to apply styles to headings. This way
		we can have markup independent of styles and each page can function independently.
	</p>
	<p>
		We use a simplified version of the Material Design type scale tokens to limit the number of
		sizes and enforce consistency.
	</p>
	<Stack>
		<Cluster class="items-center">
			<p class="text-display text-on-surface">Display</p>
			<Code inline>class='text-display'</Code>
		</Cluster>
		<p>
			As the largest text on the screen, display styles are reserved for short, important text or
			numerals. They work best on large screens.
		</p>
	</Stack>

	<Stack>
		<Cluster class="items-center">
			<p class="text-headline text-on-surface">Headline</p>
			<Code inline>class='text-headline'</Code>
		</Cluster>
		<p>
			Headlines are best-suited for short, high-emphasis text on smaller screens. These styles can
			be good for marking primary passages of text or important regions of content.
		</p>
	</Stack>

	<Stack>
		<Cluster class="items-center">
			<p class="text-title text-on-surface">Title</p>
			<Code inline>class='text-title'</Code>
		</Cluster>
		<p>
			Titles are smaller than headline styles, and should be used for medium-emphasis text that
			remains relatively short. For example, consider using title styles to divide secondary
			passages of text or secondary regions of content.
		</p>
	</Stack>

	<Stack>
		<Cluster class="items-center">
			<p class="text-body text-on-surface">Body</p>
			<Code inline>class='text-body'</Code>
		</Cluster>
		<p>Body styles are used for longer passages of text in your app.</p>
		<p>
			Paragraph - lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
			incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
			exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
			reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
			occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
			laborum.
		</p>
	</Stack>

	<Stack>
		<Cluster class="items-center">
			<p class="text-label text-on-surface">Label</p>
			<Code inline>class='text-label'</Code>
		</Cluster>
		<Cluster class="items-center">
			<p class="text-label-sm text-on-surface">Label</p>
			<Code inline>class='text-label-sm'</Code>
		</Cluster>
		<p>
			Label styles are smaller, utilitarian styles, used for things like the text inside components
			or for very small text in the content body, such as captions. Buttons, for example, use the
			label large style.
		</p>
	</Stack>

	<Stack>
		<h3 class="text-title">Examples</h3>

		<p>This card has an h1 in a smaller size as the design dictates the h2 is larger</p>

		<article>
			<Card class="space-y-2">
				<h1 class="text-label pb-px">My Content</h1>
				<h2 class="text-headline">Today's Content</h2>
				<p>
					Paragraph - lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
					incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
					exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
					dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
					Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
					anim id est laborum.
				</p>
				<h2 class="text-headline mt-4">Yesterday's Content</h2>
				<p>
					Paragraph - lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
					incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
					exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
					dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
					Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
					anim id est laborum.
				</p>
			</Card>
		</article>
	</Stack>
</Stack>
