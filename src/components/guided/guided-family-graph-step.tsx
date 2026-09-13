"use client";

import { useMemo, useReducer, useRef, useState } from "react";
import { FamilyGraphEditor, type JointChildKind, type RelatedPersonRole } from "@/components/family-graph/family-graph-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GuidedCaseState } from "@/domain/guided-conversation";
import { cn } from "@/lib/utils";
import {
  familyGraphPredicates,
  graphDiagnostics,
  restoreFamilyGraph,
  serializeFamilyGraph,
  soleExistingParentOfType,
  type FamilyGraph,
  type FamilyPerson,
} from "@/modules/family-graph/model";

interface GuidedFamilyGraphStepProps {
  state: GuidedCaseState;
  onStateChange: (state: GuidedCaseState) => void;
}

interface GraphHistory { past: FamilyGraph[]; present: FamilyGraph; future: FamilyGraph[] }
type GraphAction = { type: "commit"; graph: FamilyGraph } | { type: "undo" } | { type: "redo" };

export function GuidedFamilyGraphStep({ state, onStateChange }: GuidedFamilyGraphStepProps) {
  const restored = useMemo(() => restoreFamilyGraph(state.case.facts, `guided-${state.case.id}`), [state.case.facts, state.case.id]);
  const initialPersonIds = useRef(new Set(restored.people.map((person) => person.id)));
  const counter = useRef(restored.people.length + 1);
  const [history, dispatch] = useReducer(graphHistoryReducer, restored, (present): GraphHistory => ({ past: [], present, future: [] }));
  const graph = history.present;
  const [selectedId, setSelectedId] = useState(restored.deceasedId);
  const [searchComplete, setSearchComplete] = useState<boolean | undefined>(() => state.case.facts.find((fact) => fact.predicate === "heir-search-complete")?.value as boolean | undefined);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [pendingPhase, setPendingPhase] = useState<"saving" | "inferring" | "planning">();
  const isPending = pendingPhase !== undefined;
  const selectedPerson = graph.people.find((person) => person.id === selectedId) ?? graph.people[0];
  const diagnostics = useMemo(() => graphDiagnostics(graph), [graph]);

  function commit(next: FamilyGraph) {
    dispatch({ type: "commit", graph: next });
    setSearchComplete(undefined);
  }

  function createRelated(anchorId: string, name: string, role: RelatedPersonRole) {
    const person: FamilyPerson = { id: nextPersonId(state.case.id, counter.current++), name, eligibilityReviewed: false };
    const parentRole = role === "biological-parent" || role === "adoptive-parent";
    const edgeType = role === "biological-parent" || role === "biological-child" ? "biological-parent-of" as const
      : role === "adoptive-parent" || role === "adopted-child" ? "adoptive-parent-of" as const
        : "spouse-at-opening" as const;
    const edge = { id: `edge-${crypto.randomUUID()}`, from: parentRole ? person.id : anchorId, to: parentRole ? anchorId : person.id, type: edgeType };
    const existingParentId = role === "biological-parent"
      ? soleExistingParentOfType(graph, anchorId, "biological-parent-of")
      : role === "adoptive-parent" ? soleExistingParentOfType(graph, anchorId, "adoptive-parent-of") : undefined;
    const spouseEdge = existingParentId ? { id: `edge-${crypto.randomUUID()}`, from: existingParentId, to: person.id, type: "spouse-at-opening" as const } : undefined;
    commit({ ...graph, people: [...graph.people, person], edges: [...graph.edges, edge, ...(spouseEdge ? [spouseEdge] : [])] });
    setSelectedId(person.id);
  }

  function createJointChild(spouseEdgeId: string, name: string, kind: JointChildKind) {
    const spouseEdge = graph.edges.find((edge) => edge.id === spouseEdgeId && edge.type === "spouse-at-opening");
    if (!spouseEdge) return;
    const person: FamilyPerson = { id: nextPersonId(state.case.id, counter.current++), name, eligibilityReviewed: false };
    const type = kind === "biological" ? "biological-parent-of" as const : "adoptive-parent-of" as const;
    commit({ ...graph, people: [...graph.people, person], edges: [...graph.edges,
      { id: `edge-${crypto.randomUUID()}`, from: spouseEdge.from, to: person.id, type },
      { id: `edge-${crypto.randomUUID()}`, from: spouseEdge.to, to: person.id, type },
    ] });
    setSelectedId(person.id);
  }

  function updatePerson(update: Partial<FamilyPerson>) {
    if (!selectedPerson) return;
    commit({ ...graph, people: graph.people.map((person) => person.id === selectedPerson.id ? { ...person, ...update } : person) });
  }

  function undo() { dispatch({ type: "undo" }); setSelectedId(graph.deceasedId); setSearchComplete(undefined); }
  function redo() { dispatch({ type: "redo" }); setSelectedId(graph.deceasedId); setSearchComplete(undefined); }

  async function saveAndContinue() {
    setError(undefined);
    setNotice(undefined);
    setPendingPhase("saving");
    try {
      const ownedIds = new Set([...initialPersonIds.current, ...graph.people.map((person) => person.id)]);
      const retained = state.case.facts.filter((fact) => !familyGraphPredicates.has(fact.predicate)
        && !(ownedIds.has(fact.subject ?? "") && fact.predicate === "eligibility-candidate"));
      await requestJson(`/api/cases/${state.case.id}/facts`, { method: "PUT", body: JSON.stringify({ subject: state.case.id, facts: [...retained, ...serializeFamilyGraph(state.case.id, graph, searchComplete)] }) });
      setPendingPhase("inferring");
      setPendingPhase("planning");
      const nextState = await requestJson<GuidedCaseState>(`/api/cases/${state.case.id}/guided/inference`, { method: "POST", body: "{}" });
      initialPersonIds.current = new Set(graph.people.map((person) => person.id));
      if (nextState.next?.resolution?.kind === "interaction" && nextState.next.resolution.interaction === "family-tree") {
        const unresolvedId = nextState.next.requirement.subject;
        const unresolvedName = graph.people.find((person) => person.id === unresolvedId)?.name ?? unresolvedId;
        setSelectedId(unresolvedId);
        setNotice(nextState.next.requirement.predicate === "relationship-at-opening"
          ? `Đã lưu và chạy suy luận. CLIPS chưa xác định được quan hệ thuộc hàng thừa kế của ${unresolvedName}. Hãy kiểm tra lại các cạnh nối người này với người để lại di sản.`
          : `Đã lưu và chạy suy luận, nhưng vẫn cần bổ sung dữ kiện cho ${unresolvedName}.`);
      }
      onStateChange(nextState);
    } catch (cause) {
      setError(cause instanceof DOMException && cause.name === "TimeoutError" ? "Yêu cầu quá thời gian 20 giây. Dữ kiện có thể đã được lưu; hãy thử tải lại hồ sơ trước khi gửi lại." : cause instanceof Error ? cause.message : "Không thể lưu cây gia đình.");
    } finally {
      setPendingPhase(undefined);
    }
  }

  return <div className="space-y-4">
    <FamilyGraphEditor graph={graph} selectedId={selectedPerson?.id} onSelect={setSelectedId} onChange={commit} onCreateRelated={createRelated} onCreateJointChild={createJointChild} onRenamePerson={(id, name) => commit({ ...graph, people: graph.people.map((person) => person.id === id ? { ...person, name } : person) })} onDeletePerson={(id) => { commit({ ...graph, people: graph.people.filter((person) => person.id !== id), edges: graph.edges.filter((edge) => edge.from !== id && edge.to !== id) }); setSelectedId(graph.deceasedId); }} onUndo={undo} onRedo={redo} canUndo={history.past.length > 0} canRedo={history.future.length > 0} />
    {selectedPerson?.id !== graph.deceasedId ? <Card><CardHeader><CardTitle className="text-lg">Tình trạng của {selectedPerson?.name}</CardTitle><CardDescription>Tại thời điểm mở thừa kế, người này còn sống hay đã chết trước/cùng thời điểm?</CardDescription></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2"><Choice selected={selectedPerson?.life === "alive"} onClick={() => updatePerson({ life: "alive" })}>Còn sống</Choice><Choice selected={selectedPerson?.life === "dead-before-or-same"} onClick={() => updatePerson({ life: "dead-before-or-same" })}>Đã chết trước/cùng thời điểm</Choice></CardContent></Card> : null}
    <Card><CardHeader><CardTitle className="text-lg">Đã nhập đủ người liên quan chưa?</CardTitle><CardDescription>Bạn vẫn có thể quay lại sửa cây sau. Chọn “chưa đủ” nếu còn người cần bổ sung.</CardDescription></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2"><Choice selected={searchComplete === true} onClick={() => setSearchComplete(true)}>Đã nhập đủ</Choice><Choice selected={searchComplete === false} onClick={() => setSearchComplete(false)}>Chưa nhập đủ</Choice></CardContent></Card>
    {diagnostics.length ? <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{diagnostics.join(" ")}</div> : null}
    {notice ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{notice}</div> : null}
    {error ? <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}
    <div className="flex justify-end"><Button disabled={isPending || graph.people.length < 2 || diagnostics.length > 0 || searchComplete === undefined} onClick={saveAndContinue}>{pendingPhase === "saving" ? "Đang lưu cây…" : pendingPhase === "inferring" ? "CLIPS đang suy luận…" : pendingPhase === "planning" ? "Đang chọn bước tiếp theo…" : "Lưu cây và tiếp tục"}</Button></div>
  </div>;
}

function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("rounded-lg border p-3 text-left text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring", selected && "border-primary bg-primary/[0.06]")}>{children}</button>;
}

function nextPersonId(caseId: string, counter: number) { return `person-${caseId.slice(0, 30)}-${counter}`; }

function graphHistoryReducer(state: GraphHistory, action: GraphAction): GraphHistory {
  if (action.type === "commit") return { past: [...state.past, state.present].slice(-50), present: action.graph, future: [] };
  if (action.type === "undo") { const previous = state.past.at(-1); return previous ? { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] } : state; }
  const next = state.future[0];
  return next ? { past: [...state.past, state.present].slice(-50), present: next, future: state.future.slice(1) } : state;
}

async function requestJson<T = unknown>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, signal: init.signal ?? AbortSignal.timeout(20_000), headers: { "content-type": "application/json", ...init.headers } });
  const data = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? `Request thất bại (${response.status}).`);
  return data;
}
