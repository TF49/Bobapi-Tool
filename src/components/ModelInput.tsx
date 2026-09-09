import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { ChevronDown, Download, Loader2, Search } from "lucide-react";
import type { FetchedModel } from "../types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface ModelInputProps {
  value: string;
  onChange: (value: string) => void;
  models: FetchedModel[];
  placeholder: string;
  id: string;
  onRefresh: () => void;
  refreshing: boolean;
}

export function ModelInput({
  value,
  onChange,
  models,
  placeholder,
  id,
  onRefresh,
  refreshing,
}: ModelInputProps) {
  const [open, setOpen] = useState(false);
  const grouped = new Map<string, FetchedModel[]>();
  for (const model of models) {
    const vendor = model.ownedBy || "Other";
    const group = grouped.get(vendor) || [];
    group.push(model);
    grouped.set(vendor, group);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          测试模型
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={refreshing}
          className="h-7 shrink-0 gap-1 text-xs"
        >
          {refreshing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          获取模型列表
        </Button>
      </div>
      <div className="flex gap-1">
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="min-w-0 flex-1 font-mono"
        />
        {models.length > 0 && (
          <Popover.Root modal open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>
              <Button
                type="button"
                variant="outline"
                aria-label="选择模型"
                title="选择模型"
                className="w-10 shrink-0 px-0"
              >
                <ChevronDown size={16} />
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="end"
                sideOffset={4}
                collisionPadding={8}
                className="z-[200] w-72 max-w-[calc(100vw-16px)] overflow-hidden rounded-lg border border-[#333] bg-[#1f1f1f] text-gray-200 shadow-xl"
              >
                <Command label="搜索模型">
                  <div className="flex items-center gap-2 border-b border-[#333] px-3">
                    <Search size={15} className="shrink-0 text-gray-500" />
                    <Command.Input
                      placeholder="搜索模型..."
                      className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
                    />
                  </div>
                  <Command.List className="max-h-64 overflow-y-auto overscroll-contain p-1">
                    <Command.Empty className="py-6 text-center text-sm text-gray-500">
                      未找到匹配的模型
                    </Command.Empty>
                    {[...grouped.keys()].sort().map((vendor) => (
                      <Command.Group
                        key={vendor}
                        heading={vendor}
                        className="[&_[cmdk-group-heading]]:break-words [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-gray-500"
                      >
                        {grouped.get(vendor)!.map((model, index) => (
                          <Command.Item
                            key={`${model.id}-${index}`}
                            value={model.id}
                            keywords={[vendor]}
                            onSelect={() => {
                              onChange(model.id);
                              setOpen(false);
                            }}
                            className="cursor-pointer break-all rounded px-2 py-1.5 text-sm data-[selected=true]:bg-white/10"
                          >
                            {model.id}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    ))}
                  </Command.List>
                </Command>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        )}
      </div>
    </div>
  );
}
