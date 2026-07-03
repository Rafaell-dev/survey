import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ChartDisplayOptionsProps {
  showLegend: boolean;
  setShowLegend: (val: boolean) => void;
  showTable: boolean;
  setShowTable: (val: boolean) => void;
  showValues: boolean;
  setShowValues: (val: boolean) => void;
  showPercentage: boolean;
  setShowPercentage: (val: boolean) => void;
}

export function ChartDisplayOptions({
  showLegend,
  setShowLegend,
  showTable,
  setShowTable,
  showValues,
  setShowValues,
  showPercentage,
  setShowPercentage
}: ChartDisplayOptionsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="show-table" className="text-sm font-normal cursor-pointer">
          Mostrar tabela
        </Label>
        <Switch 
          id="show-table" 
          checked={showTable} 
          onCheckedChange={setShowTable} 
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="show-legend" className="text-sm font-normal cursor-pointer">
          Mostrar legenda
        </Label>
        <Switch 
          id="show-legend" 
          checked={showLegend} 
          onCheckedChange={setShowLegend} 
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="show-values" className="text-sm font-normal cursor-pointer">
          Mostrar valores
        </Label>
        <Switch 
          id="show-values" 
          checked={showValues} 
          onCheckedChange={setShowValues} 
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="show-percentage" className="text-sm font-normal cursor-pointer">
          Mostrar porcentagem
        </Label>
        <Switch 
          id="show-percentage" 
          checked={showPercentage} 
          onCheckedChange={setShowPercentage} 
        />
      </div>
    </div>
  );
}
