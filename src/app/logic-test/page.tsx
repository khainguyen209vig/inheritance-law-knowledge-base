import { LogicTestWorkspace } from "@/components/logic-test/logic-test-workspace";
import { guidedTopics } from "@/domain/guided-conversation";

export default function LogicTestPage() {
  const topics = Object.values(guidedTopics).map(({ id, question, description }) => ({ id, question, description }));
  return <LogicTestWorkspace topics={topics} />;
}
