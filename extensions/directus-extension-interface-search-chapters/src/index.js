import InterfaceSelectDropdownO2M from './interface.vue';

export default {
	id: 'o2m-search-chapters',
	name: 'Search Chapter',
	type: 'interface',
	description: 'Dropdown field that allows the user to search for a chapter',
	icon: 'arrow_drop_down_circle',
	component: InterfaceSelectDropdownO2M,
	options: null,
	types: ['uuid', 'string', 'text', 'integer', 'bigInteger'],
	localTypes: ['o2m'],
	group: 'relational',
	relational: true,
	recommendedDisplays: ['related-values'],
};