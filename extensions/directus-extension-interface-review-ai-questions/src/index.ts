import Interface from './interface.vue';
import { defineInterface } from '@directus/extensions-sdk';

export default defineInterface({
  id: 'review-ai-questions',
  name: 'AI Questions Review',
  icon: 'task_alt',
  description: 'Review and approve/decline AI-generated questions',
  component: Interface,
}); 