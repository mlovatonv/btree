class btree {
  private b: number;
  private root: btreenode;

  constructor(b: number) {
    this.b = b;
    this.root = new btreenode();
  }

  public insert = (key: number): void => {
    const overflow: boolean = this._insert(this.root, key);
    if (overflow) this.splitRoot(this.root, key);
  };

  private splitRoot = (node: btreenode, pos: number): void => {
    const leftNode = new btreenode();
    const rightNode = new btreenode();
    const mid = this.b / 2;
    const rootKey = node.keys[mid];
    let i = 0;

    for (; i < mid; ++i) {
      leftNode.keys.push(node.keys[i]);
      leftNode.children.push(node.children[i]);
    }

    for (; i < this.b; ++i) {
      leftNode.keys.push(node.keys[i]);
      leftNode.children.push(node.children[i]);
    }

    node.keys[0] = rootKey;
    node.children[0] = leftNode;
    node.children[1] = rightNode;
  };

  private _insert = (node: btreenode, key: number): boolean => {
    let pos: number = 0;
    let overflow: boolean = false;
    while (pos < node.keys.length && node.keys[pos] < key) ++pos;
    if (node.children[pos]) {
      overflow = this._insert(node.children[pos], key);
      if (overflow) this.split(node, pos);
    } else {
      node.keys.splice(pos, 0, key);
      overflow = node.keys.length > this.b;
    }
    return overflow;
  };

  private split = (node: btreenode, pos: number): void => {
    const leftNode = node.children[pos];
    const rightNode = new btreenode();
    const mid = this.b / 2;
    let i = mid + 1;
    for (; i < this.b; ++i) {
      rightNode.keys.push(leftNode.keys[i]);
      rightNode.children.push(leftNode.children[i]);
      leftNode.keys.splice(i, 1);
      leftNode.children.splice(i, 1);
    }

    rightNode.children.push(leftNode.children[i]);
    leftNode.children.splice(i, 1);

    node.keys.splice(pos, 0, leftNode.keys[mid]);
    node.children.splice(pos, 0, leftNode);
    node.children.splice(pos + 1, 0, rightNode);
    leftNode.keys.splice(mid, 1);
  };

  public delete = (key: number) => {};

  public find = (key: number): boolean => {
    return this._find(this.root, key);
  };

  private _find = (node: btreenode, key: number): boolean => {
    let pos: number = 0;
    while (pos < node.keys.length && node.keys[pos] <= key) ++pos;
    if (node.children[pos]) {
      return this._find(node, key);
    } else {
      return node.keys[pos] === key && node.children[pos] !== undefined;
    }
  };
}
