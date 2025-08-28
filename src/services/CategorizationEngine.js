class CategorizationEngine {
    constructor() {
        this.semanticMap = new Map();
        this.reverseMap = new Map(); // For better search
        this.initializeSemanticMapping();
    }

    initializeSemanticMapping() {
        // Enhanced semantic mapping with better coverage
        const semanticMapping = {
            'programming': [
                'coding', 'code', 'developer', 'programmer', 'software', 
                'app', 'application', 'website', 'web', 'script', 'algorithm',
                'backend', 'frontend', 'fullstack', 'dev', 'development',
                'javascript', 'python', 'java', 'node', 'react', 'vue', 'angular',
                'typescript', 'html', 'css', 'api', 'database', 'sql', 'nosql'
            ],
            'design': [
                'design', 'ui', 'ux', 'interface', 'visual', 'graphic', 'art',
                'creative', 'layout', 'typography', 'color', 'brand', 'logo',
                'illustration', 'photoshop', 'figma', 'sketch', 'prototype',
                'wireframe', 'mockup'
            ],
            'business': [
                'business', 'startup', 'company', 'enterprise', 'marketing',
                'finance', 'money', 'investment', 'venture', 'capital',
                'entrepreneur', 'strategy', 'growth', 'sales', 'customer',
                'product', 'management', 'leadership'
            ],
            'devops': [
                'devops', 'deployment', 'server', 'cloud', 'infrastructure',
                'container', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
                'ci', 'cd', 'pipeline', 'monitoring', 'logging', 'scaling'
            ],
            'machinelearning': [
                'ai', 'artificial intelligence', 'ml', 'machine learning',
                'neural', 'network', 'deep learning', 'data science',
                'dataset', 'training', 'model', 'prediction', 'nlp',
                'computer vision', 'tensorflow', 'pytorch', 'classification'
            ],
            'security': [
                'security', 'hacking', 'cybersecurity', 'pentest', 'firewall',
                'encryption', 'privacy', 'authentication', 'vulnerability',
                'malware', 'phishing', 'security', 'cyber', 'hack', 'breach'
            ],
            'wargames': [
                'wargame', 'ctf', 'capture the flag', 'hacking challenge',
                'security challenge', 'overthewire', 'hackthebox',
                'tryhackme', 'security game', 'challenge'
            ],
            'education': [
                'learn', 'education', 'tutorial', 'course', 'free',
                'resource', 'learning', 'study', 'training', 'guide',
                'tutorial', 'lesson', 'school', 'university', 'college',
                'online course', 'mooc'
            ]
        };

        // Build both forward and reverse mappings
        for (const [category, terms] of Object.entries(semanticMapping)) {
            terms.forEach(term => {
                this.semanticMap.set(term, category);
                // Build reverse map for better search
                if (!this.reverseMap.has(category)) {
                    this.reverseMap.set(category, new Set());
                }
                this.reverseMap.get(category).add(term);
            });
        }
    }

    categorize(text, userCategory = '') {
        if (userCategory && userCategory.trim()) {
            return userCategory.toLowerCase();
        }

        const tokens = this.tokenize(text);
        const categoryScores = new Map();
        
        for (const token of tokens) {
            // Exact matches get highest score
            if (this.semanticMap.has(token)) {
                const category = this.semanticMap.get(token);
                categoryScores.set(category, (categoryScores.get(category) || 0) + 3);
            }
            
            // Partial matches get lower score
            for (const [term, category] of this.semanticMap.entries()) {
                if (term.includes(token) || token.includes(term)) {
                    categoryScores.set(category, (categoryScores.get(category) || 0) + 1);
                }
            }
        }

        return categoryScores.size > 0
            ? Array.from(categoryScores.entries()).sort((a, b) => b[1] - a[1])[0][0]
            : 'general';
    }

    findSemanticCategories(searchQuery) {
        const tokens = this.tokenize(searchQuery);
        const matchingCategories = new Set();
        
        for (const token of tokens) {
            // Check direct matches
            if (this.semanticMap.has(token)) {
                matchingCategories.add(this.semanticMap.get(token));
            }
            
            // Check partial matches
            for (const [term, category] of this.semanticMap.entries()) {
                if (term.includes(token) || token.includes(term)) {
                    matchingCategories.add(category);
                }
            }
        }
        
        return Array.from(matchingCategories);
    }

    // NEW: Get search suggestions for a category
    getCategorySuggestions(category) {
        return this.reverseMap.has(category)
            ? Array.from(this.reverseMap.get(category)).slice(0, 5)
            : [];
    }

    tokenize(text) {
        if (!text) return [];
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }
}

module.exports = CategorizationEngine;
