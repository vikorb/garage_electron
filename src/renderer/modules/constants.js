export const STATUS_TRANSLATION_KEYS = {
  1: 'status.received',
  2: 'status.repairing',
  3: 'status.ready',
  4: 'status.delivered'
};

export function getStatusTranslationKey(statut) {
  return STATUS_TRANSLATION_KEYS[Number(statut)] || 'status.unknown';
}