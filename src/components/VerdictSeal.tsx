import type { Verdict } from '../domain/types';

export function VerdictSeal({ verdict }: { verdict: Verdict }) {
  return (
    <div className="seal" data-verdict={verdict} aria-label={`判定：${verdict}`}>
      {verdict}
    </div>
  );
}
