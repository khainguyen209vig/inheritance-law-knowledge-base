"use client";

import { useId, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  edgeLabel,
  graphDiagnostics,
  graphLevels,
  jointBiologicalChildren,
  type FamilyEdgeType,
  type FamilyGraph,
  type FamilyPerson,
  type JointBiologicalChildConnection,
} from "@/modules/family-graph/model";

const NODE_WIDTH = 176;
const NODE_HEIGHT = 116;
const COLUMN_GAP = 72;
const ROW_GAP = 112;
const CANVAS_PADDING_X = 320;
const CANVAS_PADDING_Y = 290;
const DRAFT_WIDTH = 260;

type Direction = "top" | "right" | "bottom" | "left";
export type RelatedPersonRole = "biological-parent" | "adoptive-parent" | "biological-child" | "adopted-child" | "spouse";

interface DraftNode {
  anchorId: string;
  direction: Direction;
  name: string;
  role: RelatedPersonRole;
}

interface JointChildDraft {
  spouseEdgeId: string;
  name: string;
}

interface FamilyGraphEditorProps {
  graph: FamilyGraph;
  selectedId?: string;
  onSelect: (id: string) => void;
  onChange: (graph: FamilyGraph) => void;
  onCreateRelated: (anchorId: string, name: string, role: RelatedPersonRole) => void;
  onCreateJointChild: (spouseEdgeId: string, name: string) => void;
  onRenamePerson: (id: string, name: string) => void;
  onDeletePerson: (id: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const relationChoices: Array<{ value: RelatedPersonRole; label: string }> = [
  { value: "biological-parent", label: "Cha/mẹ đẻ của người đang chọn" },
  { value: "adoptive-parent", label: "Cha/mẹ nuôi của người đang chọn" },
  { value: "biological-child", label: "Con đẻ riêng của người đang chọn" },
  { value: "adopted-child", label: "Con nuôi của người đang chọn" },
  { value: "spouse", label: "Vợ/chồng tại thời điểm mở thừa kế" },
];

const directionDefaults: Record<Direction, RelatedPersonRole> = {
  top: "biological-parent",
  right: "spouse",
  bottom: "biological-child",
  left: "spouse",
};

export function FamilyGraphEditor({ graph, selectedId, onSelect, onChange, onCreateRelated, onCreateJointChild, onRenamePerson, onDeletePerson, onUndo, onRedo, canUndo, canRedo }: FamilyGraphEditorProps) {
  const [draft, setDraft] = useState<DraftNode>();
  const [jointChildDraft, setJointChildDraft] = useState<JointChildDraft>();
  const [editingPersonId, setEditingPersonId] = useState<string>();
  const [editingName, setEditingName] = useState("");
  const [zoom, setZoom] = useState(1);
  const peopleById = useMemo(() => new Map(graph.people.map((person) => [person.id, person])), [graph.people]);
  const layout = useMemo(() => createGraphLayout(graph), [graph]);
  const diagnostics = useMemo(() => graphDiagnostics(graph), [graph]);
  const jointChildren = useMemo(() => jointBiologicalChildren(graph), [graph]);
  const visibleEdges = useMemo(() => graph.edges.filter((edge) => edge.type !== "step-parent-of"), [graph.edges]);
  const occupiedDirections = useMemo(() => findOccupiedDirections(graph, layout.positions), [graph, layout.positions]);
  const selectedPerson = selectedId ? peopleById.get(selectedId) : undefined;
  const markerToken = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  function beginNode(anchorId: string, direction: Direction) {
    setJointChildDraft(undefined);
    setDraft({ anchorId, direction, name: "", role: directionDefaults[direction] });
  }

  function saveDraft() {
    if (!draft?.name.trim()) return;
    onCreateRelated(draft.anchorId, draft.name.trim(), draft.role);
    setDraft(undefined);
  }

  function beginEdit(person: FamilyPerson) {
    setDraft(undefined);
    setJointChildDraft(undefined);
    setEditingPersonId(person.id);
    setEditingName(person.name);
    onSelect(person.id);
  }

  function saveEdit() {
    if (!editingPersonId || !editingName.trim()) return;
    onRenamePerson(editingPersonId, editingName.trim());
    setEditingPersonId(undefined);
  }

  function beginJointChild(spouseEdgeId: string) {
    setDraft(undefined);
    setEditingPersonId(undefined);
    setJointChildDraft({ spouseEdgeId, name: "" });
  }

  function saveJointChild() {
    if (!jointChildDraft?.name.trim()) return;
    onCreateJointChild(jointChildDraft.spouseEdgeId, jointChildDraft.name.trim());
    setJointChildDraft(undefined);
  }

  return <Card>
    <CardHeader>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><CardTitle>Cây quan hệ</CardTitle><CardDescription>Chọn một node, sau đó dùng dấu + còn trống quanh node để thêm người trực tiếp trên cây.</CardDescription></div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{graph.people.length} người · {graph.edges.length} quan hệ</Badge>
          <Button variant="outline" size="sm" disabled={!canUndo} onClick={onUndo} title="Hoàn tác thay đổi graph gần nhất">↶ Hoàn tác</Button>
          <Button variant="outline" size="sm" disabled={!canRedo} onClick={onRedo} title="Làm lại thay đổi vừa hoàn tác">↷ Làm lại</Button>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
        <GraphLegend />
        <div className="flex items-center gap-1" aria-label="Điều khiển thu phóng">
          <Button variant="ghost" size="sm" disabled={zoom <= 0.7} onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))} aria-label="Thu nhỏ graph">−</Button>
          <button type="button" className="min-w-14 rounded px-2 py-1 text-xs tabular-nums hover:bg-muted" onClick={() => setZoom(1)} title="Đặt lại 100%">{Math.round(zoom * 100)}%</button>
          <Button variant="ghost" size="sm" disabled={zoom >= 1.4} onClick={() => setZoom((value) => Math.min(1.4, value + 0.1))} aria-label="Phóng to graph">+</Button>
        </div>
      </div>

      <div className="max-h-[650px] overflow-auto rounded-xl border bg-[radial-gradient(circle_at_center,_var(--muted)_1px,_transparent_1px)] bg-[length:20px_20px]" aria-label="Canvas cây quan hệ">
        <div style={{ width: layout.width * zoom, height: layout.height * zoom }}>
          <div className="relative" style={{ width: layout.width, height: layout.height, transform: `scale(${zoom})`, transformOrigin: "top left" }}>
            <GraphConnections graph={graph} positions={layout.positions} jointChildren={jointChildren} markerToken={markerToken} width={layout.width} height={layout.height} />
            {draft ? <DraftConnection draft={draft} positions={layout.positions} /> : null}
            {jointChildDraft ? <JointChildDraftConnection draft={jointChildDraft} graph={graph} positions={layout.positions} /> : null}
            {graph.people.map((person) => {
              const position = layout.positions.get(person.id);
              if (!position) return null;
              const selected = selectedId === person.id;
              if (editingPersonId === person.id) return <form key={person.id} className="absolute z-40 rounded-xl border-2 border-primary bg-card p-3 shadow-xl" style={{ left: position.x, top: position.y, width: NODE_WIDTH, minHeight: NODE_HEIGHT }} onSubmit={(event) => { event.preventDefault(); saveEdit(); }}>
                <label className="block text-xs font-medium">Tên node<Input className="mt-1" autoFocus value={editingName} maxLength={80} onChange={(event) => setEditingName(event.target.value)} /></label>
                <div className="mt-2 flex justify-end gap-1"><Button type="button" variant="ghost" size="sm" onClick={() => setEditingPersonId(undefined)}>Hủy</Button><Button type="submit" size="sm" disabled={!editingName.trim()}>Lưu</Button></div>
              </form>;
              return <div key={person.id} className="absolute" style={{ left: position.x, top: position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}>
                <button
                  type="button"
                  onClick={() => { onSelect(person.id); setDraft(undefined); setJointChildDraft(undefined); }}
                  aria-pressed={selected}
                  className={cn(
                    "h-full w-full rounded-xl border bg-card p-3 pb-9 text-left shadow-sm outline-none transition focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-ring",
                    selected && "border-primary ring-2 ring-primary/30",
                    person.id === graph.deceasedId && "border-amber-500 bg-amber-50",
                  )}
                >
                  <span className="block truncate text-xs text-muted-foreground">{personStatus(person, graph.deceasedId)}</span>
                  <span className="mt-1 block truncate font-semibold">{person.name}</span>
                  <span className="mt-1 block truncate font-mono text-[9px] text-muted-foreground">{person.id}</span>
                </button>
                <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1">
                  <button type="button" className="rounded px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => beginEdit(person)}>Sửa</button>
                  {person.id !== graph.deceasedId ? <button type="button" className="rounded px-2 py-1 text-[10px] font-medium text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500" onClick={() => { setDraft(undefined); setJointChildDraft(undefined); setEditingPersonId(undefined); onDeletePerson(person.id); }}>Xóa</button> : null}
                </div>
                {selected ? <NodeAddHandles
                  personId={person.id}
                  occupied={occupiedDirections.get(person.id) ?? new Set()}
                  activeDirection={draft?.anchorId === person.id ? draft.direction : undefined}
                  onAdd={beginNode}
                /> : null}
              </div>;
            })}
            <CoupleChildHandles graph={graph} positions={layout.positions} selectedId={selectedId} activeEdgeId={jointChildDraft?.spouseEdgeId} onAdd={beginJointChild} />
            {draft ? <NewNodeForm draft={draft} positions={layout.positions} onChange={setDraft} onCancel={() => setDraft(undefined)} onSave={saveDraft} /> : null}
            {jointChildDraft ? <NewJointChildForm draft={jointChildDraft} graph={graph} positions={layout.positions} peopleById={peopleById} onChange={setJointChildDraft} onCancel={() => setJointChildDraft(undefined)} onSave={saveJointChild} /> : null}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Dấu + trên cạnh vợ/chồng tạo con chung bằng hai facts cha/mẹ đẻ. Dấu + trên từng node vẫn tạo quan hệ riêng của người đó.</p>

      {diagnostics.length ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{diagnostics.map((item) => <p key={item}>• {item}</p>)}</div> : <p className="text-xs text-emerald-700">Graph không có cạnh trùng, cạnh tự nối hoặc chu trình cha/mẹ–con.</p>}
      {visibleEdges.length ? <details className="rounded-lg border px-3 py-2"><summary className="cursor-pointer text-sm font-medium">Chi tiết {visibleEdges.length} quan hệ đã nhập</summary><div className="mt-3 space-y-2">{visibleEdges.map((edge) => <div key={edge.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/30 p-2"><p className="text-xs font-medium">{edgeLabel(edge, peopleById)}</p><Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" onClick={() => onChange({ ...graph, edges: graph.edges.filter((item) => item.id !== edge.id) })}>Xóa quan hệ</Button></div>)}</div></details> : null}
    </CardContent>
  </Card>;
}

function NodeAddHandles({ personId, occupied, activeDirection, onAdd }: { personId: string; occupied: Set<Direction>; activeDirection?: Direction; onAdd: (personId: string, direction: Direction) => void }) {
  const directions: Direction[] = ["top", "right", "bottom", "left"];
  return <>{directions.map((direction) => occupied.has(direction) ? null : <button
    key={direction}
    type="button"
    className={cn("absolute z-30 grid size-7 place-items-center rounded-full border-2 border-primary bg-background text-lg font-semibold leading-none text-primary shadow-md hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", handlePosition(direction), activeDirection === direction && "bg-primary text-primary-foreground")}
    onClick={() => onAdd(personId, direction)}
    aria-label={`Thêm người ở hướng ${directionLabel(direction)}`}
    title={`Thêm người ở hướng ${directionLabel(direction)}`}
  >+</button>)}</>;
}

function CoupleChildHandles({ graph, positions, selectedId, activeEdgeId, onAdd }: { graph: FamilyGraph; positions: Map<string, NodePosition>; selectedId?: string; activeEdgeId?: string; onAdd: (edgeId: string) => void }) {
  return <>{graph.edges.map((edge) => {
    if (edge.type !== "spouse-at-opening" || (edge.from !== selectedId && edge.to !== selectedId)) return null;
    const midpoint = spouseMidpoint(edge.from, edge.to, positions);
    if (!midpoint) return null;
    return <button key={edge.id} type="button" className={cn("absolute z-30 grid size-8 -translate-x-1/2 place-items-center rounded-full border-2 border-rose-600 bg-background text-lg font-semibold leading-none text-rose-700 shadow-md hover:bg-rose-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", activeEdgeId === edge.id && "bg-rose-600 text-white")} style={{ left: midpoint.x, top: midpoint.y + 18 }} onClick={() => onAdd(edge.id)} aria-label="Thêm con chung của hai vợ chồng" title="Thêm con chung của hai vợ chồng">+</button>;
  })}</>;
}

function NewNodeForm({ draft, positions, onChange, onCancel, onSave }: { draft: DraftNode; positions: Map<string, NodePosition>; onChange: (draft: DraftNode) => void; onCancel: () => void; onSave: () => void }) {
  const anchor = positions.get(draft.anchorId);
  if (!anchor) return null;
  const position = draftPosition(anchor, draft.direction);
  return <form className="absolute z-40 rounded-xl border-2 border-primary bg-card p-3 shadow-xl" style={{ left: position.x, top: position.y, width: DRAFT_WIDTH }} onSubmit={(event) => { event.preventDefault(); onSave(); }}>
    <div className="mb-3 flex items-center justify-between gap-2"><p className="text-sm font-semibold">Người mới</p><Badge variant="outline">{directionLabel(draft.direction)}</Badge></div>
    <label className="block text-xs font-medium">Tên<Input className="mt-1" autoFocus value={draft.name} maxLength={80} placeholder="Ví dụ: Nguyễn Văn B" onChange={(event) => onChange({ ...draft, name: event.target.value })} /></label>
    <label className="mt-3 block text-xs font-medium">Quan hệ<select className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={draft.role} onChange={(event) => onChange({ ...draft, role: event.target.value as RelatedPersonRole })}>{relationChoices.map((choice) => <option key={choice.value} value={choice.value}>{choice.label}</option>)}</select></label>
    <div className="mt-4 flex justify-end gap-2"><Button type="button" variant="outline" size="sm" onClick={onCancel}>Hủy</Button><Button type="submit" size="sm" disabled={!draft.name.trim()}>Tạo node</Button></div>
  </form>;
}

function NewJointChildForm({ draft, graph, positions, peopleById, onChange, onCancel, onSave }: { draft: JointChildDraft; graph: FamilyGraph; positions: Map<string, NodePosition>; peopleById: Map<string, FamilyPerson>; onChange: (draft: JointChildDraft) => void; onCancel: () => void; onSave: () => void }) {
  const spouseEdge = graph.edges.find((edge) => edge.id === draft.spouseEdgeId && edge.type === "spouse-at-opening");
  if (!spouseEdge) return null;
  const midpoint = spouseMidpoint(spouseEdge.from, spouseEdge.to, positions);
  if (!midpoint) return null;
  const position = jointChildDraftPosition(midpoint);
  const firstName = peopleById.get(spouseEdge.from)?.name ?? spouseEdge.from;
  const secondName = peopleById.get(spouseEdge.to)?.name ?? spouseEdge.to;
  return <form className="absolute z-40 rounded-xl border-2 border-rose-600 bg-card p-3 shadow-xl" style={{ left: position.x, top: position.y, width: DRAFT_WIDTH }} onSubmit={(event) => { event.preventDefault(); onSave(); }}>
    <div className="mb-2 flex items-center justify-between gap-2"><p className="text-sm font-semibold">Con chung</p><Badge variant="outline">2 quan hệ cha/mẹ đẻ</Badge></div>
    <p className="mb-3 text-[11px] text-muted-foreground">Con chung của {firstName} và {secondName}. Hệ thống sẽ lưu hai facts độc lập.</p>
    <label className="block text-xs font-medium">Tên<Input className="mt-1" autoFocus value={draft.name} maxLength={80} placeholder="Ví dụ: Nguyễn Văn C" onChange={(event) => onChange({ ...draft, name: event.target.value })} /></label>
    <div className="mt-4 flex justify-end gap-2"><Button type="button" variant="outline" size="sm" onClick={onCancel}>Hủy</Button><Button type="submit" size="sm" disabled={!draft.name.trim()}>Tạo con chung</Button></div>
  </form>;
}

interface NodePosition { x: number; y: number }
interface GraphLayout { width: number; height: number; positions: Map<string, NodePosition> }

function createGraphLayout(graph: FamilyGraph): GraphLayout {
  const levels = graphLevels(graph);
  const groups = new Map<number | "unconnected", FamilyPerson[]>();
  for (const person of graph.people) {
    const level = levels.get(person.id);
    const key = level === undefined ? "unconnected" : level;
    groups.set(key, [...(groups.get(key) ?? []), person]);
  }
  const ordered = [...groups.entries()].sort(([left], [right]) => levelOrder(left) - levelOrder(right));
  const widestRow = Math.max(1, ...ordered.map(([, people]) => people.length));
  const width = Math.max(900, widestRow * NODE_WIDTH + Math.max(0, widestRow - 1) * COLUMN_GAP + CANVAS_PADDING_X * 2);
  const height = Math.max(680, ordered.length * NODE_HEIGHT + Math.max(0, ordered.length - 1) * ROW_GAP + CANVAS_PADDING_Y * 2);
  const positions = new Map<string, NodePosition>();
  ordered.forEach(([, people], rowIndex) => {
    const insertionOrder = new Map(people.map((person, index) => [person.id, index]));
    const sortedPeople = [...people].sort((left, right) => {
      const leftAnchor = parentAnchorX(graph, left.id, positions);
      const rightAnchor = parentAnchorX(graph, right.id, positions);
      if (leftAnchor === undefined && rightAnchor === undefined) return (insertionOrder.get(left.id) ?? 0) - (insertionOrder.get(right.id) ?? 0);
      if (leftAnchor === undefined) return 1;
      if (rightAnchor === undefined) return -1;
      return leftAnchor - rightAnchor || (insertionOrder.get(left.id) ?? 0) - (insertionOrder.get(right.id) ?? 0);
    });
    const rowWidth = people.length * NODE_WIDTH + Math.max(0, people.length - 1) * COLUMN_GAP;
    const startX = (width - rowWidth) / 2;
    sortedPeople.forEach((person, columnIndex) => positions.set(person.id, { x: startX + columnIndex * (NODE_WIDTH + COLUMN_GAP), y: CANVAS_PADDING_Y + rowIndex * (NODE_HEIGHT + ROW_GAP) }));
  });
  return { width, height, positions };
}

function GraphConnections({ graph, positions, jointChildren, markerToken, width, height }: { graph: FamilyGraph; positions: Map<string, NodePosition>; jointChildren: JointBiologicalChildConnection[]; markerToken: string; width: number; height: number }) {
  const jointParentEdgeIds = new Set(jointChildren.flatMap((connection) => connection.parentEdgeIds));
  return <svg className="pointer-events-none absolute inset-0" width={width} height={height} aria-hidden="true">
    <defs>{edgeTypes().filter((type) => type !== "spouse-at-opening").map((type) => <marker key={type} id={`${markerToken}-${type}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" className={edgeVisual(type).fill} /></marker>)}</defs>
    {graph.edges.map((edge) => {
      if (edge.type === "step-parent-of") return null;
      if (jointParentEdgeIds.has(edge.id)) return null;
      const from = positions.get(edge.from), to = positions.get(edge.to);
      if (!from || !to) return null;
      const spouse = edge.type === "spouse-at-opening";
      const startX = from.x + NODE_WIDTH / 2;
      const startY = spouse ? from.y + NODE_HEIGHT / 2 : from.y + NODE_HEIGHT;
      const endX = to.x + NODE_WIDTH / 2;
      const endY = spouse ? to.y + NODE_HEIGHT / 2 : to.y;
      const middleY = (startY + endY) / 2;
      const path = spouse ? `M ${startX} ${startY} L ${endX} ${endY}` : `M ${startX} ${startY} C ${startX} ${middleY}, ${endX} ${middleY}, ${endX} ${endY}`;
      const visual = edgeVisual(edge.type);
      return <g key={edge.id}><path d={path} fill="none" className={cn("stroke-[2.5]", visual.stroke)} strokeDasharray={visual.dash} markerEnd={spouse ? undefined : `url(#${markerToken}-${edge.type})`} /><rect x={(startX + endX) / 2 - 24} y={(startY + endY) / 2 - 9} width="48" height="18" rx="9" className="fill-background stroke-border" /><text x={(startX + endX) / 2} y={(startY + endY) / 2 + 3.5} textAnchor="middle" className={cn("fill-current text-[10px] font-semibold", visual.text)}>{edgeShortLabel(edge.type)}</text></g>;
    })}
    {jointChildren.map((connection) => {
      const midpoint = spouseMidpoint(connection.firstParentId, connection.secondParentId, positions);
      const child = positions.get(connection.childId);
      if (!midpoint || !child) return null;
      const endX = child.x + NODE_WIDTH / 2, endY = child.y;
      const middleY = (midpoint.y + endY) / 2;
      return <g key={`${connection.spouseEdgeId}-${connection.childId}`}><path d={`M ${midpoint.x} ${midpoint.y} C ${midpoint.x} ${middleY}, ${endX} ${middleY}, ${endX} ${endY}`} fill="none" className="stroke-blue-600 stroke-[2.5]" markerEnd={`url(#${markerToken}-biological-parent-of)`} /><rect x={(midpoint.x + endX) / 2 - 34} y={(midpoint.y + endY) / 2 - 9} width="68" height="18" rx="9" className="fill-background stroke-border" /><text x={(midpoint.x + endX) / 2} y={(midpoint.y + endY) / 2 + 3.5} textAnchor="middle" className="fill-blue-700 text-[10px] font-semibold">con chung</text></g>;
    })}
  </svg>;
}

function DraftConnection({ draft, positions }: { draft: DraftNode; positions: Map<string, NodePosition> }) {
  const anchor = positions.get(draft.anchorId);
  if (!anchor) return null;
  const form = draftPosition(anchor, draft.direction);
  const start = nodeCenter(anchor);
  const end = { x: form.x + DRAFT_WIDTH / 2, y: form.y + 70 };
  return <svg className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible" aria-hidden="true"><path d={`M ${start.x} ${start.y} L ${end.x} ${end.y}`} className="stroke-primary stroke-2" strokeDasharray="5 5" /></svg>;
}

function JointChildDraftConnection({ draft, graph, positions }: { draft: JointChildDraft; graph: FamilyGraph; positions: Map<string, NodePosition> }) {
  const spouseEdge = graph.edges.find((edge) => edge.id === draft.spouseEdgeId && edge.type === "spouse-at-opening");
  if (!spouseEdge) return null;
  const midpoint = spouseMidpoint(spouseEdge.from, spouseEdge.to, positions);
  if (!midpoint) return null;
  const form = jointChildDraftPosition(midpoint);
  const end = { x: form.x + DRAFT_WIDTH / 2, y: form.y };
  return <svg className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible" aria-hidden="true"><path d={`M ${midpoint.x} ${midpoint.y} L ${end.x} ${end.y}`} className="stroke-rose-600 stroke-2" strokeDasharray="5 5" /></svg>;
}

function findOccupiedDirections(graph: FamilyGraph, positions: Map<string, NodePosition>): Map<string, Set<Direction>> {
  const result = new Map<string, Set<Direction>>();
  for (const person of graph.people) result.set(person.id, new Set());
  for (const edge of graph.edges) {
    const from = positions.get(edge.from), to = positions.get(edge.to);
    if (!from || !to) continue;
    const fromDirection = relativeDirection(nodeCenter(from), nodeCenter(to));
    const toDirection = oppositeDirection(fromDirection);
    result.get(edge.from)?.add(fromDirection);
    result.get(edge.to)?.add(toDirection);
  }
  return result;
}

function parentAnchorX(graph: FamilyGraph, childId: string, positions: Map<string, NodePosition>): number | undefined {
  const anchors = graph.edges.flatMap((edge) => edge.to === childId && edge.type !== "spouse-at-opening" && edge.type !== "step-parent-of" ? positions.has(edge.from) ? [nodeCenter(positions.get(edge.from)!).x] : [] : []);
  return anchors.length ? anchors.reduce((total, value) => total + value, 0) / anchors.length : undefined;
}

function relativeDirection(from: NodePosition, to: NodePosition): Direction {
  const deltaX = to.x - from.x, deltaY = to.y - from.y;
  if (Math.abs(deltaX) > Math.abs(deltaY)) return deltaX >= 0 ? "right" : "left";
  return deltaY >= 0 ? "bottom" : "top";
}

function oppositeDirection(direction: Direction): Direction { return ({ top: "bottom", right: "left", bottom: "top", left: "right" } as const)[direction]; }
function nodeCenter(position: NodePosition) { return { x: position.x + NODE_WIDTH / 2, y: position.y + NODE_HEIGHT / 2 }; }
function draftPosition(anchor: NodePosition, direction: Direction): NodePosition {
  if (direction === "top") return { x: anchor.x + NODE_WIDTH / 2 - DRAFT_WIDTH / 2, y: anchor.y - 258 };
  if (direction === "bottom") return { x: anchor.x + NODE_WIDTH / 2 - DRAFT_WIDTH / 2, y: anchor.y + NODE_HEIGHT + 54 };
  if (direction === "left") return { x: anchor.x - DRAFT_WIDTH - 58, y: anchor.y - 32 };
  return { x: anchor.x + NODE_WIDTH + 58, y: anchor.y - 32 };
}
function spouseMidpoint(firstId: string, secondId: string, positions: Map<string, NodePosition>): NodePosition | undefined {
  const first = positions.get(firstId), second = positions.get(secondId);
  if (!first || !second) return undefined;
  const firstCenter = nodeCenter(first), secondCenter = nodeCenter(second);
  return { x: (firstCenter.x + secondCenter.x) / 2, y: (firstCenter.y + secondCenter.y) / 2 };
}
function jointChildDraftPosition(midpoint: NodePosition): NodePosition { return { x: midpoint.x - DRAFT_WIDTH / 2, y: midpoint.y + 76 }; }
function handlePosition(direction: Direction) { if (direction === "top") return "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"; if (direction === "bottom") return "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"; if (direction === "left") return "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"; return "right-0 top-1/2 translate-x-1/2 -translate-y-1/2"; }
function directionLabel(direction: Direction) { return ({ top: "phía trên", right: "bên phải", bottom: "phía dưới", left: "bên trái" } as const)[direction]; }
function edgeTypes(): FamilyEdgeType[] { return ["biological-parent-of", "adoptive-parent-of", "spouse-at-opening"]; }
function edgeShortLabel(type: FamilyEdgeType) { return ({ "biological-parent-of": "đẻ", "adoptive-parent-of": "nuôi", "step-parent-of": "kế", "spouse-at-opening": "vợ/chồng" } as const)[type]; }
function GraphLegend() { return <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">{edgeTypes().map((type) => { const visual = edgeVisual(type); return <span key={type} className="inline-flex items-center gap-1.5"><span className={cn("block w-6 border-t-2", visual.border, type === "adoptive-parent-of" || type === "step-parent-of" ? "border-dashed" : "")} />{edgeShortLabel(type)}</span>; })}</div>; }
function edgeVisual(type: FamilyEdgeType) { if (type === "biological-parent-of") return { stroke: "stroke-blue-600", fill: "fill-blue-600", border: "border-blue-600", text: "text-blue-700", dash: "" }; if (type === "adoptive-parent-of") return { stroke: "stroke-violet-600", fill: "fill-violet-600", border: "border-violet-600", text: "text-violet-700", dash: "7 5" }; if (type === "step-parent-of") return { stroke: "stroke-amber-600", fill: "fill-amber-600", border: "border-amber-600", text: "text-amber-700", dash: "3 5" }; return { stroke: "stroke-rose-600", fill: "fill-rose-600", border: "border-rose-600", text: "text-rose-700", dash: "" }; }
function personStatus(person: FamilyPerson, deceasedId: string) { if (person.id === deceasedId) return "Người để lại di sản"; if (person.life === "dead-before-or-same") return "Đã chết trước/cùng lúc"; if (person.life === "alive") return "Còn sống"; return "Chưa rõ trạng thái"; }
function levelOrder(level: number | "unconnected") { return level === "unconnected" ? 999 : level; }
