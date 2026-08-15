"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import {
  ReactGridLayout,
  type Layout,
  type LayoutItem,
} from "react-grid-layout/legacy";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/hooks/use-auth";
import { useIsMdUp } from "@/hooks/use-media-query";
import {
  useDashboardPrefs,
  useUpdateDashboardPrefs,
} from "@/hooks/use-dashboard-prefs";
import type {
  DashboardLayoutItem,
  DashboardWidgetType,
} from "@/types/domain";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ALL_WIDGET_TYPES,
  DASHBOARD_COLS,
  WIDGET_REGISTRY,
  createStarterLayout,
  isLayoutUntidy,
  packDashboardLayout,
} from "./widget-registry";
import { WidgetPreview } from "./widget-previews";
import { useMotionSafe } from "./motion";
import { cn } from "@/lib/utils";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const COLS = DASHBOARD_COLS;
const ROW_HEIGHT = 88;
const LAYOUT_TIDY_KEY = "dashboard-layout-tidy-v2";

type DashboardCanvasProps = {
  headerTitle?: ReactNode;
};

function toRgl(layout: DashboardLayoutItem[]): Layout {
  return layout.map((item) => {
    const meta = WIDGET_REGISTRY[item.type];
    return {
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: meta.minW,
      minH: meta.minH,
    };
  });
}

function mergeLayout(
  items: DashboardLayoutItem[],
  next: Layout,
): DashboardLayoutItem[] {
  const byId = new Map(items.map((it) => [it.i, it]));
  return next
    .map((l) => {
      const prev = byId.get(l.i);
      if (!prev) return null;
      return {
        ...prev,
        x: l.x,
        y: l.y,
        w: l.w,
        h: l.h,
      };
    })
    .filter(Boolean) as DashboardLayoutItem[];
}

function layoutGeometryEqual(
  a: DashboardLayoutItem[],
  b: DashboardLayoutItem[],
): boolean {
  if (a.length !== b.length) return false;
  const byId = new Map(b.map((item) => [item.i, item]));
  return a.every((item) => {
    const other = byId.get(item.i);
    return (
      !!other &&
      other.x === item.x &&
      other.y === item.y &&
      other.w === item.w &&
      other.h === item.h
    );
  });
}

function findPlacement(
  layout: DashboardLayoutItem[],
  w: number,
  h: number,
): { x: number; y: number } {
  const overlaps = (
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number },
  ) =>
    !(
      a.x + a.w <= b.x ||
      b.x + b.w <= a.x ||
      a.y + a.h <= b.y ||
      b.y + b.h <= a.y
    );

  for (let y = 0; y < 200; y++) {
    for (let x = 0; x <= COLS - w; x++) {
      const candidate = { x, y, w, h };
      if (layout.every((item) => !overlaps(candidate, item))) {
        return { x, y };
      }
    }
  }

  const y = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
  return { x: 0, y };
}

export function DashboardCanvas({ headerTitle }: DashboardCanvasProps) {
  const t = useTranslations("dashboard");
  const safe = useMotionSafe();
  const isMdUp = useIsMdUp();
  const { user, isLoading: authLoading } = useAuth();
  const userId = user?.id;
  const { data: prefs, isLoading: prefsLoading } = useDashboardPrefs();
  const updatePrefs = useUpdateDashboardPrefs();
  const isLoading = authLoading || prefsLoading;

  const [editing, setEditing] = useState(false);
  const canEdit = isMdUp;
  const effectiveEditing = editing && canEdit;
  const [layout, setLayout] = useState<DashboardLayoutItem[]>([]);
  const [width, setWidth] = useState(1200);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overTrash, setOverTrash] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overTrashRef = useRef(false);

  const persist = useCallback(
    (next: DashboardLayoutItem[]) => {
      if (!userId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void updatePrefs.mutateAsync(next);
      }, 400);
    },
    [updatePrefs, userId],
  );

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setLayout([]);
    setEditing(false);
    setDraggingId(null);
    setOverTrash(false);
    overTrashRef.current = false;
  }, [userId]);

  // Hydrate from server only when not editing — otherwise query updates from
  // persist() clobber in-progress drag/resize positions.
  useEffect(() => {
    if (editing) return;
    if (!prefs?.layout || !userId) return;

    const incoming = prefs.layout;
    if (incoming.length === 0) {
      const starter = createStarterLayout(() => uuidv4());
      setLayout(starter);
      persist(starter);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`${LAYOUT_TIDY_KEY}:${userId}`, "1");
      }
      return;
    }

    const tidyKey = `${LAYOUT_TIDY_KEY}:${userId}`;
    const alreadyTidied =
      typeof window !== "undefined" &&
      window.localStorage.getItem(tidyKey) === "1";

    if (!alreadyTidied && isLayoutUntidy(incoming)) {
      const tidied = packDashboardLayout(incoming);
      setLayout(tidied);
      persist(tidied);
      window.localStorage.setItem(tidyKey, "1");
      return;
    }

    setLayout(incoming);
  }, [prefs?.layout, userId, persist, editing]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(Math.floor(w));
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const rglLayout = useMemo(() => toRgl(layout), [layout]);

  const sortedLayout = useMemo(
    () => [...layout].sort((a, b) => a.y - b.y || a.x - b.x),
    [layout],
  );

  const usedTypes = useMemo(
    () => new Set(layout.map((l) => l.type)),
    [layout],
  );

  const available = ALL_WIDGET_TYPES.filter((type) => !usedTypes.has(type));

  const finishEditing = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await updatePrefs.mutateAsync(layout);
    setEditing(false);
  }, [layout, updatePrefs]);

  const resetLayout = useCallback(() => {
    const tidied =
      layout.length > 0
        ? packDashboardLayout(layout)
        : createStarterLayout(() => uuidv4());
    setLayout(tidied);
    persist(tidied);
    if (userId && typeof window !== "undefined") {
      window.localStorage.setItem(`${LAYOUT_TIDY_KEY}:${userId}`, "1");
    }
  }, [layout, persist, userId]);

  const toolbar = canEdit ? (
    editing ? (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer gap-1.5 rounded-full"
          onClick={() => setAddOpen(true)}
          disabled={available.length === 0}
        >
          <Plus className="size-3.5" />
          {t("editMode.addWidget")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer rounded-full text-muted-foreground"
          onClick={resetLayout}
        >
          {t("editMode.reset")}
        </Button>
        <Button
          size="sm"
          className="cursor-pointer rounded-full"
          onClick={() => void finishEditing()}
        >
          {t("editMode.done")}
        </Button>
      </div>
    ) : (
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer rounded-full"
        onClick={() => setEditing(true)}
      >
        {t("editMode.edit")}
      </Button>
    )
  ) : null;

  const onLayoutChange = useCallback(
    (next: Layout) => {
      if (!(editing && canEdit)) return;
      // Local only while dragging — persist on drag/resize stop so the
      // server cache doesn't fight the controlled layout mid-gesture.
      // Bail out when geometry is unchanged to avoid an RGL↔React update loop.
      setLayout((prev) => {
        const merged = mergeLayout(prev, next);
        return layoutGeometryEqual(prev, merged) ? prev : merged;
      });
    },
    [editing, canEdit],
  );

  function handleDrag(
    _layout: Layout,
    _oldItem: LayoutItem | null,
    _newItem: LayoutItem | null,
    _placeholder: LayoutItem | null,
    event: Event,
  ) {
    const e = event as MouseEvent | TouchEvent;
    const point =
      "touches" in e && e.touches[0]
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY };
    const trash = trashRef.current?.getBoundingClientRect();
    if (!trash) {
      overTrashRef.current = false;
      setOverTrash(false);
      return;
    }
    const hit =
      point.x >= trash.left &&
      point.x <= trash.right &&
      point.y >= trash.top &&
      point.y <= trash.bottom;
    overTrashRef.current = hit;
    setOverTrash(hit);
  }

  function handleDragStop(
    next: Layout,
    _oldItem: LayoutItem | null,
    newItem: LayoutItem | null,
  ) {
    const id = newItem?.i ?? draggingId;
    const shouldTrash = overTrashRef.current && id;
    setDraggingId(null);
    setOverTrash(false);
    overTrashRef.current = false;

    if (shouldTrash && id) {
      setLayout((prev) => {
        const filtered = prev.filter((item) => item.i !== id);
        persist(filtered);
        return filtered;
      });
      return;
    }

    setLayout((prev) => {
      const merged = mergeLayout(prev, next);
      if (layoutGeometryEqual(prev, merged)) return prev;
      persist(merged);
      return merged;
    });
  }

  function addWidget(type: DashboardWidgetType) {
    const meta = WIDGET_REGISTRY[type];
    const place = findPlacement(layout, meta.defaultW, meta.defaultH);
    const item: DashboardLayoutItem = {
      i: uuidv4(),
      type,
      x: place.x,
      y: place.y,
      w: meta.defaultW,
      h: meta.defaultH,
    };
    setLayout((prev) => {
      const next = [...prev, item];
      persist(next);
      return next;
    });
    setAddOpen(false);
  }

  function renderWidget(item: DashboardLayoutItem, editable: boolean) {
    const meta = WIDGET_REGISTRY[item.type];
    const Comp = meta.component;
    return (
      <div
        key={item.i}
        className={cn(
          "transition-shadow duration-200",
          editable && "shadow-md ring-1 ring-border/80",
          editable && draggingId === item.i && "z-20 opacity-90",
        )}
      >
        {editable && (
          <div className="widget-drag-handle absolute inset-x-0 top-0 z-10 flex h-7 cursor-grab items-center justify-center rounded-t-2xl bg-muted/80 text-[10px] font-medium uppercase tracking-wider text-muted-foreground active:cursor-grabbing">
            {t(`widgets.${item.type}`)}
          </div>
        )}
        <div
          className={cn(
            "h-full overflow-hidden rounded-2xl",
            editable && "pt-7",
          )}
        >
          <div className="h-full [&_>section]:h-full">
            <Comp />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {headerTitle ? (
        <PageHeader variant="dashboard" title={headerTitle} actions={toolbar} />
      ) : (
        toolbar && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 px-4 pb-3 pt-1 md:px-6">
            {toolbar}
          </div>
        )
      )}

      <div
        ref={containerRef}
        className={cn(
          "relative min-h-0 flex-1 overflow-auto px-4 pb-24 md:px-6",
          editing && isMdUp && "bg-muted/20 transition-colors duration-300",
        )}
        aria-live="polite"
        aria-label={effectiveEditing ? t("editMode.editing") : undefined}
      >
        {isLoading && layout.length === 0 ? (
          <div className="grid grid-cols-12 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="col-span-4 h-40 animate-pulse rounded-2xl bg-muted"
              />
            ))}
          </div>
        ) : !isMdUp ? (
          <div className="flex flex-col gap-4 pb-4">
            <p className="text-sm text-muted-foreground">
              {t("editMode.mobileHint")}
            </p>
            {sortedLayout.map((item) => renderWidget(item, false))}
          </div>
        ) : (
          <ReactGridLayout
            className={cn("layout", effectiveEditing && "editing")}
            layout={rglLayout}
            cols={COLS}
            rowHeight={ROW_HEIGHT}
            width={Math.max(width, 320)}
            margin={[16, 16] as const}
            containerPadding={[0, 0] as const}
            isDraggable={effectiveEditing}
            isResizable={effectiveEditing}
            draggableHandle=".widget-drag-handle"
            compactType="vertical"
            onLayoutChange={onLayoutChange}
            onDragStart={(_l, _o, item) => {
              if (item) setDraggingId(item.i);
            }}
            onDrag={handleDrag}
            onDragStop={handleDragStop}
            onResizeStop={(next) => {
              setLayout((prev) => {
                const merged = mergeLayout(prev, next);
                if (layoutGeometryEqual(prev, merged)) return prev;
                persist(merged);
                return merged;
              });
            }}
          >
            {layout.map((item) => renderWidget(item, effectiveEditing))}
          </ReactGridLayout>
        )}

        <AnimatePresence>
          {effectiveEditing && draggingId && (
            <motion.div
              ref={trashRef}
              className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: overTrash ? 1.12 : 1,
              }}
              exit={{ opacity: 0, y: 16, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <div
                className={cn(
                  "pointer-events-auto flex size-16 items-center justify-center rounded-full border-2 shadow-lg transition-colors",
                  overTrash
                    ? "border-destructive bg-destructive text-destructive-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
                aria-label={t("editMode.trash")}
              >
                <Trash2 className="size-6" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("editMode.addTitle")}</DialogTitle>
            <DialogDescription>{t("editMode.addDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2 sm:grid-cols-2">
            {available.map((type, i) => (
              <motion.button
                key={type}
                type="button"
                initial={safe ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={safe ? { scale: 1.02 } : undefined}
                whileTap={safe ? { scale: 0.98 } : undefined}
                className="cursor-pointer rounded-2xl border bg-card p-4 text-start transition-shadow hover:shadow-md"
                onClick={() => addWidget(type)}
              >
                <p className="text-sm font-semibold">{t(`widgets.${type}`)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(`pack.${type}.blurb`)}
                </p>
                <WidgetPreview type={type} />
              </motion.button>
            ))}
            {available.length === 0 && (
              <p className="col-span-2 text-sm text-muted-foreground">
                {t("editMode.allAdded")}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
