import { supabase } from './auth'
import {
  createEmptyCloudPayload,
  type BudgetProfileCloudRow,
  type BudgetTransactionCloudRow,
  type CloudBudgetPayload,
  type RecurringExpenseCloudRow,
  type SyncMetadataCloudRow,
} from './cloudSync'
import { isLocalAutomatedTestHarness } from './testHarness'

const TEST_CLOUD_KEY = 'studentski-denar:test-cloud:v1'

function readMockCloud(userId: string): CloudBudgetPayload {
  const forcedError = localStorage.getItem('studentski-denar:test-cloud-error')
  if (forcedError) throw new Error(forcedError)
  try {
    const raw = localStorage.getItem(TEST_CLOUD_KEY)
    if (!raw) return createEmptyCloudPayload(userId)
    const parsed = JSON.parse(raw) as CloudBudgetPayload
    return {
      profile: parsed.profile ?? null,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      recurring: Array.isArray(parsed.recurring) ? parsed.recurring : [],
      metadata: parsed.metadata ?? createEmptyCloudPayload(userId).metadata,
    }
  } catch {
    return createEmptyCloudPayload(userId)
  }
}

function writeMockCloud(payload: CloudBudgetPayload) {
  localStorage.setItem(TEST_CLOUD_KEY, JSON.stringify(payload))
}

export async function fetchCloudBudgetData(userId: string): Promise<CloudBudgetPayload> {
  if (!supabase) {
    if (isLocalAutomatedTestHarness()) return readMockCloud(userId)
    throw new Error('Supabase is not configured.')
  }

  const [profileResult, transactionResult, recurringResult, metadataResult] = await Promise.all([
    supabase.from('budget_profiles').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('budget_transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('recurring_expenses').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('sync_metadata').select('*').eq('user_id', userId).maybeSingle(),
  ])

  if (profileResult.error) throw profileResult.error
  if (transactionResult.error) throw transactionResult.error
  if (recurringResult.error) throw recurringResult.error
  if (metadataResult.error) throw metadataResult.error

  return {
    profile: (profileResult.data as BudgetProfileCloudRow | null) ?? null,
    transactions: (transactionResult.data as BudgetTransactionCloudRow[] | null) ?? [],
    recurring: (recurringResult.data as RecurringExpenseCloudRow[] | null) ?? [],
    metadata: (metadataResult.data as SyncMetadataCloudRow | null) ?? null,
  }
}

export function buildAtomicUploadParameters(userId: string, payload: CloudBudgetPayload) {
  if (!payload.profile || !payload.metadata) throw new Error('Cloud payload is missing required data.')
  const rows = [payload.profile, payload.metadata, ...payload.transactions, ...payload.recurring]
  if (rows.some((row) => row.user_id !== userId)) {
    throw new Error('Cloud payload contains data for another user.')
  }
  return {
    p_user_id: userId,
    p_profile: payload.profile,
    p_transactions: payload.transactions,
    p_recurring: payload.recurring,
    p_metadata: payload.metadata,
  }
}

export async function uploadCloudBudgetData(userId: string, payload: CloudBudgetPayload) {
  const parameters = buildAtomicUploadParameters(userId, payload)
  if (!supabase) {
    if (isLocalAutomatedTestHarness()) {
      writeMockCloud(payload)
      return payload
    }
    throw new Error('Supabase is not configured.')
  }

  const { error } = await supabase.rpc('replace_budget_snapshot', parameters)
  if (error) throw error
  return fetchCloudBudgetData(userId)
}
