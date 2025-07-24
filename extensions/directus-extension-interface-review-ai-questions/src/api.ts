import type { ApiClient } from '@directus/extensions-sdk';

export async function acceptQuestion(api: ApiClient, id: number, reviewUser: string) {
  return api.post('/rpc/accept_ai_question', {
    p_question_id: id,
    p_user: reviewUser,
  });
}

export async function declineQuestion(api: ApiClient, id: number, reviewUser: string, reason: string) {
  return api.post('/rpc/decline_ai_question', {
    p_question_id: id,
    p_user: reviewUser,
    p_reason: reason,
  });
} 