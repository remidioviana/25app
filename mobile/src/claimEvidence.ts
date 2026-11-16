import type {Json, RunResult} from './types';
const record = (value: Json | undefined): Record<string, Json> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function claimEvidence(result: RunResult) {
  const draft = record(result.draft);
  const evidence = new Map(result.evidence.map(item => [item.citation, item]));
  return (Array.isArray(draft.claims) ? draft.claims : []).flatMap(item => {
    const claim = record(item);
    if (typeof claim.text !== 'string' || !claim.text.trim()) return [];
    const citations = [...new Set(Array.isArray(claim.citations)
      ? claim.citations.filter((id): id is string => typeof id === 'string' && !!id.trim()) : [])];
    return [{text: claim.text,
      basis: claim.basis === 'input' ? 'Supplied input' : claim.basis === 'calculation'
        ? 'Tool calculation' : claim.basis === 'evidence' ? 'Retrieved evidence' : 'Basis not recorded',
      missingCitation: claim.basis === 'evidence' && citations.length === 0,
      references: citations.map(id => ({id, source: evidence.get(id)}))}];
  });
}
