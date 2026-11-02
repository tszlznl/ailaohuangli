import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DateBar } from '../components/DateBar';
import { ModelSelect } from '../components/ModelSelect';
import { VerdictSeal } from '../components/VerdictSeal';
import { isTodayKey, normalizeDateKey } from '../domain/date';
import { DEFAULT_MODEL_ID, getModelById } from '../domain/models';
import { generateModelReading } from '../domain/modelReading';
import { usePageSeo } from '../seo';

export function QueryPage() {
  usePageSeo({
    title: 'AI 模型查询｜今日宜忌与分项吉凶',
    description:
      '查询 Claude、GPT、Gemini、DeepSeek 等 34 款模型的当日宜忌、四类分项吉凶与备用模型推荐。',
    path: '/query',
  });
  const [params, setParams] = useSearchParams();
  const dateKey = normalizeDateKey(params.get('date'));
  const rawModel = params.get('model');
  const modelId = rawModel && getModelById(rawModel) ? rawModel : DEFAULT_MODEL_ID;
  const reading = useMemo(() => generateModelReading(dateKey, modelId), [dateKey, modelId]);
  const dayWord = isTodayKey(dateKey) ? '今日' : '当日';

  const setDate = (next: string) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('date', normalizeDateKey(next));
    setParams(nextParams, { replace: true });
  };

  const setModel = (next: string) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('model', next);
    setParams(nextParams, { replace: true });
  };

  return (
    <section className="query-page">
      <DateBar dateKey={dateKey} onChange={setDate} />
      <header className="page-head">
        <Link to={`/?date=${dateKey}`}>返回首页</Link>
        <h1>模型查询</h1>
        <span>{dateKey}</span>
      </header>
      <div className="query-controls">
        <ModelSelect value={modelId} onChange={setModel} />
        <button type="button" className="primary-button" onClick={() => setModel(modelId)}>
          查询
        </button>
      </div>
      <div className="result" aria-live="polite">
        <VerdictSeal verdict={reading.overall.verdict} />
        <h2>{reading.model.name}</h2>
        <p className="model-meta">
          {reading.model.vendor}
          {reading.model.status === 'preview' ? ' · 预览' : ''}
        </p>
        <p className="verdict-text">{reading.verdictText}</p>
        <p className="judgment">{reading.judgment}</p>
        <h3>分项吉凶</h3>
        <div className="category-grid">
          {reading.categories.map((category) => (
            <div className="category-cell" key={category.key}>
              <span>{category.label}</span>
              <strong>{category.verdict}</strong>
            </div>
          ))}
        </div>
        <h3>{reading.overall.verdict === '忌' ? `${dayWord}改用` : '备用模型'}</h3>
        <div className="alternative-grid">
          {reading.alternatives.map((alternative) => (
            <article className="alternative-card" key={alternative.model.id}>
              <strong>{alternative.model.name}</strong>
              <span>{alternative.reason}</span>
              {alternative.model.status === 'preview' && <em>预览</em>}
            </article>
          ))}
        </div>
        {reading.model.status === 'preview' && (
          <p className="preview-note">预览模型状态可能变化</p>
        )}
      </div>
    </section>
  );
}
