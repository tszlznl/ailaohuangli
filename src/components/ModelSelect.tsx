import { getModelGroups } from '../domain/models';

interface ModelSelectProps {
  value: string;
  onChange: (id: string) => void;
}

export function ModelSelect({ value, onChange }: ModelSelectProps) {
  return (
    <label className="field">
      <span>查询模型</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {getModelGroups().map((group) => (
          <optgroup key={group.key} label={group.label}>
            {group.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
                {model.status === 'preview' ? '（预览）' : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
