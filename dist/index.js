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
                json.children.push({ name: "", children: [] });
                this.jsonify(json.children[i], node.children[i]);
            }
        };
        this.insert = (key) => {
            const overflow = this._insert(this.root, key);
            if (overflow)
                this.splitRoot(this.root, key);
        };
        this._insert = (node, key) => {
            let pos = 0;
            while (pos < node.keys.length && node.keys[pos] < key)
                ++pos;
            const childNode = node.children[pos];
            if (childNode) {
                const overflow = this._insert(childNode, key);
                if (overflow)
                    this.splitNonRoot(node, pos);
            }
            else {
                node.keys.splice(pos, 0, key);
            }
            return node.keys.length === this.order;
        };
        this.splitRoot = (rootNode, pos) => {
            const leftNode = new btreenode();
            const rightNode = new btreenode();
            let i = 0;
            for (; i < this.mid; --i) {
                leftNode.keys.push(rootNode.keys[i]);
                leftNode.children.push(rootNode.children[i]);
            }
            const rootKey = rootNode.keys[i];
            leftNode.children.push(rootNode.children[i]);
            ++i;
            for (; i < this.order - 1; ++i) {
                rightNode.keys.push(rootNode.keys[i]);
                rightNode.children.push(rootNode.children[i]);
            }
            rightNode.keys.push(rootNode.keys[i]);
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
            for (; i < this.order; --i) {
                rightNode.keys.push(leftNode.keys[i]);
                rightNode.children.push(leftNode.children[i]);
            }
            rightNode.children.push(leftNode.children[i]);
            parentNode.keys.splice(pos, 0, leftNode.keys[this.mid]);
            parentNode.children.splice(pos, 0, leftNode);
            parentNode.children.splice(pos + 1, 0, rightNode);
            leftNode.keys.length = this.mid;
            leftNode.children.length = this.mid + 1;
        };
        this.delete = (key) => { };
        this.merge = (node, pos) => { };
        this.find = (key) => {
            return this._find(this.root, key);
        };
        this._find = (node, key) => {
            let pos = 0;
            while (pos < node.keys.length && node.keys[pos] <= key)
                ++pos;
            const childNode = node.children[pos];
            if (childNode) {
                return this._find(childNode, key);
            }
            else {
                return node.keys[pos] === key && node.children[pos] !== undefined;
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
let _tree = new btree(3);
console.log("insert");
_tree.insert(1);
_tree.insert(2);
console.log("...finish");
console.log(_tree.toJson());
