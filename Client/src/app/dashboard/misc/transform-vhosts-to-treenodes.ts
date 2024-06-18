import { NodeModel } from "../models/node.model";
import { VhostModel } from "../models/vhost.model";
import { toNode } from "./transform-to-node";

export function toTreeNodes(vhosts: VhostModel[]): NodeModel[] {
  var result: NodeModel[] = [];

  for (var i = 0; i < vhosts.length; i++) {
    var vhostNode = toNode(vhosts[i].name);
    if (vhosts[i].queues) {
      vhosts[i].queues.forEach(q => {
        var queue = toNode(q.name);
        queue.parent = vhosts[i].name;
        queue.children_count = q.messages!;
        vhostNode.children.push(queue);
      });
    }
    result.push(vhostNode);
  }
  return result;
}