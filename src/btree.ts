class btree {
  private order: number;
  private mid: number;
  private root: btreenode;

  constructor(order: number) {
    this.order = order;
    this.mid = Math.floor(this.order / 2);
    this.root = new btreenode();
  }

  public toJson = (): object => {
    const json: { name: string; children: Array<any> } = {
      name: "",
      children: [],
    };
    this.jsonify(json, this.root);
    return json;
  };

  private jsonify = (
    json: { name: string; children: Array<any> },
    node: btreenode
  ): void => {
    json.name = node.keys.join();
    for (let i: number = 0; i < node.children.length; ++i) {
      if (!node.children[i]) break;
      json.children.push({ name: "", children: [] });
      this.jsonify(json.children[i], node.children[i]);
    }
  };

  public insert = (key: number): void => {
    const overflow: boolean = this._insert(this.root, key);
    if (overflow) this.splitRoot(this.root, key);
  };

  /* Return true in case of overflow */
  private _insert = (node: btreenode, key: number): boolean => {
    let pos: number = 0;

    /* Find a position where the key is smaller than other */
    while (pos < node.keys.length && node.keys[pos] < key) ++pos;

    const childNode: btreenode = node.children[pos];
    if (childNode) {
      const overflow: boolean = this._insert(childNode, key);
      if (overflow) this.splitNonRoot(node, pos);
    } else {
      node.keys.splice(pos, 0, key);
    }
    return node.keys.length === this.order;
  };

  /* Split root node */
  private splitRoot = (rootNode: btreenode, pos: number): void => {
    const leftNode: btreenode = new btreenode();
    const rightNode: btreenode = new btreenode();
    let i: number = 0;

    /* Fill left node */
    for (; i < this.mid; ++i) {
      leftNode.keys.push(rootNode.keys[i]);
      leftNode.children.push(rootNode.children[i]);
    }

    /* Handle middle key and child  */
    const rootKey: number = rootNode.keys[i];
    leftNode.children.push(rootNode.children[i]);
    ++i;

    /* Fill right node */
    for (; i < this.order - 1; ++i) {
      rightNode.keys.push(rootNode.keys[i]);
      rightNode.children.push(rootNode.children[i]);
    }
    rightNode.keys.push(rootNode.keys[i]);

    /* Clear root node */
    rootNode.keys.length = 0;
    rootNode.children.length = 0;
    rootNode.keys[0] = rootKey;
    rootNode.children[0] = leftNode;
    rootNode.children[1] = rightNode;
  };

  /* Split non-root node */
  private splitNonRoot = (parentNode: btreenode, pos: number): void => {
    const leftNode: btreenode = parentNode.children[pos];
    const rightNode: btreenode = new btreenode();
    let i: number = this.mid + 1;
    let j: number = 0;

    /* Fill right node */
    for (; i < this.order; ++i) {
      rightNode.keys[j] = leftNode.keys[i];
      rightNode.children[j] = leftNode.children[i];
      ++j;
    }
    rightNode.children[j] = leftNode.children[i];

    /* Update parent node */
    parentNode.keys.splice(pos, 0, leftNode.keys[this.mid]);
    parentNode.children[pos] = leftNode;
    parentNode.children.splice(pos + 1, 0, rightNode);

    /* Clear left node */
    leftNode.keys.length = this.mid;
    leftNode.children.length = this.mid + 1;
  };

  public delete = (key: number) => {};

  private merge = (node: btreenode, pos: number): void => {};

  public find = (key: number): boolean => {
    return this._find(this.root, key);
  };

  private _find = (node: btreenode, key: number): boolean => {
    let pos: number = 0;

    /* Find a position where the key is smaller than other */
    while (pos < node.keys.length && node.keys[pos] <= key) ++pos;

    const childNode: btreenode = node.children[pos];
    if (childNode) {
      return this._find(childNode, key);
    } else {
      return node.keys[pos] === key && node.children[pos] !== undefined;
    }
  };
}
