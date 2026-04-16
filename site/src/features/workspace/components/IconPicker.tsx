import { Check, ImagePlus, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { COLOR_SWATCHES, EMOJI_GRID, LUCIDE_ICON_MAP, LUCIDE_ICONS } from "./icon-data";

interface IconPickerProps {
  icon: string;
  iconColor: string;
  iconFile: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
  onFileChange: (file: File | null) => void;
  onFileClear: () => void;
}

const MAX_FILE_SIZE = 512 * 1024;

function manualScroll(e: React.WheelEvent<HTMLDivElement>) {
  e.currentTarget.scrollTop += e.deltaY;
}

export function IconPicker({
  icon,
  iconColor,
  iconFile,
  onIconChange,
  onColorChange,
  onFileChange,
  onFileClear,
}: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("icons");
  const fileRef = useRef<HTMLInputElement>(null);

  const clearAll = () => {
    onIconChange("");
    onFileChange(null);
    onFileClear();
    onColorChange("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Imagem muito grande (máx. 512KB)");
      return;
    }
    onIconChange("");
    onColorChange("");
    onFileChange(file);
    setOpen(false);
  };

  const handleIconSelect = (name: string) => {
    onFileChange(null);
    onFileClear();
    onIconChange(`lucide:${name}`);
    setOpen(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    onFileChange(null);
    onFileClear();
    onIconChange(emoji);
    setOpen(false);
  };

  const handleClear = () => {
    clearAll();
    setOpen(false);
  };

  const currentPreview = () => {
    if (icon.startsWith("lucide:")) {
      const IconComp = LUCIDE_ICON_MAP[icon.replace("lucide:", "")];
      if (IconComp) return <IconComp className="size-4" />;
    }
    if (icon) return <span className="text-sm">{icon}</span>;
    if (iconFile) return <ImagePlus className="size-4" />;
    return <ImagePlus className="size-4 text-muted-foreground" />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <span
            className="flex size-6 items-center justify-center rounded"
            style={iconColor ? { backgroundColor: iconColor, color: "#fff" } : undefined}
          >
            {currentPreview()}
          </span>
          Alterar ícone
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="icons" className="flex-1">
              Ícones
            </TabsTrigger>
            <TabsTrigger value="emoji" className="flex-1">
              Emoji
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">
              Imagem
            </TabsTrigger>
          </TabsList>

          {/* Lucide icons tab */}
          <TabsContent value="icons" className="mt-0 p-2">
            <Input
              placeholder="Buscar ícone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2 h-8 text-xs"
            />
            <div className="h-48 overflow-y-auto" onWheel={manualScroll}>
              {Object.entries(LUCIDE_ICONS).map(([category, names]) => {
                const filtered = search
                  ? names.filter((n) => n.toLowerCase().includes(search.toLowerCase()))
                  : names;
                if (filtered.length === 0) return null;
                return (
                  <div key={category} className="mb-2">
                    <p className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {category}
                    </p>
                    <div className="grid grid-cols-8 gap-0.5">
                      {filtered.map((name) => {
                        const IconComp = LUCIDE_ICON_MAP[name];
                        if (!IconComp) return null;
                        const isActive = icon === `lucide:${name}`;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => handleIconSelect(name)}
                            className={cn(
                              "flex size-8 items-center justify-center rounded text-foreground hover:bg-accent",
                              isActive && "bg-accent ring-1 ring-primary",
                            )}
                            title={name}
                          >
                            <IconComp className="size-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Emoji tab */}
          <TabsContent value="emoji" className="mt-0 p-2">
            <div className="h-48 overflow-y-auto" onWheel={manualScroll}>
              {Object.entries(EMOJI_GRID).map(([category, emojis]) => (
                <div key={category} className="mb-2">
                  <p className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {category}
                  </p>
                  <div className="grid grid-cols-8 gap-0.5">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        className={cn(
                          "flex size-8 items-center justify-center rounded text-base hover:bg-accent",
                          icon === emoji && "bg-accent ring-1 ring-primary",
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Upload tab */}
          <TabsContent value="upload" className="mt-0 p-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={handleFileSelect}
            />
            {iconFile ? (
              <div className="flex flex-col items-center gap-3">
                <p className="truncate text-xs text-muted-foreground">{iconFile}</p>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    onIconChange("");
                    onFileClear();
                    onFileChange(null);
                  }}
                >
                  <Trash2 className="mr-1 size-3" />
                  Remover imagem
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              >
                <Upload className="size-6" />
                <span className="text-xs">PNG, JPG, WebP, GIF, SVG (máx. 512KB)</span>
              </button>
            )}
          </TabsContent>
        </Tabs>

        {/* Color swatches — hidden on upload tab */}
        {tab !== "upload" && (
          <div className="border-t p-2">
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Cor de fundo
            </p>
            <div className="flex flex-wrap gap-1">
              {iconColor && (
                <button
                  type="button"
                  onClick={() => onColorChange("")}
                  className="flex size-6 items-center justify-center rounded-full border hover:bg-accent"
                  title="Remover cor"
                >
                  <X className="size-3" />
                </button>
              )}
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  onClick={() => onColorChange(swatch.value)}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full",
                    iconColor === swatch.value && "ring-2 ring-offset-1 ring-primary",
                  )}
                  style={{ backgroundColor: swatch.value }}
                  title={swatch.label}
                >
                  {iconColor === swatch.value && <Check className="size-3 text-white" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clear all */}
        {(icon || iconColor || iconFile) && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={handleClear}
            >
              <Trash2 className="mr-1 size-3" />
              Remover ícone
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
