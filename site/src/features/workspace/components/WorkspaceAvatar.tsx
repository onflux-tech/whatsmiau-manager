import pb from "@/lib/pocketbase";
import type { Workspace } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LUCIDE_ICON_MAP } from "./icon-data";

interface WorkspaceAvatarProps {
  workspace: Pick<Workspace, "id" | "name" | "icon" | "icon_color" | "icon_file"> & {
    collectionId?: string;
  };
  size?: "sm" | "lg";
  className?: string;
  previewUrl?: string;
}

function shouldUseDarkText(hex: string): boolean {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

export function WorkspaceAvatar({
  workspace,
  size = "sm",
  className,
  previewUrl,
}: WorkspaceAvatarProps) {
  const isSmall = size === "sm";
  const containerClass = cn(
    "flex items-center justify-center overflow-hidden font-semibold shrink-0",
    isSmall ? "size-5 rounded text-xs" : "size-8 rounded-md text-sm",
    className,
  );

  if (previewUrl) {
    return (
      <span className={containerClass}>
        <img src={previewUrl} alt={workspace.name} className="size-full object-cover" />
      </span>
    );
  }

  if (workspace.icon_file) {
    const fileUrl = pb.files.getURL(
      {
        id: workspace.id,
        collectionId: workspace.collectionId ?? "",
        collectionName: "workspaces",
      },
      workspace.icon_file,
      { thumb: "80x80" },
    );
    return (
      <span className={containerClass}>
        <img src={fileUrl} alt={workspace.name} className="size-full object-cover" />
      </span>
    );
  }

  const hasColor = !!workspace.icon_color;
  const bgStyle = hasColor
    ? {
        backgroundColor: workspace.icon_color,
        color: shouldUseDarkText(workspace.icon_color) ? "#1e293b" : "#fff",
      }
    : undefined;
  const bgClass = hasColor ? "" : "bg-muted";

  if (workspace.icon?.startsWith("lucide:")) {
    const iconName = workspace.icon.replace("lucide:", "");
    const IconComp = LUCIDE_ICON_MAP[iconName];
    if (IconComp) {
      return (
        <span className={cn(containerClass, bgClass)} style={bgStyle}>
          <IconComp className={isSmall ? "size-3" : "size-5"} />
        </span>
      );
    }
  }

  if (workspace.icon && !workspace.icon.startsWith("lucide:")) {
    return (
      <span className={cn(containerClass, bgClass)} style={bgStyle}>
        <span className={isSmall ? "text-xs" : "text-base"}>{workspace.icon}</span>
      </span>
    );
  }

  return (
    <span className={cn(containerClass, bgClass)} style={bgStyle}>
      {workspace.name?.charAt(0).toUpperCase() ?? "W"}
    </span>
  );
}
