class TrieNode {
    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.categories = new Set();
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode();
    }

    insert(word, category) {
        let node = this.root;
        for (const char of word.toLowerCase()) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char);
        }
        node.isEndOfWord = true;
        node.categories.add(category);
    }

    search(prefix) {
        let node = this.root;
        const results = new Set();
        
        for (const char of prefix.toLowerCase()) {
            if (!node.children.has(char)) {
                return Array.from(results);
            }
            node = node.children.get(char);
        }
        
        this._collectWords(node, prefix, results);
        return Array.from(results);
    }

    _collectWords(node, currentWord, results) {
        if (node.isEndOfWord) {
            node.categories.forEach(cat => results.add(cat));
        }
        
        for (const [char, childNode] of node.children) {
            this._collectWords(childNode, currentWord + char, results);
        }
    }
}

module.exports = Trie;
