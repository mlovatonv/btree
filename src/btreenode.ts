class btreenode {
  public keys: number[];
  public children: btreenode[];

  constructor() {
    this.keys = [];
    this.children = [];
  }
}
