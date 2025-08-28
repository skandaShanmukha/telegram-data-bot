class CategorizationEngine {
    constructor() {
        this.semanticMap = new Map();
        this.initializeSemanticMapping();
    }

    initializeSemanticMapping() {
        // Semantic mapping: search terms -> categories
        const semanticMapping = {
            'programming': ['coding', 'code', 'developer', 'programmer', 'software', 'app', 'website', 'web', 'script', 'algorithm', 'backend', 'frontend', 'fullstack', 'dev', 'development'],
            'design': ['design', 'ui', 'ux', 'interface', 'visual', 'graphic', 'art', 'creative', 'layout', 'typography', 'color', 'brand', 'logo'],
            'business': ['business', 'startup', 'company', 'enterprise', 'marketing', 'finance', 'money', 'investment', 'venture', 'capital', 'entrepreneur', 'strategy', 'growth'],
            'devops': ['devops', 'deployment', 'server', 'cloud', 'infrastructure', 'container', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci', 'cd', 'pipeline'],
            'machinelearning': ['ai', 'artificial intelligence', 'ml', 'machine learning', 'neural', 'network', 'deep learning', 'data science', 'dataset', 'training', 'model', 'prediction'],
            'security': ['security', 'hacking', 'cybersecurity', 'pentest', 'firewall', 'encryption', 'privacy', 'authentication', 'security', 'vulnerability', 'malware'],
            'wargames': ['wargame', 'ctf', 'capture the flag', 'hacking challenge', 'security challenge', 'overthewire', 'hackthebox'],
            'education': ['learn', 'education', 'tutorial', 'course', 'free', 'resource', 'learning', 'study', 'training', 'guide', 'tutorial', 'lesson']
        };

        // Build reverse mapping for semantic search
        for (const [category, terms] of Object.entries(semanticMapping)) {
            terms.forEach(term => {
                this.semanticMap.set(term, category);
            });
        }
    }

    // Semantic categorization - understands intent
    categorize(text, userCategory = '') {
        if (userCategory) return userCategory.toLowerCase();

        const tokens = this.tokenize(text);
        const categoryScores = new Map();
        
        for (const token of tokens) {
            // Direct semantic mapping
            if (this.semanticMap.has(token)) {
                const category = this.semanticMap.get(token);
                categoryScores.set(category, (categoryScores.get(category) || 0) + 2); // Higher weight for semantic matches
            }
            
            // Also check for partial matches in existing semantic terms
            for (const [term, category] of this.semanticMap.entries()) {
                if (term.includes(token) || token.includes(term)) {
                    categoryScores.set(category, (categoryScores.get(category) || 0) + 1);
                }
            }
        }

        if (categoryScores.size > 0) {
            return Array.from(categoryScores.entries())
                .sort((a, b) => b[1] - a[1])[0][0];
        }

        return 'general';
    }

    // Semantic search - find categories based on search intent
    findSemanticCategories(searchQuery) {
        const tokens = this.tokenize(searchQuery);
        const matchingCategories = new Set();
        
        for (const token of tokens) {
            for (const [term, category] of this.semanticMap.entries()) {
                if (term.includes(token) || token.includes(term)) {
                    matchingCategories.add(category);
                }
            }
        }
        
        return Array.from(matchingCategories);
    }

    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2);
    }
}

module.exports = CategorizationEngine;
