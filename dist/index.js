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
        if (!node.children[i]) break;
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
        leftNode.children.push(rootNode.children[i]);
      }
      const rootKey = rootNode.keys[i];
      leftNode.children.push(rootNode.children[i]);
      ++i;
      for (; i < this.order; ++i) {
        rightNode.keys.push(rootNode.keys[i]);
        rightNode.children.push(rootNode.children[i]);
      }
      rightNode.children.push(rootNode.children[i]);
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
        rightNode.children[j] = leftNode.children[i];
        ++j;
      }
      rightNode.children[j] = leftNode.children[i];
      parentNode.keys.splice(pos, 0, leftNode.keys[this.mid]);
      parentNode.children[pos] = leftNode;
      parentNode.children.splice(pos + 1, 0, rightNode);
      leftNode.keys.length = this.mid;
      leftNode.children.length = this.mid + 1;
    };
    this.delete = (key) => {
      const underflow = this._delete(this.root, key);
      if (underflow) this.mergeRoot(this.root, key);
    };
    this._delete = (node, key) => {
      let pos = 0;
      while (pos < node.keys.length && node.keys[pos] < key) ++pos;
      const leftNode = node.children[pos];
      const rightNode = node.children[pos + 1];
      if (node.keys[pos] == key) {
        if (!leftNode && !rightNode) {
          node.keys.splice(pos, 1);
        } else if (leftNode.children.length > this.mid) {
        } else if (rightNode.children.length > this.mid) {
        }
      } else {
        const underflow = this._delete(leftNode, key);
        if (underflow) this.mergeNonRoot(node, pos);
      }
      return node.keys.length < this.mid;
    };
    this.mergeRoot = (node, pos) => {};
    this.mergeNonRoot = (node, pos) => {};
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
