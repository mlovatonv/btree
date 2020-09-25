class btree {
  private order: number;
  private mid: number;
  private root: btreenode;

  /* Used for delete operation */
  private tempNode: btreenode | null;
  private tempIndex: number | null;

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
      if (!node.children[i]) continue;
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
      if (rootNode.children[i]) leftNode.children.push(rootNode.children[i]);
    }

    /* Handle middle key and child  */
    const rootKey: number = rootNode.keys[i];
    leftNode.children.push(rootNode.children[i]);
    ++i;

    /* Fill right node */
    for (; i < this.order; ++i) {
      rightNode.keys.push(rootNode.keys[i]);
      if (rootNode.children[i]) rightNode.children.push(rootNode.children[i]);
    }
    if (rootNode.children[i]) rightNode.children.push(rootNode.children[i]);

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
      if (leftNode.children[i]) rightNode.children[j] = leftNode.children[i];
      ++j;
    }
    if (leftNode.children[i]) rightNode.children[j] = leftNode.children[i];

    /* Update parent node */
    parentNode.keys.splice(pos, 0, leftNode.keys[this.mid]);
    parentNode.children[pos] = leftNode;
    parentNode.children.splice(pos + 1, 0, rightNode);

    /* Clear left node */
    leftNode.keys.length = this.mid;
    if (leftNode.children.length) leftNode.children.length = this.mid + 1;
  };

  public delete = (key: number): void => {
    this.tempNode = null;
    this.tempIndex = null;
    this._delete(this.root, key);
  };

  private _delete = (node: btreenode, key: number): boolean => {
    let pos: number = 0;

    /* Find a position where the key is smaller than other */
    while (pos < node.keys.length && node.keys[pos] < key) ++pos;

    const nodeKey: number = node.keys[pos];
    const nodeChild: btreenode = node.children[pos];

    /* Node is a leaf */
    if (!node.children[0]) {
      if (this.tempNode == null && nodeKey != key) return false;
      if (this.tempNode != null) {
        this.tempNode[this.tempIndex] = node.keys[pos];
      }
      node.keys.splice(pos, 1);
      return true;
    }

    /* Node is not a leaf */
    if (nodeKey == key) {
      this.tempNode = node;
      this.tempIndex = pos;
    }
    if (!this._delete(nodeChild, key)) return false;

    /* Rotate and merge depending on the nodes at the left and
     * right of the child node */
    if (nodeChild.keys.length < this.mid) {
      const nodeLeft = node.children[pos - 1];
      const nodeRight = node.children[pos + 1];
      if (nodeLeft && nodeLeft.keys.length > this.mid) {
        this.rotate(
          node,
          nodeChild,
          nodeLeft,
          pos - 1,
          nodeLeft.keys.length - 1,
          0,
          0,
          1
        );
      } else if (nodeRight && nodeRight.keys.length > this.mid) {
        this.rotate(
          node,
          nodeChild,
          nodeRight,
          pos,
          0,
          nodeChild.keys.length,
          1,
          0
        );
      } else {
        if (nodeLeft) {
          this.merge(
            node,
            nodeLeft,
            nodeChild,
            pos - 1,
            nodeLeft.keys.length,
            1
          );
        } else {
          this.merge(node, nodeRight, nodeChild, pos, 0, 0);
        }
        node.children.splice(pos, 1);
        if (
          node == this.root &&
          this.root.keys.length == 0 &&
          this.root.children[0]
        ) {
          this.root = this.root.children[0];
        }
      }
    }

    return true;
  };

  private rotate = (
    parentNode: btreenode,
    leftNode: btreenode,
    rightNode: btreenode,
    i1: number,
    i2: number,
    i3: number,
    i4: number,
    i5: number
  ) => {
    leftNode.keys.splice(i3, 0, parentNode.keys[i1]);
    parentNode.keys[i1] = rightNode.keys[i2];
    rightNode.keys.splice(i2, 1);
    if (!leftNode.children[0]) {
      leftNode.children.splice(i3 + i4, 0, rightNode[i2 + i5]);
      rightNode.children.splice(i2 + i5, 1);
    }
  };

  private merge = (
    parentNode: btreenode,
    leftNode: btreenode,
    rightNode: btreenode,
    i1: number,
    i2: number,
    i3: number
  ) => {
    leftNode.keys.splice(i2, 0, parentNode.keys[i1]);
    parentNode.keys.splice(i1, 1);
    leftNode.keys.concat(rightNode.keys);
    if (!leftNode.children[0]) {
      leftNode.children.concat(rightNode.children);
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
