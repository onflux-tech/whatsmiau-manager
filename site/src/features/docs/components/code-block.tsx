import { Check, Clipboard } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { highlightCurl, highlightJS } from "./syntax-highlight";

interface CodeBlockProps {
  curlCode: string;
  jsCode: string;
}

export function CodeBlock({ curlCode, jsCode }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"curl" | "js">("curl");

  const handleCopy = async () => {
    const raw = activeTab === "curl" ? curlCode : jsCode;
    await navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-muted/30">
      <div className="flex items-center justify-between border-b border-border/50 px-4">
        <div className="flex gap-4">
          {(["curl", "js"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative py-2.5 text-xs font-medium transition-colors",
                activeTab === tab
                  ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab === "curl" ? "cURL" : "JavaScript"}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          className="docs-copy-btn"
          aria-label={copied ? "Copied" : "Copy code"}
        >
          {copied ? (
            <Check className="text-green-400" />
          ) : (
            <Clipboard className="text-muted-foreground" />
          )}
        </Button>
      </div>

      <pre className="overflow-x-auto p-4 text-xs font-mono leading-relaxed">
        <code>{activeTab === "curl" ? highlightCurl(curlCode) : highlightJS(jsCode)}</code>
      </pre>
    </div>
  );
}
