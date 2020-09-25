class btree {
  constructor(order) {
    this.toJson = () => {
      const json = {
        name: "",
        children: [],
      };
      this.jsonify(json, this.root);
      return json;
    };
    this.jsonify = (json, node) => {
      json.name = node.keys.join();
      for (let i = 0; i < node.children.length; ++i) {
        if (!node.children[i]) continue;
        json.children.push({ name: "", children: [] });
        this.jsonify(json.children[i], node.children[i]);
      }
    };
    this.insert = (key) => {
      const overflow = this._insert(this.root, key);
      if (overflow) this.splitRoot(this.root, key);
    };
    this._insert = (node, key) => {
      let pos = 0;
      while (pos < node.keys.length && node.keys[pos] < key) ++pos;
      const childNode = node.children[pos];
      if (childNode) {
        const overflow = this._insert(childNode, key);
        if (overflow) this.splitNonRoot(node, pos);
      } else {
        node.keys.splice(pos, 0, key);
      }
      return node.keys.length === this.order;
    };
    this.splitRoot = (rootNode, pos) => {
      const leftNode = new btreenode();
      const rightNode = new btreenode();
      let i = 0;
      for (; i < this.mid; ++i) {
        leftNode.keys.push(rootNode.keys[i]);
        if (rootNode.children[i]) leftNode.children.push(rootNode.children[i]);
      }
      const rootKey = rootNode.keys[i];
      leftNode.children.push(rootNode.children[i]);
      ++i;
      for (; i < this.order; ++i) {
        rightNode.keys.push(rootNode.keys[i]);
        if (rootNode.children[i]) rightNode.children.push(rootNode.children[i]);
      }
      if (rootNode.children[i]) rightNode.children.push(rootNode.children[i]);
      rootNode.keys.length = 0;
      rootNode.children.length = 0;
      rootNode.keys[0] = rootKey;
      rootNode.children[0] = leftNode;
      rootNode.children[1] = rightNode;
    };
    this.splitNonRoot = (parentNode, pos) => {
      const leftNode = parentNode.children[pos];
      const rightNode = new btreenode();
      let i = this.mid + 1;
      let j = 0;
      for (; i < this.order; ++i) {
        rightNode.keys[j] = leftNode.keys[i];
        if (leftNode.children[i]) rightNode.children[j] = leftNode.children[i];
        ++j;
      }
      if (leftNode.children[i]) rightNode.children[j] = leftNode.children[i];
      parentNode.keys.splice(pos, 0, leftNode.keys[this.mid]);
      parentNode.children[pos] = leftNode;
      parentNode.children.splice(pos + 1, 0, rightNode);
      leftNode.keys.length = this.mid;
      if (leftNode.children.length) leftNode.children.length = this.mid + 1;
    };
    this.delete = (key) => {
      this.tempNode = null;
      this.tempIndex = null;
      this._delete(this.root, key);
    };
    this._delete = (node, key) => {
      let pos = 0;
      while (pos < node.keys.length && node.keys[pos] < key) ++pos;
      const nodeKey = node.keys[pos];
      const nodeChild = node.children[pos];
      if (!node.children[0]) {
        if (this.tempNode == null && nodeKey != key) return false;
        if (this.tempNode != null) {
          this.tempNode[this.tempIndex] = node.keys[pos];
        }
        node.keys.splice(pos, 1);
        return true;
      }
      if (nodeKey == key) {
        this.tempNode = node;
        this.tempIndex = pos;
      }
      if (!this._delete(nodeChild, key)) return false;
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
    this.rotate = (parentNode, leftNode, rightNode, i1, i2, i3, i4, i5) => {
      leftNode.keys.splice(i3, 0, parentNode.keys[i1]);
      parentNode.keys[i1] = rightNode.keys[i2];
      rightNode.keys.splice(i2, 1);
      if (!leftNode.children[0]) {
        leftNode.children.splice(i3 + i4, 0, rightNode[i2 + i5]);
        rightNode.children.splice(i2 + i5, 1);
      }
    };
    this.merge = (parentNode, leftNode, rightNode, i1, i2, i3) => {
      leftNode.keys.splice(i2, 0, parentNode.keys[i1]);
      parentNode.keys.splice(i1, 1);
      leftNode.keys.concat(rightNode.keys);
      if (!leftNode.children[0]) {
        leftNode.children.concat(rightNode.children);
      }
    };
    this.find = (key) => {
      return this._find(this.root, key);
    };
    this._find = (node, key) => {
      let pos = 0;
      while (pos < node.keys.length && node.keys[pos] < key) ++pos;
      const childNode = node.children[pos];
      if (childNode) {
        return this._find(childNode, key);
      } else {
        return node.keys[pos] === key ? node : null;
      }
    };
    this.order = order;
    this.mid = Math.floor(this.order / 2);
    this.root = new btreenode();
  }
}
class btreenode {
  constructor() {
    this.keys = [];
    this.children = [];
  }
}
