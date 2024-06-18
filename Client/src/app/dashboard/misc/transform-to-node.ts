import { NodeModel } from "../models/node.model";

/**
 * Creates new Node model with given name parameter
 *  
 */
export function toNode(name: string): NodeModel {
  return new NodeModel(name);
}