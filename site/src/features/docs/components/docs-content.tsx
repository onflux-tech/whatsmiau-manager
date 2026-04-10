import { forwardRef } from "react";
import type { ApiEndpoint, ApiGroup } from "../types";
import { EndpointSection } from "./endpoint-section";
import { GettingStarted } from "./getting-started";

interface DocsContentProps {
  groups: ApiGroup[];
  onOpenPlayground?: (endpoint: ApiEndpoint) => void;
}

export const DocsContent = forwardRef<HTMLDivElement, DocsContentProps>(function DocsContent(
  { groups, onOpenPlayground },
  ref,
) {
  return (
    <div ref={ref} className="flex-1 overflow-y-auto">
      <main className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <GettingStarted />

        {groups.map((group) => {
          if (group.endpoints.length === 0) return null;

          return (
            <div key={group.id} className="mt-24 border-t border-border pt-12">
              <div id={group.id} className="mb-12 scroll-mt-24">
                <h2 className="mb-2 text-2xl font-bold">{group.title}</h2>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>

              <div className="space-y-56">
                {group.endpoints.map((endpoint) => (
                  <EndpointSection
                    key={endpoint.id}
                    endpoint={endpoint}
                    onOpenPlayground={onOpenPlayground}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
});
