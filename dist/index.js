class btree {
    constructor(b) {
        this.insert = (key) => {
            const overflow = this._insert(this.root, key);
            if (overflow)
                this.splitRoot(this.root, key);
        };
        this.splitRoot = (node, pos) => {
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
        this._insert = (node, key) => {
            let pos = 0;
            let overflow = false;
            while (pos < node.keys.length && node.keys[pos] < key)
                ++pos;
            if (node.children[pos]) {
                overflow = this._insert(node.children[pos], key);
                if (overflow)
                    this.split(node, pos);
            }
            else {
                node.keys.splice(pos, 0, key);
                overflow = node.keys.length > this.b;
            }
            return overflow;
        };
        this.split = (node, pos) => {
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
        this.delete = (key) => { };
        this.find = (key) => {
            return this._find(this.root, key);
        };
        this._find = (node, key) => {
            let pos = 0;
            while (pos < node.keys.length && node.keys[pos] <= key)
                ++pos;
            if (node.children[pos]) {
                return this._find(node, key);
            }
            else {
                return node.keys[pos] === key && node.children[pos] !== undefined;
            }
        };
        this.b = b;
        this.root = new btreenode();
    }
}
class btreenode {
    constructor() {
        this.keys = [];
        this.children = [];
    }
}
let tree = new btree(3);
tree.insert(1);
tree.insert(2);
tree.insert(3);
