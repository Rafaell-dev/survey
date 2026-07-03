import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { QuestionVisualization } from "@/domain/analytics.types";

interface SettingsProps {
  visualization: QuestionVisualization;
  onChange: (val: QuestionVisualization) => void;
}

export function ChartDisplayOptions({ visualization, onChange }: SettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="show-legend" className="text-sm font-normal cursor-pointer">Mostrar legenda</Label>
        <Switch id="show-legend" checked={visualization.showLegend} onCheckedChange={(v) => onChange({...visualization, showLegend: v})} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="show-values" className="text-sm font-normal cursor-pointer">Mostrar valores</Label>
        <Switch id="show-values" checked={visualization.showValues} onCheckedChange={(v) => onChange({...visualization, showValues: v})} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="show-percentage" className="text-sm font-normal cursor-pointer">Mostrar porcentagem</Label>
        <Switch id="show-percentage" checked={visualization.showPercentage} onCheckedChange={(v) => onChange({...visualization, showPercentage: v})} />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="show-table" className="text-sm font-normal cursor-pointer">Mostrar tabela</Label>
        <Switch id="show-table" checked={visualization.showTable} onCheckedChange={(v) => onChange({...visualization, showTable: v})} />
      </div>
    </div>
  );
}

export function SortingOptions({ visualization, onChange }: SettingsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <Label htmlFor="sort-enabled" className="text-sm font-semibold cursor-pointer">Ordenar respostas</Label>
        <Switch id="sort-enabled" checked={visualization.sortEnabled} onCheckedChange={(v) => onChange({...visualization, sortEnabled: v})} />
      </div>
      
      {visualization.sortEnabled && (
        <div className="flex flex-col gap-2 pl-2 border-l-2 border-muted ml-2">
          <Label className="flex items-center gap-2 font-normal cursor-pointer text-sm">
            <input type="radio" checked={visualization.sortDirection === 'ASC'} onChange={() => onChange({...visualization, sortDirection: 'ASC'})} className="accent-primary" />
            Ordem crescente
          </Label>
          <Label className="flex items-center gap-2 font-normal cursor-pointer text-sm">
            <input type="radio" checked={visualization.sortDirection === 'DESC'} onChange={() => onChange({...visualization, sortDirection: 'DESC'})} className="accent-primary" />
            Ordem decrescente
          </Label>
        </div>
      )}
    </div>
  );
}

export function DisplayModeOptions({ visualization, onChange }: SettingsProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold mb-2 block">Escala</Label>
      <div className="flex flex-col gap-2 pl-2">
        <Label className="flex items-center gap-2 font-normal cursor-pointer text-sm">
          <input type="radio" checked={visualization.displayMode === 'COUNT'} onChange={() => onChange({...visualization, displayMode: 'COUNT'})} className="accent-primary" />
          Quantidade
        </Label>
        <Label className="flex items-center gap-2 font-normal cursor-pointer text-sm">
          <input type="radio" checked={visualization.displayMode === 'PERCENTAGE'} onChange={() => onChange({...visualization, displayMode: 'PERCENTAGE'})} className="accent-primary" />
          Percentual
        </Label>
      </div>
    </div>
  );
}

export function LegendOptions({ visualization, onChange }: SettingsProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold mb-2 block">Posição da Legenda</Label>
      <div className="flex flex-col gap-2 pl-2">
        <Label className="flex items-center gap-2 font-normal cursor-pointer text-sm">
          <input type="radio" checked={visualization.legendPosition === 'RIGHT'} onChange={() => onChange({...visualization, legendPosition: 'RIGHT'})} className="accent-primary" />
          Direita
        </Label>
        <Label className="flex items-center gap-2 font-normal cursor-pointer text-sm">
          <input type="radio" checked={visualization.legendPosition === 'BOTTOM'} onChange={() => onChange({...visualization, legendPosition: 'BOTTOM'})} className="accent-primary" />
          Inferior
        </Label>
        <Label className="flex items-center gap-2 font-normal cursor-pointer text-sm">
          <input type="radio" checked={visualization.legendPosition === 'NONE'} onChange={() => onChange({...visualization, legendPosition: 'NONE'})} className="accent-primary" />
          Ocultar
        </Label>
      </div>
    </div>
  );
}
