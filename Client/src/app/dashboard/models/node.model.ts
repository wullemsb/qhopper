export class NodeModel {
    name: string = "";
    parent: string = "";
    children: NodeModel[] = [];
    children_count: number = 0;

    constructor(name: string) {
        this.name = name;
    }
}

