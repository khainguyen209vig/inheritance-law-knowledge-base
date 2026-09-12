"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { edgeLabel, graphDiagnostics, graphLevels, type FamilyEdgeType, type FamilyGraph, type FamilyPerson } from "@/modules/family-graph/model";

const edgeTypes: Array<{ type: FamilyEdgeType; label: string; help: string }> = [
  { type: "biological-parent-of", label: "Cha/mẹ đẻ → con", help: "Người thứ nhất là cha/mẹ đẻ của người thứ hai" },
  { type: "adoptive-parent-of", label: "Cha/mẹ nuôi → con", help: "Người thứ nhất là cha/mẹ nuôi của người thứ hai" },
  { type: "spouse-at-opening", label: "Vợ/chồng", help: "Hai người là vợ/chồng tại thời điểm mở thừa kế" },
];

export function FamilyGraphEditor({ graph, selectedId, onSelect, onChange }: { graph: FamilyGraph; selectedId?: string; onSelect: (id: string) => void; onChange: (graph: FamilyGraph) => void }) {
  const [sourceId, setSourceId] = useState<string>();
  const [targetId, setTargetId] = useState<string>();
  const [edgeType, setEdgeType] = useState<FamilyEdgeType>("biological-parent-of");
  const peopleById = useMemo(() => new Map(graph.people.map((person) => [person.id, person])), [graph.people]);
  const levels = useMemo(() => graphLevels(graph), [graph]);
  const diagnostics = useMemo(() => graphDiagnostics(graph), [graph]);
  const levelGroups = useMemo(() => {
    const groups = new Map<number | "unconnected", FamilyPerson[]>();
    for (const person of graph.people) { const level = levels.get(person.id); const key = level === undefined ? "unconnected" : level; groups.set(key, [...(groups.get(key) ?? []), person]); }
    return [...groups.entries()].sort(([left], [right]) => levelOrder(left) - levelOrder(right));
  }, [graph.people, levels]);

  function addEdge() {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const duplicate = graph.edges.some((edge) => edge.from === sourceId && edge.to === targetId && edge.type === edgeType);
    if (duplicate) return;
    onChange({ ...graph, edges: [...graph.edges, { id: `edge-${Date.now().toString(36)}`, from: sourceId, to: targetId, type: edgeType }] });
    setSourceId(undefined); setTargetId(undefined);
  }

  return <div className="space-y-4">
    <Card><CardHeader><div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle>Cây/graph quan hệ</CardTitle><CardDescription>Chọn node để sửa người. Hàng thừa kế không được nhập tại đây.</CardDescription></div><Badge variant="secondary">{graph.people.length} người · {graph.edges.length} cạnh</Badge></div></CardHeader><CardContent className="space-y-4"><div className="overflow-x-auto rounded-xl border bg-muted/20 p-4"><div className="flex min-w-[620px] flex-col gap-5">{levelGroups.map(([level, people]) => <div key={String(level)}><div className="mb-2 flex items-center gap-2"><span className="h-px flex-1 bg-border" /><span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{levelLabel(level)}</span><span className="h-px flex-1 bg-border" /></div><div className="flex flex-wrap justify-center gap-3">{people.map((person) => <button key={person.id} type="button" onClick={() => onSelect(person.id)} className={cn("min-w-36 rounded-xl border bg-card p-3 text-left shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring", selectedId === person.id && "border-primary ring-1 ring-primary", person.id === graph.deceasedId && "border-amber-400 bg-amber-50")}><span className="block text-xs text-muted-foreground">{person.id === graph.deceasedId ? "Người để lại di sản" : person.life === "dead-before-or-same" ? "Đã chết trước/cùng lúc" : person.life === "alive" ? "Còn sống" : "Chưa rõ trạng thái"}</span><span className="mt-1 block font-semibold">{person.name}</span><span className="mt-1 block font-mono text-[9px] text-muted-foreground">{person.id}</span></button>)}</div></div>)}</div></div>{diagnostics.length ? <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{diagnostics.map((item) => <p key={item}>• {item}</p>)}</div> : <p className="text-xs text-emerald-700">Graph không có cạnh trùng, cạnh tự nối hoặc chu trình cha/mẹ–con.</p>}</CardContent></Card>
    <Card><CardHeader><CardTitle>Nối hai người</CardTitle><CardDescription>Ba bước tạo trực tiếp một fact quan hệ. Mũi tên của quan hệ cha/mẹ luôn đi từ cha/mẹ tới con.</CardDescription></CardHeader><CardContent className="space-y-4"><GraphStep number="1" title="Chọn người thứ nhất"><PersonChoices people={graph.people} selected={sourceId} excluded={targetId} onSelect={setSourceId} /></GraphStep><GraphStep number="2" title="Chọn loại cạnh"><div className="grid gap-2 sm:grid-cols-3">{edgeTypes.map((item) => <button key={item.type} type="button" onClick={() => setEdgeType(item.type)} className={cn("rounded-lg border p-3 text-left text-sm", edgeType === item.type && "border-primary bg-primary/[0.06]")}><span className="font-medium">{item.label}</span><span className="mt-1 block text-[10px] text-muted-foreground">{item.help}</span></button>)}</div></GraphStep><GraphStep number="3" title="Chọn người thứ hai"><PersonChoices people={graph.people} selected={targetId} excluded={sourceId} onSelect={setTargetId} /></GraphStep><div className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">{sourceId && targetId ? edgePreview(edgeType, peopleById.get(sourceId), peopleById.get(targetId)) : "Chọn đủ hai người để xem fact sẽ tạo."}</p><Button disabled={!sourceId || !targetId} onClick={addEdge}>Thêm cạnh</Button></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Danh sách cạnh</CardTitle><CardDescription>Mỗi dòng tương ứng một asserted fact được gửi vào CLIPS.</CardDescription></CardHeader><CardContent className="space-y-2">{graph.edges.length ? graph.edges.map((edge) => <div key={edge.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"><div><p className="text-sm font-medium">{edgeLabel(edge, peopleById)}</p><code className="text-[10px] text-muted-foreground">{edge.type}({edge.from}, {edge.to})</code></div><Button variant="ghost" size="sm" onClick={() => onChange({ ...graph, edges: graph.edges.filter((item) => item.id !== edge.id) })}>Xóa cạnh</Button></div>) : <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Chưa có cạnh quan hệ.</p>}</CardContent></Card>
  </div>;
}

function GraphStep({ number, title, children }: { number: string; title: string; children: ReactNode }) { return <div><p className="mb-2 text-sm font-medium"><span className="mr-2 inline-grid size-6 place-items-center rounded-full bg-primary text-xs text-primary-foreground">{number}</span>{title}</p>{children}</div>; }
function PersonChoices({ people, selected, excluded, onSelect }: { people: FamilyPerson[]; selected?: string; excluded?: string; onSelect: (id: string) => void }) { return <div className="flex flex-wrap gap-2">{people.filter((person) => person.id !== excluded).map((person) => <Button key={person.id} type="button" variant={selected === person.id ? "secondary" : "outline"} size="sm" onClick={() => onSelect(person.id)}>{person.name}</Button>)}</div>; }
function edgePreview(type: FamilyEdgeType, from?: FamilyPerson, to?: FamilyPerson) { if (!from || !to) return ""; if (type === "spouse-at-opening") return `${from.name} — vợ/chồng — ${to.name}`; return `${from.name} — ${type === "biological-parent-of" ? "cha/mẹ đẻ của" : "cha/mẹ nuôi của"} → ${to.name}`; }
function levelLabel(level: number | "unconnected") { if (level === "unconnected") return "Chưa nối vào cây"; if (level === 0) return "Thế hệ người để lại di sản"; if (level < 0) return `Đời trên ${Math.abs(level)}`; return `Đời dưới ${level}`; }
function levelOrder(level: number | "unconnected") { return level === "unconnected" ? 999 : level; }
