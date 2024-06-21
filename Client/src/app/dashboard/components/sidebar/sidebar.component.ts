import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Observable, Subscription } from 'rxjs';
import { ConnectionModel } from '../../../shared/models/connection.model';
import { toTreeNodes } from '../../misc/transform-vhosts-to-treenodes';
import { MessageModel } from '../../models/message.model';
import { NodeModel } from '../../models/node.model';
import { QueueModel } from '../../models/queue.model';
import { VhostModel } from '../../models/vhost.model';

interface FlatNode {
  expandable: boolean;
  name: string;
  parent: string;
  level: number;
  children_count: number;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnChanges {
  @Input() vhosts: VhostModel[] = [];
  @Input() messages: MessageModel[] = [];
  @Input() incomingQueue!: QueueModel;
  @Output() currentQueueChange = new EventEmitter<QueueModel>();
  @Output() moveMessagesEvent: EventEmitter<QueueModel> = new EventEmitter<QueueModel>();
  @Output() selectedConnectionChange = new EventEmitter<ConnectionModel>();
  lastActiveNode?: NodeModel;
  activeNode?: NodeModel;
  expandedNodes: Set<string> = new Set<string>();
  dataFromSubscription = false;
  private subscription!: Subscription;
  filteredVhosts: VhostModel[] = [];
  showNoQueuesFoundMessage = false;

  onSelectedConnectionChange(value: ConnectionModel) {
    this.selectedConnectionChange.emit(value);
    this.lastActiveNode = this.activeNode;
    this.activeNode = undefined;
    this.expandedNodes.clear();
    const element = document.querySelector(`[data-node-name="${this.activeNode!.name}"]`);
    if (element) {
      element.classList.remove('selected-node');
    }
  }

  private _transformer = (node: NodeModel, level: number): FlatNode => {
    return {
      expandable: !!node.children && node.parent == "",
      name: node.name,
      parent: node.parent,
      level: level,
      children_count: node.children_count
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  ngOnChanges(changes: SimpleChanges): void {
    this.getVhosts();
    this.restoreSidebar();

    if (this.incomingQueue) {
      let newQueue = new NodeModel(this.incomingQueue.name);
      newQueue.parent = this.incomingQueue.vhostName;
      this.setCurrentQueue(newQueue);
      this.restoreSidebar();
    }
  }

  ngOnDestroy(): void {

    // Unsubscribe to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  getVhosts(): void {
    this.dataSource.data = toTreeNodes(this.vhosts);
  }

  onSearchChange(searchTerm: string): void {
    if (!searchTerm.trim()) {
      // If search term is empty, reset to show all vhosts and queues
      this.showNoQueuesFoundMessage = false;
      this.getVhosts();
      return;
    }
  
    // Find all queue nodes that contain the search term in their name
    const matchingQueueNodes = this.treeControl.dataNodes.filter(node =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) && node.level === 1
    );
  
    if (matchingQueueNodes.length > 0) {
      this.showNoQueuesFoundMessage = false;
      // Expand all parent vhost nodes that contain matching queues
      matchingQueueNodes.forEach(matchingQueueNode => {
        const parentNode = this.treeControl.dataNodes.find(node =>
          node.name === matchingQueueNode.parent && node.level === 0
        );
  
        if (parentNode) {
          // Expand the parent vhost node
          this.treeControl.expand(parentNode);
        }
      });
  
      // Create a new NodeModel instance for the first matching queue
      const newQueue = new NodeModel(matchingQueueNodes[0].name);
      newQueue.parent = matchingQueueNodes[0].parent;
      newQueue.children_count = matchingQueueNodes[0].children_count;
  
      // Set the current queue
      this.setCurrentQueue(newQueue);
    } else {
      this.showNoQueuesFoundMessage = true;
      this.treeControl.collapseAll();
    }
  }

  setCurrentQueue(newQueue: NodeModel) {
    // Done do anything if the new queue is the same as the currently active queue
    if (this.activeNode && this.activeNode.name === newQueue.name && this.activeNode.parent === newQueue.parent) {
      return;
    }

    // Set the last active queue
    this.lastActiveNode = this.activeNode;

    // Change current queue
    this.activeNode = newQueue;
    this.currentQueueChange.emit({ vhostName: newQueue.parent, name: newQueue.name });
    
    if (this.lastActiveNode) {
      // Remove 'selected-node' class from last active queue
      const element = document.querySelector(`[data-node-name="${this.lastActiveNode.name}"]`);
      if (element) {
        element.classList.remove('selected-node');
      }
    }

    // Add 'selected-node' class to the new active queue
    const newElement = document.querySelector(`[data-node-name="${newQueue.name}"]`);
    if (newElement) {
      newElement.classList.add('selected-node');
    }
  }

  nodeToggled(node: FlatNode): void {
    if (this.treeControl.isExpanded(node)) {
      this.expandedNodes.add(node.name);
    } else {
      this.expandedNodes.delete(node.name);
    }
  }

  restoreSidebar(): void {
    this.dataSource.data.forEach(node => {
      const flatNode = this.treeControl.dataNodes.find(n => n.name == node.name);
      if (this.expandedNodes.has(flatNode!.name)) {
        this.treeControl.expand(flatNode!);
      }
    });

    if (this.activeNode) {
      // Add 'selected-node' class to the last selected queue
      const selectedElement = document.querySelector(`[data-node-name="${this.activeNode!.name}"]`);
      if (selectedElement) {
        selectedElement.classList.add('selected-node');
      }
    }
  }

  onDragEnter(event: DragEvent): void {
    if (event.target instanceof Element) {
      event.target.classList.add('droppable');
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent): void {
    if (event.target instanceof Element) {
      event.target.classList.remove('droppable');
    }
  }

  onDrop(event: DragEvent, selectedQueue: FlatNode): void {
    if (event.target instanceof Element) {
      event.target.classList.remove('droppable');

      this.moveMessagesEvent.emit(
        {
          name: selectedQueue.name,
          vhostName: selectedQueue.parent
        }
      );
    }
  }
}
