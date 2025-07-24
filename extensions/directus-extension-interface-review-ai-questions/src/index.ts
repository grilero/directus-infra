import Interface from './interface.vue';
import { defineLayout } from '@directus/extensions-sdk';

export default defineLayout({
  id: 'review-ai-questions',
  name: 'AI Questions Review',
  icon: 'task_alt',
  description: 'Review and approve/decline AI-generated questions',
  component: Interface,
  // Specify the minimum Directus version if needed
  minimumDirectusVersion: "10.10.0",
}); 