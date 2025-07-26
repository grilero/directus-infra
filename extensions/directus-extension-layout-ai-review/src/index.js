import { defineLayout } from '@directus/extensions-sdk';
import LayoutComponent from './ai-review-layout.vue';

export default defineLayout({
	id: 'ai-review',
	name: 'AI Question Review',
	icon: 'psychology',
	component: LayoutComponent,
	slots: {
		options: () => null,
		sidebar: () => null,
		actions: () => null,
	},
});