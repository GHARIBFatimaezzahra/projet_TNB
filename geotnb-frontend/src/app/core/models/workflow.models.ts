import { EtatValidation, UserProfil } from './database.models';

// Interface pour les transitions de workflow
export interface WorkflowTransition {
  id?: string;
  from_state: EtatValidation;
  to_state: EtatValidation;
  required_roles: UserProfil[];
  validation_rules: string[];
  description?: string;
  auto_transition?: boolean;
  confirmation_required?: boolean;
}

// État d'une entité dans le workflow
export interface WorkflowState {
  entity_type: string;
  entity_id: number;
  current_state: EtatValidation;
  previous_state?: EtatValidation;
  available_transitions: WorkflowTransition[];
  blocked_reason?: string;
  last_transition_date: string;
  last_transition_user?: number;
}

// Historique des transitions
export interface WorkflowHistory {
  id: number;
  entity_type: string;
  entity_id: number;
  from_state: EtatValidation;
  to_state: EtatValidation;
  user_id: number;
  transition_date: string;
  comment?: string;
  metadata?: any;
  user?: {
    username: string;
    nom: string;
    prenom?: string;
  };
}

// Demande de transition
export interface TransitionRequest {
  entity_type: string;
  entity_id: number;
  to_state: EtatValidation;
  comment?: string;
  metadata?: any;
}

// Résultat d'une validation de transition
export interface TransitionValidation {
  can_transition: boolean;
  blocked_rules: string[];
  warnings: string[];
  required_data: string[];
  estimated_completion?: string;
}

// Règle de validation de workflow
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  rule_type: 'required_field' | 'data_validation' | 'business_logic' | 'permissions';
  condition: string;
  error_message: string;
  warning_message?: string;
  severity: 'error' | 'warning' | 'info';
  active: boolean;
}

// Configuration de workflow pour un type d'entité
export interface WorkflowConfiguration {
  entity_type: string;
  name: string;
  description: string;
  states: WorkflowStateConfig[];
  transitions: WorkflowTransition[];
  validation_rules: ValidationRule[];
  auto_transitions: AutoTransitionConfig[];
  notifications: WorkflowNotificationConfig[];
  active: boolean;
}

// Configuration d'un état
export interface WorkflowStateConfig {
  state: EtatValidation;
  name: string;
  description: string;
  color: string;
  icon?: string;
  is_initial: boolean;
  is_final: boolean;
  permissions: StatePermissions;
  auto_actions?: string[];
}

// Permissions par état
export interface StatePermissions {
  can_view: UserProfil[];
  can_edit: UserProfil[];
  can_delete: UserProfil[];
  can_transition: UserProfil[];
  special_actions?: { [action: string]: UserProfil[] };
}

// Configuration des transitions automatiques
export interface AutoTransitionConfig {
  id: string;
  name: string;
  from_state: EtatValidation;
  to_state: EtatValidation;
  trigger_type: 'time_based' | 'event_based' | 'condition_based';
  trigger_config: {
    delay?: number; // En minutes pour time_based
    event?: string; // Pour event_based
    condition?: string; // Pour condition_based
  };
  active: boolean;
}

// Configuration des notifications de workflow
export interface WorkflowNotificationConfig {
  id: string;
  name: string;
  trigger: 'on_transition' | 'on_state_enter' | 'on_state_exit' | 'on_validation_fail';
  states: EtatValidation[];
  recipients: NotificationRecipient[];
  template: string;
  channels: ('email' | 'sms' | 'system')[];
  active: boolean;
}

// Destinataire de notification
export interface NotificationRecipient {
  type: 'user' | 'role' | 'owner' | 'custom';
  identifier: string; // ID utilisateur, nom du rôle, ou expression custom
}

// Métriques de workflow
export interface WorkflowMetrics {
  entity_type: string;
  period: {
    start: string;
    end: string;
  };
  states_distribution: { [state: string]: number };
  transitions_count: { [transition: string]: number };
  average_processing_time: { [state: string]: number };
  bottlenecks: WorkflowBottleneck[];
  efficiency_score: number;
}

// Goulot d'étranglement dans le workflow
export interface WorkflowBottleneck {
  state: EtatValidation;
  average_duration: number;
  entities_count: number;
  oldest_entity: {
    id: number;
    days_in_state: number;
  };
}

// Rapport de workflow
export interface WorkflowReport {
  title: string;
  generated_at: string;
  period: {
    start: string;
    end: string;
  };
  entity_type: string;
  summary: {
    total_entities: number;
    completed_entities: number;
    pending_entities: number;
    average_completion_time: number;
  };
  metrics: WorkflowMetrics;
  recommendations: string[];
}

// Alerte de workflow
export interface WorkflowAlert {
  id: string;
  entity_type: string;
  entity_id: number;
  alert_type: 'stuck_entity' | 'validation_failed' | 'permission_denied' | 'deadline_approaching';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  current_state: EtatValidation;
  days_in_state: number;
  assigned_user?: number;
  created_at: string;
  resolved_at?: string;
  resolved_by?: number;
}

// Actions de workflow disponibles
export interface WorkflowAction {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  requires_confirmation: boolean;
  requires_comment: boolean;
  available_for_states: EtatValidation[];
  required_roles: UserProfil[];
}

// Contexte d'exécution de workflow
export interface WorkflowContext {
  entity_type: string;
  entity_id: number;
  current_user: {
    id: number;
    roles: UserProfil[];
  };
  entity_data: any;
  workflow_config: WorkflowConfiguration;
  history: WorkflowHistory[];
  current_datetime: string;
}

// Résultat d'exécution de transition
export interface TransitionResult {
  success: boolean;
  new_state: EtatValidation;
  previous_state: EtatValidation;
  transition_id: string;
  executed_at: string;
  executed_by: number;
  auto_actions_executed: string[];
  notifications_sent: string[];
  errors: string[];
  warnings: string[];
}

// Configuration de délai pour les états
export interface StateTimeout {
  state: EtatValidation;
  timeout_hours: number;
  escalation_action: 'notify' | 'auto_transition' | 'alert';
  escalation_config: {
    recipients?: string[];
    target_state?: EtatValidation;
    alert_level?: 'low' | 'medium' | 'high';
  };
}

// Batch de traitement de workflow
export interface WorkflowBatch {
  id: string;
  name: string;
  entity_type: string;
  entity_ids: number[];
  target_state: EtatValidation;
  created_by: number;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    processed: number;
    successful: number;
    failed: number;
  };
  results: WorkflowBatchResult[];
}

// Résultat d'un élément de batch
export interface WorkflowBatchResult {
  entity_id: number;
  success: boolean;
  previous_state: EtatValidation;
  new_state: EtatValidation;
  error?: string;
  processed_at: string;
}

// Template de workflow réutilisable
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  entity_types: string[];
  configuration: WorkflowConfiguration;
  is_system: boolean;
  created_by?: number;
  created_at: string;
  usage_count: number;
}