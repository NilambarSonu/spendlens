import React, { useEffect } from 'react';
import type { ToolEntry, ToolId } from '@/types';
import { TOOL_DEFINITIONS } from '@/lib/pricing-data';
import GlassSelect from './GlassSelect';

interface ToolRowProps {
  index: number;
  entry: ToolEntry;
  onUpdate: (index: number, updated: ToolEntry) => void;
  onRemove: (index: number) => void;
  selectedToolIds: ToolId[];
}

export default function ToolRow({
  index,
  entry,
  onUpdate,
  onRemove,
  selectedToolIds,
}: ToolRowProps) {
  const currentToolDef = TOOL_DEFINITIONS[entry.toolId];

  // When tool changes, reset plan to the first available plan
  const handleToolChange = (val: string) => {
    const newToolId = val as ToolId;
    const def = TOOL_DEFINITIONS[newToolId];
    if (def && def.plans.length > 0) {
      const defaultPlan = def.plans[0];
      const cost = defaultPlan.pricePerSeat * entry.seats;
      onUpdate(index, {
        toolId: newToolId,
        planId: defaultPlan.id,
        monthlySpend: cost,
        seats: entry.seats,
      });
    }
  };

  const handlePlanChange = (newPlanId: string) => {
    const plan = currentToolDef?.plans.find((p) => p.id === newPlanId);
    if (plan) {
      // Automatically prefill the price, but let the user modify it if they pay custom prices
      const cost = plan.pricePerSeat * entry.seats;
      onUpdate(index, {
        ...entry,
        planId: newPlanId,
        monthlySpend: cost,
      });
    }
  };

  const handleSeatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seatsVal = parseInt(e.target.value, 10) || 1;
    const seats = Math.max(1, seatsVal);
    
    // Automatically adjust pricing when seats change based on chosen plan
    const plan = currentToolDef?.plans.find((p) => p.id === entry.planId);
    const cost = plan ? plan.pricePerSeat * seats : entry.monthlySpend;

    onUpdate(index, {
      ...entry,
      seats,
      monthlySpend: cost,
    });
  };

  const handleSpendChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const monthlySpend = parseFloat(e.target.value) || 0;
    onUpdate(index, {
      ...entry,
      monthlySpend: Math.max(0, monthlySpend),
    });
  };

  // Set default pricing once on component mount if spend is 0
  useEffect(() => {
    if (entry.monthlySpend === 0 && currentToolDef) {
      const plan = currentToolDef.plans.find((p) => p.id === entry.planId);
      if (plan) {
        onUpdate(index, {
          ...entry,
          monthlySpend: plan.pricePerSeat * entry.seats,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map tools definition into select options
  const toolOptions = Object.values(TOOL_DEFINITIONS).map((tool) => {
    const isSelected = selectedToolIds.includes(tool.id) && tool.id !== entry.toolId;
    return {
      id: tool.id,
      name: tool.name,
      iconId: tool.id,
      details: isSelected ? 'Added' : undefined,
      disabled: isSelected,
    };
  });

  // Map plans definition into select options
  const planOptions = (currentToolDef?.plans || []).map((p) => ({
    id: p.id,
    name: p.name,
    details: `$${p.pricePerSeat}/seat`,
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end bg-white p-5 rounded-xl border border-[#e3e8ee] shadow-sm hover:border-[#a8c3de] hover:shadow-md transition-all duration-200">
      {/* Tool Selection */}
      <div className="sm:col-span-3 flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-sans">
          AI Tool
        </label>
        <GlassSelect
          value={entry.toolId}
          onChange={handleToolChange}
          options={toolOptions}
          placeholder="Choose tool"
          searchPlaceholder="Search AI tools..."
        />
      </div>

      {/* Plan Selection */}
      <div className="sm:col-span-3 flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-sans">
          Plan Level
        </label>
        <GlassSelect
          value={entry.planId}
          onChange={handlePlanChange}
          options={planOptions}
          placeholder="Choose plan"
          searchPlaceholder="Search plan tiers..."
        />
      </div>

      {/* Seats */}
      <div className="sm:col-span-2 flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-sans">
          Seats / Licenses
        </label>
        <input
          type="number"
          min="1"
          value={entry.seats}
          onChange={handleSeatsChange}
          className="w-full bg-white border border-[#a8c3de] rounded-md px-3 py-2 text-sm font-medium text-[#0d253d] focus:outline-none focus:ring-2 focus:ring-[#533afd]/10 focus:border-[#533afd] transition-all font-sans"
        />
      </div>

      {/* Monthly Spend */}
      <div className="sm:col-span-3 flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider font-sans flex justify-between">
          <span>Monthly Spend</span>
          {currentToolDef && (
            <span className="text-[9px] text-zinc-400 font-medium normal-case font-mono">
              List: ${currentToolDef.plans.find(p => p.id === entry.planId)?.pricePerSeat || 0}/seat
            </span>
          )}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium font-mono">
            $
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={entry.monthlySpend}
            onChange={handleSpendChange}
            className="w-full bg-white border border-[#a8c3de] rounded-md pl-7 pr-3 py-2 text-sm font-medium text-[#0d253d] focus:outline-none focus:ring-2 focus:ring-[#533afd]/10 focus:border-[#533afd] transition-all font-sans"
          />
        </div>
      </div>

      {/* Remove Button */}
      <div className="sm:col-span-1 flex justify-center sm:justify-start items-center">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 rounded-md border border-[#e3e8ee] hover:border-red-200 text-zinc-400 hover:text-red-500 bg-white hover:bg-red-50 transition-all duration-200 focus:outline-none cursor-pointer"
          title="Remove tool"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4.5 h-4.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
