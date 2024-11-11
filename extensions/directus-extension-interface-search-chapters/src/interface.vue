<template>
	<v-menu attached :disabled="disabled" :close-on-content-click="true">
		<template #activator="{ active, activate }">
			<v-input
				v-model="searchQuery"
				:disabled="disabled"
				:placeholder="placeholder"
				:class="{ 'has-value': value }"
				:nullable="false"
				@focus="activate"
				@update:model-value="onInput"
			>
				<template #append>
					<v-icon v-if="value !== null" clickable name="close" @click="setDropdown(null)" />
					<v-icon
						v-else
						clickable
						name="expand_more"
						class="open-indicator"
						:class="{ open: active }"
						@click="activate"
					/>
				</template>
			</v-input>
		</template>

		<div class="content" :class="width">
			<v-list class="list">
				<v-list-item :disabled="value === null" @click="$emit('input', null)">
					<v-list-item-content>Deselect</v-list-item-content>
					<v-list-item-icon>
						<v-icon name="close" />
					</v-list-item-icon>
				</v-list-item>
				<v-divider />

				<v-list-item
					v-for="(item, index) in results"
					:key="item[primaryKey.field] + index"
					:active="value === item[primaryKey.field]"
					:disabled="disabled"
					@click="setDropdown(item)"
				>
					<v-list-item-content>
						<span class="item-text">{{ outputFields(item) }}</span>
					</v-list-item-content>
				</v-list-item>
			</v-list>
		</div>
	</v-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useApi, useStores } from '@directus/extensions-sdk';
import { useProps, useEmits } from 'vue';

const props = defineProps({
	disabled: {
		type: Boolean,
		default: false,
	},
	collection: {
		type: String,
		required: true,
	},
	field: {
		type: String,
		required: true,
	},
	value: {
		type: [String, Number],
		default: null,
	},
	placeholder: {
		type: String,
		default: 'Select an item',
	},
	template: {
		type: String,
		default: 'name',
	},
	width: {
		type: String,
		required: true,
	},
	filter: {
		type: Object,
		default: null,
	},
});

const emit = defineEmits(['input']);

const api = useApi();
const { useCollectionsStore, useRelationsStore, useFieldsStore } = useStores();
const collectionsStore = useCollectionsStore();
const relationsStore = useRelationsStore();
const fieldsStore = useFieldsStore();
const { relatedCollection } = useRelation();
const displayField = props.template.replace('{{','').replace('}}','');

const primaryKey = fieldsStore.getPrimaryKeyFieldForCollection(relatedCollection.value.collection);

let awaitingSearch = false;
const results = ref([]);
const searchQuery = ref('');

async function fetchResults(){
	try {
		const response = await api.get(
			`/items/${relatedCollection.value.collection}`, {
				params: {
					limit: -1,
					filter: props.filter,
					search: (searchQuery.value && searchQuery.value != props.value?searchQuery.value:''),
				},
			}
		);

		results.value = response.data.data;

		if(props.value != null && searchQuery.value == ''){
			const fetchName = await api.get(`/items/${relatedCollection.value.collection}/${props.value}`);
			searchQuery.value = outputFields(fetchName.data.data);
		}
	} catch (err) {
		console.warn(err);
	}
}

fetchResults();

function outputFields(item){
	let displayTemplate = props.template;
	let replace = '';

	Object.keys(item).forEach(key => {
		replace = '{{'+key+'}}';
		displayTemplate = displayTemplate.replace(replace,item[key]);
	});

	return displayTemplate;
}

function onInput() {
	if (!awaitingSearch) {
		setTimeout(() => {
			fetchResults();
			awaitingSearch = false;
		}, 500); // 0.5 sec delay
	}

	awaitingSearch = true;
}

function setDropdown(item) {
	if(item == null){
		searchQuery.value = item;
		emit('input', item);
	} else {
		searchQuery.value = outputFields(item);
		emit('input', item[primaryKey.field]);
	}

	fetchResults();
}

function useRelation() {
	const relation = computed(() => {
		return relationsStore.getRelationsForField(props.collection, props.field)?.[0];
	});

	const relatedCollection = computed(() => {
		if (!relation.value?.related_collection) return null;
		return collectionsStore.getCollection(relation.value.related_collection);
	});

	return { relatedCollection };
}
</script>
