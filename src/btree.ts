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
    for (; i < this.order; ++i) {
      rightNode.keys.push(rootNode.keys[i]);
      rightNode.children.push(rootNode.children[i]);
    }
    rightNode.children.push(rootNode.children[i]);

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

  public delete = (key: number): void => {
    const underflow: boolean = this._delete(this.root, key);
    if (underflow) this.mergeRoot(this.root, key);
  };

  private _delete = (node: btreenode, key: number): boolean => {
    let pos: number = 0;
    let childNode: btreenode;

    /* Find a position where the key is smaller than other */
    while (pos < node.keys.length && node.keys[pos] < key) ++pos;

    const leftNode: btreenode = node.children[pos];
    const rightNode: btreenode = node.children[pos + 1];
    let underflow: boolean = false;
    if (node.keys[pos] == key) {
      if (!leftNode) {
        /* Node is a leaf */
        node.keys.splice(pos, 1);
      } else {
        if (leftNode.children.length > this.mid) {
          /* Left node has at least mid + 1 keys */
          key = leftNode.keys[leftNode.keys.length - 1];
          node.keys[pos] = key;
          underflow = this._delete(leftNode, key);
        } else if (rightNode.children.length > this.mid) {
          /* Right node has at least mid + 1 keys */
          key = rightNode.keys[rightNode.keys.length - 1];
          node.keys[pos] = key;
          underflow = this._delete(rightNode, key);
        } else {
          /* Left and right node have mid keys */
          node.keys.splice(pos, 1);
          leftNode.keys.push(key);
          leftNode.keys.concat(rightNode.keys);
          leftNode.children.concat(leftNode.children);
          node.children.splice(pos + 1, 1);
          underflow = this._delete(leftNode, key);
        }
      }
    } else if (leftNode) {
      underflow = this._delete(leftNode, key);
    }
    if (underflow) this.mergeNonRoot(node, pos);
    return node.keys.length < this.mid;
  };

  private mergeRoot = (node: btreenode, pos: number): void => {};

  private mergeNonRoot = (node: btreenode, pos: number): void => {
    const leftNode: btreenode = node.children[pos];
    const rightNode: btreenode = node.children[pos + 1];
    const nodeKey: number = node.keys[pos];
    /* Right node has at least mid + 1 keys */
    if (rightNode && rightNode.keys.length > this.mid) {
      leftNode.keys.push(nodeKey);
      node.keys[pos] = rightNode.keys[0];
      rightNode.keys.splice(0, 1);
    } else {
      leftNode.keys.push(nodeKey);
      leftNode.keys.concat(rightNode.keys);
      node.keys.splice(pos, 1);
      node.children.splice(pos + 1, 1);
    }
  };

  public find = (key: number): btreenode | null => {
    return this._find(this.root, key);
  };

  private _find = (node: btreenode, key: number): btreenode | null => {
    let pos: number = 0;

    /* Find a position where the key is smaller than other */
    while (pos < node.keys.length && node.keys[pos] < key) ++pos;

    const childNode: btreenode = node.children[pos];
    if (childNode) {
      return this._find(childNode, key);
    } else {
      return node.keys[pos] === key ? node : null;
    }
  };
}
