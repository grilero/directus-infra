<template>
	<div class="ai-review-layout">
		<div class="layout-header">
			<h2 class="title">AI Question Review</h2>
			<div class="stats">
				<div class="stat-item">
					<span class="stat-number">{{ filteredPendingQuestions.length }}</span>
					<span class="stat-label">Pending Review</span>
				</div>
				<div class="stat-item">
					<span class="stat-number">{{ filteredReviewedQuestions.length }}</span>
					<span class="stat-label">Reviewed</span>
				</div>
				<v-button @click="loadQuestions" icon="refresh" small>
					Refresh
				</v-button>
			</div>
		</div>

		<div class="filters-section">
			<div class="filter-group">
				<label>Filter by Status:</label>
				<v-select 
					v-model="statusFilter"
					:items="[
						{ text: 'All Statuses', value: 'all' },
						{ text: 'Pending Review', value: 'pending_review' },
						{ text: 'Approved', value: 'approved' },
						{ text: 'Declined', value: 'declined' }
					]"
					item-text="text"
					item-value="value"
				/>
			</div>
			<div class="filter-group">
				<label>Filter by Difficulty:</label>
				<v-select 
					v-model="difficultyFilter"
					:items="[
						{ text: 'All Difficulties', value: 'all' },
						{ text: 'Easy', value: 'easy' },
						{ text: 'Medium', value: 'medium' },
						{ text: 'Hard', value: 'hard' }
					]"
					item-text="text"
					item-value="value"
				/>
			</div>
			<div class="filter-group">
				<label>Search Questions:</label>
				<v-input 
					v-model="searchFilter"
					placeholder="Search question text..."
					type="text"
				/>
			</div>
		</div>

		<div class="review-sections">
			<!-- Pending Review Section -->
			<section class="review-section">
				<h3 class="section-title clickable" @click="pendingSectionCollapsed = !pendingSectionCollapsed">
					<v-icon name="pending" />
					Questions Pending Review ({{ filteredPendingQuestions.length }})
					<v-icon 
						:name="pendingSectionCollapsed ? 'expand_more' : 'expand_less'" 
						class="collapse-icon"
					/>
				</h3>
				
				<div v-if="!pendingSectionCollapsed">
					<div v-if="filteredPendingQuestions.length === 0" class="empty-state">
						<v-icon name="check_circle" size="48" />
						<p>No questions pending review</p>
					</div>
					
					<div v-else class="questions-list">
					<div 
						v-for="question in filteredPendingQuestions" 
						:key="question.id"
						class="question-card"
						:class="{ 'expanded': expandedQuestions.includes(question.id) }"
					>
						<div class="question-header" @click="toggleExpanded(question.id)">
							<div class="question-info">
								<span class="question-prompt">{{ question.question_prompt }}</span>
								<div class="question-meta">
									<span class="difficulty">{{ question.difficulty_level }}</span>
									<span class="type">{{ question.question_type }}</span>
									<span class="model">{{ question.ai_model }}</span>
									<span v-if="question.source_book_id" class="book">Book: {{ getBookName(question.source_book_id) }}</span>
									<span v-if="question.source_chapter_id" class="chapter">Chapter: {{ getChapterName(question.source_chapter_id) }}</span>
									<span v-if="question.source_page" class="page">Page: {{ question.source_page }}</span>
								</div>
							</div>
							<v-icon 
								:name="expandedQuestions.includes(question.id) ? 'expand_less' : 'expand_more'"
								class="expand-icon"
							/>
						</div>
						
						<div v-if="expandedQuestions.includes(question.id)" class="question-details">
							<div class="question-content">
								<div v-if="question.explanation" class="explanation">
									<h4>Explanation:</h4>
									<p>{{ question.explanation }}</p>
								</div>
								
								<div class="answer-options">
									<h4>Answer Options:</h4>
									<div 
										v-for="option in getAnswerOptions(question.id)" 
										:key="option.id"
										class="answer-option"
										:class="{ 'correct': option.is_correct }"
									>
										<v-icon 
											:name="option.is_correct ? 'check_circle' : 'radio_button_unchecked'"
											:class="option.is_correct ? 'correct-icon' : 'option-icon'"
										/>
										<span class="option-text">{{ option.option_text }}</span>
									</div>
								</div>
								
								<div v-if="question.source_text" class="source-info">
									<h4>Source:</h4>
									<p><strong>Page:</strong> {{ question.source_page }}</p>
									<p class="source-text">{{ question.source_text }}</p>
								</div>
							</div>
							
							<div class="action-buttons">
								<v-button 
									@click="acceptQuestion(question.id)"
									:loading="processingQuestions.includes(question.id)"
									variant="primary"
								>
									Accept
								</v-button>
								<v-button 
									@click="openDeclineModal(question)"
									:loading="processingQuestions.includes(question.id)"
									variant="danger"
								>
									Decline
								</v-button>
							</div>
						</div>
					</div>
				</div>
				</div>
			</section>

			<!-- Reviewed Section -->
			<section class="review-section">
				<h3 class="section-title clickable" @click="reviewedSectionCollapsed = !reviewedSectionCollapsed">
					<v-icon name="history" />
					Reviewed Questions ({{ filteredReviewedQuestions.length }})
					<v-icon 
						:name="reviewedSectionCollapsed ? 'expand_more' : 'expand_less'" 
						class="collapse-icon"
					/>
				</h3>
				
				<div v-if="!reviewedSectionCollapsed">
					<div v-if="filteredReviewedQuestions.length === 0" class="empty-state">
						<v-icon name="history" size="48" />
						<p>No questions have been reviewed yet</p>
					</div>
					
					<div v-else class="questions-list">
					<div 
						v-for="question in filteredReviewedQuestions" 
						:key="question.id"
						class="question-card reviewed"
						:class="{ 
							'expanded': expandedQuestions.includes(question.id),
							'approved': question.status === 'approved',
							'declined': question.status === 'declined'
						}"
					>
						<div class="question-header" @click="toggleExpanded(question.id)">
							<div class="question-info">
								<span class="question-prompt">{{ question.question_prompt }}</span>
								<div class="question-meta">
									<span class="status" :class="question.status">
										<v-icon :name="question.status === 'approved' ? 'check_circle' : 'cancel'" />
										{{ question.status }}
									</span>
									<span class="reviewed-date">{{ formatDate(question.reviewed_at) }}</span>
									<span v-if="question.reviewed_by" class="reviewer">
										Reviewed by: {{ getReviewerName(question.reviewed_by) }}
									</span>
									<span v-if="question.source_book_id" class="book">Book: {{ getBookName(question.source_book_id) }}</span>
									<span v-if="question.source_chapter_id" class="chapter">Chapter: {{ getChapterName(question.source_chapter_id) }}</span>
									<span v-if="question.source_page" class="page">Page: {{ question.source_page }}</span>
								</div>
							</div>
							<v-icon 
								:name="expandedQuestions.includes(question.id) ? 'expand_less' : 'expand_more'"
								class="expand-icon"
							/>
						</div>
						
						<div v-if="expandedQuestions.includes(question.id)" class="question-details">
							<div class="question-content">
								<div v-if="question.explanation" class="explanation">
									<h4>Explanation:</h4>
									<p>{{ question.explanation }}</p>
								</div>
								
								<div class="answer-options">
									<h4>Answer Options:</h4>
									<div 
										v-for="option in getAnswerOptions(question.id)" 
										:key="option.id"
										class="answer-option"
										:class="{ 'correct': option.is_correct }"
									>
										<v-icon 
											:name="option.is_correct ? 'check_circle' : 'radio_button_unchecked'"
											:class="option.is_correct ? 'correct-icon' : 'option-icon'"
										/>
										<span class="option-text">{{ option.option_text }}</span>
									</div>
								</div>
								<div v-if="question.reviewed_by" class="reviewer">
									<h4>Reviewed by:</h4>
									<p>{{ getReviewerName(question.reviewed_by) }}</p>
								</div>
								
								<div v-if="question.review_notes" class="review-notes">
									<h4>Review Notes:</h4>
									<p>{{ question.review_notes }}</p>
								</div>
							</div>
							
							<div class="action-buttons">
								<v-button 
									v-if="question.status === 'declined'"
									@click="toggleQuestionStatus(question.id, 'approved')"
									:loading="processingQuestions.includes(question.id)"
									variant="primary"
								>
									Mark as Approved
								</v-button>
								<v-button 
									v-if="question.status === 'approved'"
									@click="toggleQuestionStatus(question.id, 'declined')"
									:loading="processingQuestions.includes(question.id)"
									variant="danger"
								>
									Mark as Declined
								</v-button>
								<v-button 
									@click="toggleQuestionStatus(question.id, 'pending_review')"
									:loading="processingQuestions.includes(question.id)"
									variant="secondary"
								>
									Mark as Pending
								</v-button>
							</div>
						</div>
					</div>
				</div>
				</div>
			</section>
		</div>

		<!-- Decline Modal -->
		<v-dialog v-model="declineModalOpen" @esc="closeDeclineModal">
			<v-card class="decline-modal">
				<v-card-title>
					<span>Decline Question</span>
				</v-card-title>
				<v-card-text>
					<div v-if="selectedQuestion" class="question-preview">
						<strong>Question:</strong> {{ selectedQuestion.question_prompt }}
					</div>
					<v-textarea
						v-model="declineReason"
						label="Reason for declining (required)"
						placeholder="Please provide a reason for declining this question..."
						required
						rows="4"
					/>
				</v-card-text>
				<v-card-actions>
					<v-button @click="closeDeclineModal" secondary>Cancel</v-button>
					<v-button 
						@click="confirmDecline"
						:disabled="!declineReason.trim()"
						:loading="processingDecline"
						variant="danger"
					>
						Decline Question
					</v-button>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useApi, useStores } from '@directus/extensions-sdk';

export default {
	name: 'AIReviewLayout',
	props: {
		collection: {
			type: String,
			required: true,
		},
		selection: {
			type: Array,
			default: () => [],
		},
		layoutOptions: {
			type: Object,
			default: () => ({}),
		},
		layoutQuery: {
			type: Object,
			default: () => ({}),
		},
		filter: {
			type: Object,
			default: () => ({}),
		},
		search: {
			type: String,
			default: '',
		},
		readonly: {
			type: Boolean,
			default: false,
		},
	},
	setup(props, { emit }) {
		const api = useApi();
		const { useNotificationsStore, useUserStore } = useStores();
		const notificationsStore = useNotificationsStore();
		const userStore = useUserStore();
		
		const notify = (notification) => {
			notificationsStore.add({
				title: notification.title,
				text: notification.text,
				type: notification.type || 'info',
			});
		};
		
		// State
		const questions = ref([]);
		const answerOptions = ref([]);
		const books = ref([]);
		const chapters = ref([]);
		// Cache for reviewer user objects { [id]: user }
		const reviewerCache = ref({});
		const expandedQuestions = ref([]);
		const processingQuestions = ref([]);
		const declineModalOpen = ref(false);
		const selectedQuestion = ref(null);
		const declineReason = ref('');
		const processingDecline = ref(false);
		const loading = ref(true);
		
		// Filter state
		const statusFilter = ref('all');
		const difficultyFilter = ref('all');
		const searchFilter = ref('');
		
		// Section collapse state
		const pendingSectionCollapsed = ref(false);
		const reviewedSectionCollapsed = ref(false);

		// Helper function for filtering
		const filterQuestions = (questionList) => {
			return questionList.filter(q => {
				// Status filter
				if (statusFilter.value !== 'all' && q.status !== statusFilter.value) {
					return false;
				}
				
				// Difficulty filter
				if (difficultyFilter.value !== 'all' && q.difficulty_level !== difficultyFilter.value) {
					return false;
				}
				
				// Search filter
				if (searchFilter.value && !q.question_prompt.toLowerCase().includes(searchFilter.value.toLowerCase())) {
					return false;
				}
				
				return true;
			});
		};

		// Computed
		const pendingQuestions = computed(() => 
			questions.value.filter(q => q.status === 'pending_review')
		);
		
		const reviewedQuestions = computed(() => 
			questions.value.filter(q => ['approved', 'declined'].includes(q.status))
		);
		
		const filteredPendingQuestions = computed(() => 
			filterQuestions(pendingQuestions.value)
		);
		
		const filteredReviewedQuestions = computed(() => 
			filterQuestions(reviewedQuestions.value)
		);

		// Methods
		const loadQuestions = async () => {
			try {
				loading.value = true;
				
				// Load questions from ai_question_staging with user information
				const questionsResponse = await api.get('/items/ai_question_staging', {
					params: {
						limit: -1,
						sort: ['-created_at'],
						fields: ['*', 'user_updated.id', 'user_updated.first_name', 'user_updated.last_name', 'user_updated.email', 'reviewed_by.id', 'reviewed_by.first_name', 'reviewed_by.last_name', 'reviewed_by.email']
					}
				});
				questions.value = questionsResponse.data.data;
				
				// Debug: Log a reviewed question to see the structure
				const reviewedQuestion = questionsResponse.data.data.find(q => q.status === 'approved' || q.status === 'declined');
				if (reviewedQuestion) {
					console.log('Sample reviewed question:', reviewedQuestion);
					console.log('reviewed_by field:', reviewedQuestion.reviewed_by);
				}
				
				// Load answer options from ai_answer_options_staging
				const optionsResponse = await api.get('/items/ai_answer_options_staging', {
					params: {
						limit: -1,
						sort: ['ai_question_staging_id', 'option_order'],
					}
				});
				answerOptions.value = optionsResponse.data.data;
				
				// Load books for metadata display
				const booksResponse = await api.get('/items/books', {
					params: {
						limit: -1,
						fields: ['id', 'book_name']
					}
				});
				books.value = booksResponse.data.data;
				
				// Load chapters for metadata display
				const chaptersResponse = await api.get('/items/chapters', {
					params: {
						limit: -1,
						fields: ['id', 'chapter_name']
					}
				});
				chapters.value = chaptersResponse.data.data;

				// ---------------------------------------------
				// Fetch reviewer user records so we can display
				// full name/email instead of raw UUIDs
				// ---------------------------------------------
				const reviewerIds = [...new Set(questions.value
					.map(q => q.reviewed_by)
					.filter(id => typeof id === 'string')
				)];
				if (reviewerIds.length) {
					const usersResp = await api.get('/users', {
						params: {
							limit: reviewerIds.length,
							filter: { id: { _in: reviewerIds } },
							fields: ['id', 'first_name', 'last_name', 'email']
						}
					});
					reviewerCache.value = Object.fromEntries(
						usersResp.data.data.map(u => [u.id, u])
					);
				}
				
			} catch (error) {
				notify({
					title: 'Error',
					text: 'Failed to load questions',
					type: 'error',
				});
				console.error('Error loading questions:', error);
			} finally {
				loading.value = false;
			}
		};

		const getAnswerOptions = (questionId) => {
			return answerOptions.value.filter(option => option.ai_question_staging_id === questionId);
		};

		const toggleExpanded = (questionId) => {
			const index = expandedQuestions.value.indexOf(questionId);
			if (index > -1) {
				expandedQuestions.value.splice(index, 1);
			} else {
				expandedQuestions.value.push(questionId);
			}
		};

		const acceptQuestion = async (questionId) => {
			try {
				processingQuestions.value.push(questionId);
				
				// Get the staging question and its options
				const stagingQuestion = questions.value.find(q => q.id === questionId);
				const stagingOptions = getAnswerOptions(questionId);
				
				if (!stagingQuestion) {
					throw new Error('Question not found');
				}
				
				// Create production question
				const questionData = {
					question_prompt: stagingQuestion.question_prompt,
					question_type: stagingQuestion.question_type,
					explanation: stagingQuestion.explanation,
					book_id: stagingQuestion.source_book_id,
					chapter_id: stagingQuestion.source_chapter_id,
					subchapter_id: stagingQuestion.source_subchapter_id,
					difficulty_level: stagingQuestion.difficulty_level,
					status: 'published'
				};
				
				const newQuestion = await api.post('/items/questions', questionData);
				const newQuestionId = newQuestion.data.data.id;
				
				// Create production answer options
				for (const option of stagingOptions) {
					await api.post('/items/answer_options', {
						question_id: newQuestionId,
						text: option.option_text,
						is_correct: option.is_correct,
						sort_order: option.option_order
					});
				}
				
				// Update staging question status but keep it in staging
				await api.patch(`/items/ai_question_staging/${questionId}`, {
					status: 'approved',
					reviewed_at: new Date().toISOString(),
					reviewed_by: userStore.currentUser?.id
				});
				
				// Update the question in local state immediately
				const questionIndex = questions.value.findIndex(q => q.id === questionId);
				if (questionIndex !== -1) {
					questions.value[questionIndex] = {
						...questions.value[questionIndex],
						status: 'approved',
						reviewed_at: new Date().toISOString()
					};
				}
				
				notify({
					title: 'Success',
					text: 'Question accepted and moved to production',
					type: 'success',
				});
				
			} catch (error) {
				notify({
					title: 'Error',
					text: error.message || 'Failed to accept question',
					type: 'error',
				});
				console.error('Error accepting question:', error);
			} finally {
				processingQuestions.value = processingQuestions.value.filter(id => id !== questionId);
			}
		};

		const openDeclineModal = (question) => {
			selectedQuestion.value = question;
			declineReason.value = '';
			declineModalOpen.value = true;
		};

		const closeDeclineModal = () => {
			declineModalOpen.value = false;
			selectedQuestion.value = null;
			declineReason.value = '';
			processingDecline.value = false;
		};

		const confirmDecline = async () => {
			if (!declineReason.value.trim()) return;
			
			try {
				processingDecline.value = true;
				
				// Update staging question with decline status and reason
				await api.patch(`/items/ai_question_staging/${selectedQuestion.value.id}`, {
					status: 'declined',
					review_notes: declineReason.value.trim(),
					reviewed_at: new Date().toISOString(),
					reviewed_by: userStore.currentUser?.id
				});
				
				// Update the question in local state immediately
				const questionIndex = questions.value.findIndex(q => q.id === selectedQuestion.value.id);
				if (questionIndex !== -1) {
					questions.value[questionIndex] = {
						...questions.value[questionIndex],
						status: 'declined',
						review_notes: declineReason.value.trim(),
						reviewed_at: new Date().toISOString()
					};
				}
				
				notify({
					title: 'Success',
					text: 'Question declined and archived',
					type: 'success',
				});
				
				closeDeclineModal();
				
			} catch (error) {
				notify({
					title: 'Error',
					text: error.message || 'Failed to decline question',
					type: 'error',
				});
				console.error('Error declining question:', error);
			} finally {
				processingDecline.value = false;
			}
		};

		const toggleQuestionStatus = async (questionId, newStatus) => {
			try {
				processingQuestions.value.push(questionId);
				
				const updateData = {
					status: newStatus,
					reviewed_at: new Date().toISOString(),
					reviewed_by: userStore.currentUser?.id
				};
				
				// Clear review notes if moving back to pending
				if (newStatus === 'pending_review') {
					updateData.review_notes = null;
					updateData.reviewed_at = null;
					updateData.reviewed_by = null;
				}
				
				await api.patch(`/items/ai_question_staging/${questionId}`, updateData);
				
				// Update the question in local state immediately
				const questionIndex = questions.value.findIndex(q => q.id === questionId);
				if (questionIndex !== -1) {
					questions.value[questionIndex] = {
						...questions.value[questionIndex],
						...updateData
					};
				}
				
				notify({
					title: 'Success',
					text: `Question marked as ${newStatus.replace('_', ' ')}`,
					type: 'success',
				});
				
			} catch (error) {
				notify({
					title: 'Error',
					text: error.message || 'Failed to update question status',
					type: 'error',
				});
				console.error('Error updating question status:', error);
			} finally {
				processingQuestions.value = processingQuestions.value.filter(id => id !== questionId);
			}
		};

		const formatDate = (dateString) => {
			if (!dateString) return '';
			const date = new Date(dateString);
			return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
		};

		const getReviewerName = (userObj) => {
			if (!userObj) return 'Unknown';
			// If we only have the UUID, try to resolve via cache
			if (typeof userObj === 'string') {
				const cached = reviewerCache.value[userObj];
				if (cached) {
					return (cached.first_name || cached.last_name)
						? `${cached.first_name || ''} ${cached.last_name || ''}`.trim() || cached.email || userObj
						: cached.email || userObj;
				}
				return userObj; // fallback to raw id until cache filled
			}
			// Already an expanded object
			if (userObj.first_name || userObj.last_name) {
				return `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim();
			}
			if (userObj.email) return userObj.email;
			return 'Unknown';
		};

		const getBookName = (bookId) => {
			const book = books.value.find(b => b.id === bookId);
			return book ? book.book_name : `Book ${bookId}`;
		};

		const getChapterName = (chapterId) => {
			const chapter = chapters.value.find(c => c.id === chapterId);
			return chapter ? chapter.chapter_name : `Chapter ${chapterId}`;
		};

		// Lifecycle
		onMounted(() => {
			loadQuestions();
		});

		return {
			questions,
			answerOptions,
			books,
			chapters,
			pendingQuestions,
			reviewedQuestions,
			filteredPendingQuestions,
			filteredReviewedQuestions,
			expandedQuestions,
			processingQuestions,
			declineModalOpen,
			selectedQuestion,
			declineReason,
			processingDecline,
			loading,
			statusFilter,
			difficultyFilter,
			searchFilter,
			pendingSectionCollapsed,
			reviewedSectionCollapsed,
			getAnswerOptions,
			toggleExpanded,
			acceptQuestion,
			toggleQuestionStatus,
			openDeclineModal,
			closeDeclineModal,
			confirmDecline,
			formatDate,
			getReviewerName,
			getBookName,
			getChapterName,
		};
	},
};
</script>

<style scoped>
.ai-review-layout {
	padding: 24px;
	max-width: 100%;
}

.layout-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32px;
}

.title {
	font-size: 24px;
	font-weight: 600;
	margin: 0;
}

.stats {
	display: flex;
	gap: 24px;
}

.filters-section {
	background: var(--background-subdued);
	border-radius: 8px;
	padding: 16px;
	margin-bottom: 24px;
	display: flex;
	gap: 20px;
	flex-wrap: wrap;
}

.filter-group {
	display: flex;
	flex-direction: column;
	min-width: 200px;
}

.filter-group label {
	font-size: 12px;
	font-weight: 600;
	color: var(--foreground-subdued);
	margin-bottom: 4px;
	text-transform: uppercase;
}

.stat-item {
	text-align: center;
}

.stat-number {
	display: block;
	font-size: 24px;
	font-weight: 700;
	color: var(--primary);
}

.stat-label {
	display: block;
	font-size: 12px;
	color: var(--foreground-subdued);
	text-transform: uppercase;
}

.review-sections {
	display: flex;
	flex-direction: column;
	gap: 32px;
}

.review-section {
	background: var(--background-page);
	border-radius: 8px;
	padding: 24px;
	border: 2px solid var(--border-subdued);
}

.section-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 18px;
	font-weight: 600;
	margin: 0 0 20px 0;
	color: var(--foreground);
}

.section-title.clickable {
	cursor: pointer;
	justify-content: space-between;
	user-select: none;
}

.section-title.clickable:hover {
	color: var(--primary);
}

.collapse-icon {
	color: var(--foreground-subdued);
	transition: transform 0.2s ease;
}

.empty-state {
	text-align: center;
	padding: 48px;
	color: var(--foreground-subdued);
}

.empty-state .v-icon {
	color: var(--foreground-subdued);
	margin-bottom: 16px;
}

.questions-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.question-card {
	border: 1px solid var(--border-normal);
	border-radius: 8px;
	background: var(--background-normal);
	overflow: hidden;
	transition: all 0.2s ease;
}

.question-card:hover {
	border-color: var(--primary);
}

.question-card.expanded {
	border-color: var(--primary);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.question-card.reviewed.approved {
	border-left: 4px solid var(--success);
}

.question-card.reviewed.declined {
	border-left: 4px solid var(--danger);
}

.question-header {
	padding: 16px;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.question-info {
	flex: 1;
}

.question-prompt {
	display: block;
	font-weight: 500;
	margin-bottom: 8px;
	line-height: 1.4;
}

.question-meta {
	display: flex;
	gap: 12px;
	font-size: 12px;
	color: var(--foreground-subdued);
}

.question-meta span {
	padding: 2px 8px;
	background: var(--background-subdued);
	border-radius: 4px;
	text-transform: capitalize;
}

.question-meta .status {
	display: flex;
	align-items: center;
	gap: 4px;
}

.question-meta .status.approved {
	background: var(--success-25);
	color: var(--success);
}

.question-meta .status.declined {
	background: var(--danger-25);
	color: var(--danger);
}

.expand-icon {
	color: var(--foreground-subdued);
	transition: transform 0.2s ease;
}

.question-details {
	border-top: 1px solid var(--border-subdued);
	padding: 20px;
}

.question-content {
	margin-bottom: 20px;
}

.question-content h4 {
	font-size: 14px;
	font-weight: 600;
	margin: 0 0 8px 0;
	color: var(--foreground);
}

.explanation p,
.source-text,
.review-notes p {
	margin: 0;
	line-height: 1.5;
	color: var(--foreground-normal);
}

.answer-options {
	margin: 16px 0;
}

.answer-option {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px;
	margin: 4px 0;
	border-radius: 4px;
	background: var(--background-page);
}

.answer-option.correct {
	background: var(--success-25);
	border: 1px solid var(--success-50);
}

.correct-icon {
	color: var(--success);
}

.option-icon {
	color: var(--foreground-subdued);
}

.option-text {
	flex: 1;
}

.source-info {
	margin-top: 16px;
	padding: 12px;
	background: var(--background-subdued);
	border-radius: 4px;
}

.review-notes {
	margin-top: 16px;
	padding: 12px;
	background: var(--warning-25);
	border-radius: 4px;
	border: 1px solid var(--warning-50);
}

.action-buttons {
	display: flex;
	gap: 12px;
	justify-content: flex-end;
	flex-wrap: wrap;
}

.action-buttons .v-button {
	min-width: 200px;
	width: auto;
	padding: 12px 24px;
	font-size: 14px;
	white-space: nowrap;
}

.decline-modal {
	max-width: 500px;
}

.question-preview {
	padding: 12px;
	background: var(--background-subdued);
	border-radius: 4px;
	margin-bottom: 16px;
	font-size: 14px;
}

@media (max-width: 768px) {
	.ai-review-layout {
		padding: 16px;
	}
	
	.layout-header {
		flex-direction: column;
		gap: 16px;
		align-items: flex-start;
	}
	
	.action-buttons {
		flex-direction: column;
	}
	
	.action-buttons .v-button {
		width: 100%;
	}
}
</style>